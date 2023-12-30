import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserDocument, UserSchema } from './model/users.schema';
import { FileService } from '../common/file.service';
import { NotificationsModule } from 'src/notification/notification.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
    EventEmitterModule.forRoot(),
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, FileService],
  exports: [UsersService],
})
export class UsersModule {}
