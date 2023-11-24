import { Controller, Get } from '@nestjs/common';
import { SMSService } from './sms.service';

@Controller()
export class SMSController {
  constructor(private readonly smsService: SMSService) {}

  @Get('/sms')
  async create(): Promise<boolean> {
    return await this.smsService.sendAuthSMS('13815013866', 1234);
  }
}
