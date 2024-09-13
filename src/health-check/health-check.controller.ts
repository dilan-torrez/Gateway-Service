import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HealthCheckController {

  @Get()
  healthCheck() {
    return 'Microservice Gateway is up and running!!';
  }

}
