import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { LoginUserDto, RegisterUserDto } from './dto';
import { catchError } from 'rxjs';
import { AuthGuard } from './guards/auth.guard';
import { Token, User } from './decorators';
import { CurrentUser } from './interfaces/current-user.interface';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.client.send('auth.register.user', registerUserDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    console.log(loginUserDto);
    return this.client.send('auth.login', loginUserDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('redirect')
  redirectToFrontend1(@Res() res: Response) {
    // return res.redirect('http://localhost:3002');
    res.status(302).setHeader('Location', 'http://localhost:3002').json({
      message: 'Redirecting to frontend',
      url: 'http://localhost:3002', // Opcional, por si quieres enviar la URL en el cuerpo
    });
  }

  @Get('test')
  test() {
    return 'hola';
  }

  @UseGuards(AuthGuard)
  @Get('verify')
  verifyToken(@User() user: CurrentUser, @Token() token: string) {
    // const user = req['user'];
    // const token = req['token'];

    // return this.client.send('auth.verify.user', {});
    return { user, token };
  }
}
