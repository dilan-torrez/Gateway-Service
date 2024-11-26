import { Body, Controller, Get, Inject, Logger, Post, Query, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { LoginUserDto } from './dto';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { RecordService } from 'src/records/record.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly recordService: RecordService,
  ) {}

  @Post('login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Query() query: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log({ username: loginUserDto.username });
    try {
      const { longToken } = query;
      let data: any;
      if (longToken) {
        data = await firstValueFrom(
          this.client.send('auth.login', { ...loginUserDto, longToken: true }),
        );
      } else {
        data = await firstValueFrom(this.client.send('auth.login', loginUserDto));
      }
      const timeShort = 4; // 4 horas
      const timeLong = 24 * 365; // horas * dias - 1 año
      const oneHourMiliseconds = 3600000;
      this.logger.log('Login successful');
      this.recordService.http('Inicio de sesion exitosa', data.user.username, 1, 1, 'User');
      res
        .cookie('msp', data.access_token, {
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
          expires: new Date(Date.now() + (longToken ? timeLong : timeShort) * oneHourMiliseconds),
        })
        .status(200)
        .json({
          message: 'Login successful',
          user: data.user,
        });
    } catch (error) {
      this.logger.error(error);
      res.status(401).json({
        error: true,
        message: error.message,
      });
    }
  }

  @Get('logout')
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie('msp', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
    });
    res.status(200).json({
      message: 'Logout successful',
    });
  }
}
