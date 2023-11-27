import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { DB_ERROR, SUCCESS } from '@/common/constants/code';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { ProfileDTO, ResetPwdDTO, UserDTO } from './dto/user.dto';
import { UserService } from './user.service';
import { UserVO } from './vo/user.vo';

@Resolver('User')
@UseGuards(JwtGqlAuthGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserVO, { description: '新增用户' })
  async create(@Args('params') params: UserDTO): Promise<UserVO> {
    return await this.userService.create(params);
  }

  @Query(() => UserVO, { description: '使用 ID 查询用户' })
  async findById(@Args('id') id: string): Promise<UserVO> {
    return await this.userService.findById(id);
  }

  @Query(() => UserVO, { description: '使用 JWT 中的 userId 查询用户' })
  async getUserByJWT(@JwtUserId() userId: string): Promise<UserVO> {
    return await this.userService.findById(userId);
  }

  @Mutation(() => ResultVO, { description: '更新用户画像' })
  async updateUserProfile(
    @Args('id') id: string,
    @Args('params') params: ProfileDTO,
  ): Promise<ResultVO> {
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
  @Mutation(() => ResultVO, { description: '重置用户密码' })
  async resetPwd(@Args('params') params: ResetPwdDTO): Promise<ResultVO> {
    return await this.userService.resetPwd(params);
  }

  @Mutation(() => Boolean, { description: '更新用户' })
  async update(
    @Args('id') id: string,
    @Args('params') params: UserDTO,
  ): Promise<boolean> {
    return await this.userService.update(id, params);
  }

  @Mutation(() => Boolean, { description: '删除一个用户' })
  async delete(@Args('id') id: string): Promise<boolean> {
    return await this.userService.delete(id);
  }
}
