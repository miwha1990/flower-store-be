import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  type: string;

  @Exclude()
  password: string;
}