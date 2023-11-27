import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { DB_ERROR, SUCCESS } from '@/common/constants/code';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { Result } from '@/common/dto/result.type';

import { JwtGqlAuthGuard } from '../auth/auth.guard';
import { ProfileInput, ResetPwdInput, UserDTO, UserInput } from './user.dto';
import { UserService } from './user.service';

@Resolver('User')
@UseGuards(JwtGqlAuthGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserDTO, { description: '新增用户' })
  async create(@Args('params') params: UserInput): Promise<UserDTO> {
    return await this.userService.create(params);
  }

  @Query(() => UserDTO, { description: '使用 ID 查询用户' })
  async findById(@Args('id') id: string): Promise<UserDTO> {
    return await this.userService.findById(id);
  }

  @Query(() => UserDTO, { description: '使用 JWT 中的 userId 查询用户' })
  async getUserByJWT(@JwtUserId() userId: string): Promise<UserDTO> {
    return await this.userService.findById(userId);
  }

  @Mutation(() => Result, { description: '更新用户画像' })
  async updateUserProfile(
    @Args('id') id: string,
    @Args('params') params: ProfileInput,
  ): Promise<Result> {
    const isSuccess = await this.userService.update(id, params);
    if (isSuccess) {
      return {
        code: SUCCESS,
        message: '更新成功',
      };
    }

    return {
      code: DB_ERROR,
      message: '更新失败',
    };
  }
  @Mutation(() => Result, { description: '重置用户密码' })
  async resetPwd(@Args('params') params: ResetPwdInput): Promise<Result> {
    return await this.userService.resetPwd(params);
  }

  @Mutation(() => Boolean, { description: '更新用户' })
  async update(
    @Args('id') id: string,
    @Args('params') params: UserInput,
  ): Promise<boolean> {
    return await this.userService.update(id, params);
  }

  @Mutation(() => Boolean, { description: '删除一个用户' })
  async delete(@Args('id') id: string): Promise<boolean> {
    return await this.userService.delete(id);
  }
}
