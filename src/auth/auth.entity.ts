import { ApiProperty } from '@nestjs/swagger';

export class AuthToken {
  @ApiProperty({ example: '6af7781e-eb86-4cde-80e2-5ec8f9f2f0c7' })
  access_token: string;
}
