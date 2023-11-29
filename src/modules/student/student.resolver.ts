import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ACCOUNT_NOT_EXIST, SUCCESS } from '@/common/constants/code';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { StudentDTO } from './dto/student.dto';
import { StudentService } from './student.service';
import { StudentResultsVO, StudentVO } from './vo/student.vo';

@Resolver(() => StudentVO)
@UseGuards(JwtGqlAuthGuard)
export class StudentResolver {
  constructor(private readonly studentService: StudentService) {}

  @Query(() => StudentVO)
  async getStudentByJWT(@JwtUserId() id: string): Promise<StudentVO> {
    return await this.studentService.findById(id);
  }

  @Mutation(() => ResultVO)
  async commitStudent(
    @JwtUserId() userId: string,
    @Args('params') params: StudentDTO,
  ): Promise<ResultVO> {
    const student = await this.studentService.findById(userId);
    if (student) {
      const res = await this.studentService.updateById(student.id, params);
      if (res) {
        return {
          code: SUCCESS,
          message: '更新成功',
        };
      }
    }
    return {
      code: ACCOUNT_NOT_EXIST,
      message: '账户不存在',
    };
  }

  @Query(() => StudentResultsVO)
  async getStudents(
    @Args('pageInfo') pageInfo: PageInfoDTO,
  ): Promise<StudentResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const [results, total] = await this.studentService.findStudents({
      start: pageNum === 1 ? 0 : (pageNum - 1) * pageSize,
      length: pageSize,
    });
    return {
      code: SUCCESS,
      data: results,
      pageInfo: {
        pageNum,
        pageSize,
        total,
      },
      message: '获取成功',
    };
  }
}
