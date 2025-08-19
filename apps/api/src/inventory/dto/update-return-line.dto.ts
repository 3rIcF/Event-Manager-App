import { PartialType } from '@nestjs/mapped-types';
import { CreateReturnLineDto } from './create-return-line.dto';

export class UpdateReturnLineDto extends PartialType(CreateReturnLineDto) {}
