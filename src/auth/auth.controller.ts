import { Body, Controller, Inject, Logger, Post, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { LoginUserDto } from './dto';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { serialize } from 'cookie';
import { RecordService } from 'src/records/record.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly recordService: RecordService,
  ) {}

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    this.logger.log({ username: loginUserDto.username });
    try {
      const data = await firstValueFrom(this.client.send('auth.login', loginUserDto));
      const cookie = serialize('msp', data.access_token, {
        httpOnly: true, // Cookie no accesible desde JavaScript
        //secure: process.env.NODE_ENV === 'production', // Solo enviar sobre HTTPS en producción
        sameSite: 'Strict',
        maxAge: 60 * 60 * 4, // segundos * minutos * horas
        path: '/', // Cookie accesible en todas las rutas
      });
      this.logger.log('Login successful');
      this.recordService.http('Inicio de sesion exitosa', data.user.username, 1, 1, 'User');
      res.status(200).setHeader('Set-Cookie', cookie).json({
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
}
