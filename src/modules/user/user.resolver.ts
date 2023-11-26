import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { DB_ERROR, SUCCESS } from '@/common/constants/code';
import { Result } from '@/common/dto/result.type';

import { JwtGqlAuthGuard } from '../auth/auth.guard';
import { ProfileInput, UserDTO, UserInput } from './user.dto';
import { UserService } from './user.service';

@Resolver('User')
@UseGuards(JwtGqlAuthGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => Boolean, { description: '新增用户' })
  async create(@Args('params') params: UserInput): Promise<boolean> {
    return await this.userService.create(params);
  }

  @Query(() => UserDTO, { description: '使用 ID 查询用户' })
  async findById(@Args('id') id: string): Promise<UserDTO> {
    return await this.userService.findById(id);
  }

  @Query(() => UserDTO, { description: '使用 JWT 中的 userId 查询用户' })
  async getUserByJWT(@Context() cxt: any): Promise<UserDTO> {
    const id = cxt.req.user.id;
    return await this.userService.findById(id);
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
