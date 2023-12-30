import { Test } from '@nestjs/testing';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { FileService } from '../common/file.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

const mockUsersRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndDelete: jest.fn(),
});

const mockFileService = () => ({
  downloadFile: jest.fn(),
  toBase64: jest.fn(),
  deleteFile: jest.fn(),
  getFilePath: jest.fn(),
});

const mockEventEmitter2 = () => ({
  emit: jest.fn(),
});

const mockUser = {
  _id: '658c5f49e57d90a86b6a55a1',
  email: 'na3er.faraji@gmail.com',
  firstName: 'naser',
  lastName: 'faraji',
};

const mockUserDto = {
  email: 'na3er.faraji@gmail.com',
  avatarUrl: 'url',
  firstName: 'naser',
  lastName: 'faraji',
};
describe('Users Service', () => {
  let usersService: UsersService;
  let usersRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useFactory: mockUsersRepository },
        { provide: FileService, useFactory: mockFileService },
        { provide: EventEmitter2, useFactory: mockEventEmitter2 },
      ],
    }).compile();

    usersService = module.get(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  describe('Create', () => {
    it('calls UsersRepository.create and returns the result', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(mockUser);
      const result = await usersService.create(mockUserDto);
      expect(result).toEqual(mockUser);
    });

    it('calls UsersRepository.create and handeles an error for dupplicate email', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);
      expect(usersService.create(mockUserDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('getUserById', () => {
    it('calls UsersRepository.findOne and returns the result', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);
      const result = await usersService.getUserById('id');
      expect(result).toEqual(mockUser);
    });

    it('calls UsersRepository.findOne and handeles an error', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      expect(usersService.getUserById('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserById', () => {
    it('calls UsersRepository.findOneAndDelete and returns the result', async () => {
      usersRepository.findOneAndDelete.mockResolvedValue(mockUser);
      const result = await usersService.deleteUserById('id');
      expect(result).toEqual(mockUser);
    });

    it('calls UsersRepository.findOneAndDelete and handeles an error for not found user id', async () => {
      usersRepository.findOneAndDelete.mockResolvedValue(null);
      expect(usersService.deleteUserById('id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
