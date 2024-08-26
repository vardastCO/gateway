import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const IsCacheEnabled = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(ctx);
    const context = gqlContext.getContext();

  
    const request = context.req;
    if (request && request.headers) {
      const cacheControlHeader = request.headers['cache-control'];
      const isCacheEnabled = !cacheControlHeader || cacheControlHeader.trim() !== 'no-cache'; 
      
      return isCacheEnabled;
    }
    
    return true;
  },
);
