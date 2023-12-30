import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { FileService } from '../common/file.service';
import { extname } from 'path';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserOutputDto } from './dto/user-output.dto';
import { UserDocument } from './model/users.schema';
import { mapToUserOutputDto } from './mapper';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly fileService: FileService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserOutputDto> {
    await this.validateCreateUserDto(createUserDto);

    const fileName = `${uuid.v4()}${extname(createUserDto.avatarUrl)}`;
    const filePath = this.fileService.getFilePath(fileName);
    await this.fileService.downloadFile(createUserDto.avatarUrl, filePath);
    const base64Avatar = this.fileService.toBase64(filePath);

    const user = await this.usersRepository.create({
      ...createUserDto,
      avatar: base64Avatar,
      fileName: fileName,
    });

    //trigger an event to send a rabbit message
    this.eventEmitter.emit('rabbit.user.welcome', {
      userId: user._id,
      email: user.email,
    });

    //trigger an event to send an email
    this.eventEmitter.emit('email.user.welcome', {
      email: user.email,
      text: `'welcome ${user.email}`,
    });

    return mapToUserOutputDto(user);
  }

  async validateCreateUserDto(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.findOne({
      email: createUserDto.email,
    });

    if (user) throw new UnprocessableEntityException('Email already exists');
  }

  async getUserById(id: string): Promise<UserDocument> {
    const user = await this.usersRepository.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException('User with given id was not found');
    }

    return user;
  }

  async getSimpleUserById(id: string): Promise<UserOutputDto> {
    const user = await this.getUserById(id);
    return mapToUserOutputDto(user);
  }

  async getAvatarHashed(userId: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(userId, salt);
  }

  async deleteUserById(id: string): Promise<UserDocument> {
    const user = await this.usersRepository.findOneAndDelete({ _id: id });

    if (!user) {
      throw new NotFoundException('User with given id was not found');
    }

    const filePath = await this.fileService.getFilePath(user.fileName);
    this.fileService.deleteFile(filePath);

    return user;
  }
}
