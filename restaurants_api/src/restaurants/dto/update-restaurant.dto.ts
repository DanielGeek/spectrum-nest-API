import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Category } from '../schemas/restaurant.schema';

export class UpdateRestaurantDto {
  @IsString()
  @IsOptional()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description: string;

  @IsEmail({}, { message: 'Please enter correct email address' })
  @IsOptional()
  readonly email: string;

  // @IsPhoneNumber('VE')
  @Matches(/^\+?(58|1)[0-9]{10}$/, {
    message: 'Phone number must be from Venezuela (+58) or USA (+1)',
  })
  @IsOptional()
  readonly phoneNo: string;

  @IsString()
  @IsOptional()
  readonly address: string;

  @IsEnum(Category, { message: 'Please enter correct category' })
  @IsOptional()
  readonly category: Category;
}
