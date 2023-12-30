import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { NotifyEmailDto } from './dto/notify-email.dto';
import { ClientProxy } from '@nestjs/microservices';
import { NotifyRabbitDto } from './dto/notify-rabbit.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('RMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  private readonly transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'oauth2',
      user: this.configService.get('SMTP_USER'),
      clientId: this.configService.get('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: this.configService.get('GOOGLE_OAUTH_CLIENT_SECRET'),
      refreshToken: this.configService.get('GOOGLE_OAUTH_REFRESH_TOKEN'),
    },
  });

  @OnEvent('email.user.welcome')
  async notifyEmail({ email, text }: NotifyEmailDto) {
    console.log(`sending an email to ${email}`);
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_USER'),
        to: email,
        subject: 'Welcome to payever',
        text,
      });
    } catch (error) {
      console.log('an error accured in sending email', error.message);
    }
  }

  @OnEvent('rabbit.user.welcome')
  async PublishRabbitMessage({ id, email }: NotifyRabbitDto) {
    console.log(`sending a rabbit message`);
    try {
      const result = this.client.send(
        { cmd: 'create-user-data' },
        {
          userId: id,
          email: email,
        },
      );
      result.subscribe();
    } catch (error) {
      console.log(
        'an error accured in sending message to rabbit',
        error.message,
      );
    }
  }
}
