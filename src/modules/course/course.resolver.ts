import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOptionsWhere, Like } from 'typeorm';

import { COURSE_NOT_EXIST, DB_ERROR, SUCCESS } from '@/common/constants/code';
import { CurStoreId } from '@/common/decorators/CurStoreId.decorator';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { CourseService } from './course.service';
import { PartialCourseDTO } from './dto/course.dto';
import { Course } from './models/course.entity';
import { CourseResultsVO, CourseResultVO, CourseVO } from './vo/course.vo';

@Resolver(() => CourseVO)
@UseGuards(JwtGqlAuthGuard)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query(() => CourseResultVO)
  async getCourse(@Args('id') id: string): Promise<CourseResultVO> {
    const result = await this.courseService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '获取成功',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '课程信息不存在',
    };
  }

  @Mutation(() => ResultVO)
  async commitCourse(
    @Args('params') params: PartialCourseDTO,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<ResultVO> {
    const { teacherIds } = params;
    const teachers =
      teacherIds && teacherIds.length > 0
        ? teacherIds.map((i) => ({ id: i }))
        : [];
    if (!id) {
      const res = await this.courseService.create({
        ...params,
        createdBy: userId,
        store: {
          id: storeId,
        },
        // 传了 teacherIds 参数，才创建 teachers
        ...(teacherIds ? { teachers } : {}),
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
    const course = await this.courseService.findById(id);
    if (course) {
      const res = await this.courseService.updateById(course.id, {
        ...params,
        updatedBy: userId,
        // 传了 teacherIds 参数，才更新 teachers
        ...(teacherIds ? { teachers } : {}),
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
      code: COURSE_NOT_EXIST,
      message: '课程信息不存在',
    };
  }

  @Query(() => CourseResultsVO)
  async getCourses(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<CourseResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<Course> = {
      createdBy: userId,
      store: {
        id: storeId,
      },
    };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    const [results, total] = await this.courseService.findCourses({
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
  async deleteCourse(
    @Args('id') id: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const result = await this.courseService.findById(id);
    if (result) {
      const delRes = await this.courseService.deleteById(id, userId);
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
      code: COURSE_NOT_EXIST,
      message: '课程信息不存在',
    };
  }
}
