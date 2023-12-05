import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// 当前选中的门店 ID
export const CurStoreId = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const storeId = ctx.getContext().req.headers.storeid;
    return storeId;
  },
);
