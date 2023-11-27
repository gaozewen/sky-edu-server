import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ClassType } from 'type-graphql';

/**
 * 返回数据接口规范
 * {
 *   code: 200, // 10001, 10002
 *   data: [], // {}
 *   message: 'error msg',
 *   // 分页信息
 *   pageInfo: {
 *     pageNum: 1,
 *     pageSize: 10,
 *     total: 100,
 *   },
 * }
 */

@ObjectType()
export class ResultVO {
  @Field(() => Int)
  code: number;
  @Field(() => String, { nullable: true })
  message?: string;
  @Field(() => String, { nullable: true })
  data?: string;
}

export interface IResult<T> {
  code: number;
  message?: string;
  data?: T;
}

export interface IResults<T> {
  code: number;
  message?: string;
  data?: T[];
  pageInfo?: PageInfoVO;
}

@ObjectType()
export class PageInfoVO {
  @Field(() => Int)
  total: number;
  @Field(() => Int)
  pageNum?: number;
  @Field(() => Int)
  pageSize?: number;
}

// 生成 GraphQL ResultVO
export const createGQLResultVO = <T>(
  ItemType: ClassType<T>,
): ClassType<IResult<T>> => {
  @ObjectType()
  class ResultVO {
    @Field(() => Int)
    code: number;
    @Field(() => String, { nullable: true })
    message?: string;
    @Field(() => ItemType, { nullable: true })
    data?: T;
  }
  return ResultVO;
};

// 生成 GraphQL ResultsVO
export const createGQLResultsVO = <T>(
  ItemType: ClassType<T>,
): ClassType<IResults<T>> => {
  @ObjectType()
  class ResultsVO {
    @Field(() => Int)
    code: number;
    @Field(() => String, { nullable: true })
    message?: string;
    @Field(() => [ItemType], { nullable: true })
    data?: T[];
    @Field(() => PageInfoVO, { nullable: true })
    pageInfo?: PageInfoVO;
  }
  return ResultsVO;
};
