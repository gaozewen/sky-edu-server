import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOptionsWhere, Like } from 'typeorm';

import {
  ACCOUNT_EXIST,
  DB_ERROR,
  SUCCESS,
  TEACHER_NOT_EXIST,
} from '@/common/constants/code';
import { CurStoreId } from '@/common/decorators/CurStoreId.decorator';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { TeacherDTO } from './dto/teacher.dto';
import { Teacher } from './models/teacher.entity';
import { TeacherService } from './teacher.service';
import { TeacherResultsVO, TeacherResultVO, TeacherVO } from './vo/teacher.vo';

@Resolver(() => TeacherVO)
@UseGuards(JwtGqlAuthGuard)
export class TeacherResolver {
  constructor(private readonly teacherService: TeacherService) {}

  @Query(() => TeacherResultVO)
  async getTeacher(@Args('id') id: string): Promise<TeacherResultVO> {
    const result = await this.teacherService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '获取成功',
      };
    }
    return {
      code: TEACHER_NOT_EXIST,
      message: '教师信息不存在',
    };
  }

  @Mutation(() => ResultVO)
  async commitTeacher(
    @Args('params') params: TeacherDTO,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<ResultVO> {
    const teacher = await this.teacherService.findByAccount(params.account);

    if (!id) {
      if (teacher) {
        return {
          code: ACCOUNT_EXIST,
          message: '账户名已存在，请使用其他账户名称',
        };
      }
      const res = await this.teacherService.create({
        ...params,
        createdBy: userId,
        store: {
          id: storeId,
        },
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '创建成功',
        };
      }
      return {
        code: DB_ERROR,
        message: '创建失败',
      };
    }

    if (teacher) {
      const res = await this.teacherService.updateById(teacher.id, {
        ...params,
        updatedBy: userId,
      });
      if (res) {
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
    return {
      code: TEACHER_NOT_EXIST,
      message: '教师信息不存在',
    };
  }

  @Query(() => TeacherResultsVO)
  async getTeachers(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<TeacherResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<Teacher> = {
      createdBy: userId,
      store: {
        id: storeId,
      },
    };
    if (name) {
      where.nickname = Like(`%${name}%`);
    }
    const [results, total] = await this.teacherService.findTeachers({
      start: pageNum === 1 ? 0 : (pageNum - 1) * pageSize,
      length: pageSize,
      where,
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

  @Mutation(() => ResultVO)
  async deleteTeacher(
    @Args('id') id: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const result = await this.teacherService.findById(id);
    if (result) {
      const delRes = await this.teacherService.deleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: '删除成功',
        };
      }
      return {
        code: DB_ERROR,
        message: '删除失败',
      };
    }
    return {
      code: TEACHER_NOT_EXIST,
      message: '教师信息不存在',
    };
  }
}
