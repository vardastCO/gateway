import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const graphqlContext = GqlExecutionContext.create(context);
    const { user } = graphqlContext.getContext().req;
    return user;
  },
);
