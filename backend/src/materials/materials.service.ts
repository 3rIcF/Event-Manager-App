import { Injectable } from '@nestjs/common';

@Injectable()
export class MaterialsService {
  async findAll() {
    return { message: 'Materials module - coming soon' };
  }
}