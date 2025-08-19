import { Injectable } from '@nestjs/common';

@Injectable()
export class SuppliersService {
  async findAll() {
    return { message: 'Suppliers module - coming soon' };
  }
}