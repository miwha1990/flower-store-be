import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntPipe2 implements PipeTransform<string, number> {
  transform(value: string) {
    const val = parseInt(value);
    if (isNaN(val)) {
      throw new BadRequestException('Validation falied');
    }
    return val;
  }
}
