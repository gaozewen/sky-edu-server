import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { DB_ERROR, SUCCESS } from '@/common/constants/code';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { SMSService } from '../sms/sms.service';
import { ProfileDTO, ResetPwdDTO } from './dto/user.dto';
import { UserService } from './user.service';
import { UserVO } from './vo/user.vo';

@Resolver('User')
@UseGuards(JwtGqlAuthGuard)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly smsService: SMSService,
  ) {}

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
    const { id, tel, code, password } = params;
    // 1.验证码有效性校验
    const codeValidRes = await this.smsService.verifyCodeByTel(code, tel);
    //   校验不通过
    if (codeValidRes.code !== SUCCESS) {
      return codeValidRes;
    }
    // 2.更新密码
    const isSuccess = await this.userService.update(id, { password });
    if (isSuccess) {
      return {
        code: SUCCESS,
        message: '修改成功',
      };
    }

    return {
      code: DB_ERROR,
      message: '服务器忙，修改失败，请稍后再试',
    };
  }
}
