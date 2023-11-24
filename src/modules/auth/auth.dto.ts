import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class UserInput {
  @Field()
  account: string;
  @Field()
  username: string;
  @Field()
  desc: string;
}

@ObjectType()
export class UserDTO {
  @Field()
  readonly id?: string;

  @Field()
  readonly username?: string;

  @Field()
  readonly desc?: string;

  @Field({ description: '账户信息' })
  readonly account?: string;
}
