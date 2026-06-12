import { IsEmail, IsString, MinLength, IsOptional, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiPropertyOptional({ enum: ["full", "course_only"], default: "full" })
  @IsOptional()
  @IsIn(["full", "course_only"])
  accountType?: string;
}