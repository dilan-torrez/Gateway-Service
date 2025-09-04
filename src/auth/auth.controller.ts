import { Body, Controller, Get, Logger, Post, Res, UseGuards, Req, Delete } from '@nestjs/common';
import { LoginUserDto } from './dto';
import { Response } from 'express';
import { NatsService, RecordService } from 'src/common';
import { CurrentUser } from './interfaces/current-user.interface';
import { ApiBody, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthAppMobileGuard } from 'src/auth/guards';

@ApiTags('authentications')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');
  constructor(
    private readonly nats: NatsService,
    private readonly recordService: RecordService,
  ) {}

  @ApiOperation({ summary: 'Auth Web' })
  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    this.logger.log({ username: loginUserDto.username });
    try {
      const data: CurrentUser = await this.nats.firstValue('auth.login', loginUserDto);
      const timeShort = 4; // 4 horas
      const oneHourMiliseconds = 3600000;
      this.logger.log('Login successful');
      if (data.user.username != 'pvtbe') {
        this.recordService.http('Inicio de sesion exitosa', data.user.username, 1, 1, 'User');
      }
      res
        .cookie('msp', data.access_token, {
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
          expires: new Date(Date.now() + timeShort * oneHourMiliseconds),
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

  @ApiOperation({ summary: 'Auth Web' })
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

  @ApiOperation({ summary: 'Auth AppMobile' })
  @ApiResponse({ status: 200, description: 'Login AppMobile' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'numeroCI' },
        cellphone: { type: 'string', example: '71931166' },
        signature: { type: 'string', example: 'firma' },
        firebaseToken: { type: 'string', example: 'token' },
        isBiometric: { type: 'boolean', example: 'true' },
        isRegisterCellphone: { type: 'boolean', example: 'false' },
      },
    },
  })
  @Post('loginAppMobile')
  async loginAppMobile(@Body() body: any) {
    this.nats.emit('appMobile.record.create', {
      action: 'loginAppMobile',
      description: 'Intento de inicio de sesión en App Móvil',
      metadata: {
        username: body.username,
        cellphone: body.cellphone,
        isBiometric: body.isBiometric,
        isRegisterCellphone: body.isRegisterCellphone,
      },
    });
    const response = await this.nats.firstValue('auth.loginAppMobile', body);
    const { error, message, data } = response;
    
    if (!('messageId' in response) && !error) {
      this.nats.emit('appMobile.record.create', {
        action: 'loginAppMobile',
        description: message,
        metadata: {
          username: body.username,
          isPolice: data.information.isPolice,
          affiliateId: data.information.affiliateId,
        },
      });
    }

    return response;
  }

  @ApiOperation({ summary: 'Auth AppMobile' })
  @ApiResponse({ status: 200, description: 'Verificar pin SMS y crear token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pin: { type: 'string', example: '1234' },
        messageId: { type: 'string', example: '99999' },
      },
    },
  })
  @Post('verifyPin')
  async verifyPin(@Body() body: any) {
    
    const response = await this.nats.firstValue('auth.verifyPin', body);
    const { error, message, data } = response;
    
    if (!error) {
      this.nats.emit('appMobile.record.create', {
        action: 'verifyPin',
        description: message,
        metadata: {
          username: data.information.username,
          isPolice: data.information.isPolice,
          affiliateId: data.information.affiliateId,
        },
      });
    }
    return response;
  }

  @ApiOperation({ summary: 'Auth AppMobile' })
  @ApiResponse({ status: 200, description: 'Eliminar sesión' })
  @Delete('logoutAppMobile')
  @UseGuards(AuthAppMobileGuard)
  async logoutAppMobile(@Req() req: any) {
    this.nats.emit('appMobile.record.create', {
      action: 'logoutAppMobile',
      description: 'Cierre de sesión en App Móvil',
      metadata: req.user,
    });
    return await this.nats.firstValue('auth.logoutAppMobile', req.user);
  }
}
