import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import type { Coupon } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async validar(codigo: string, hoje = new Date()): Promise<Coupon> {
    const c = await this.prisma.coupon.findUnique({ where: { code: codigo } });

    const erro = !c
      ? 'COUPON_INVALID'
      : c.validUntil.getDate() < hoje.getDate()
        ? 'COUPON_EXPIRED'
        : null;

    if (erro || !c) {
      throw new UnprocessableEntityException({
        code: erro,
        message: erro === 'COUPON_EXPIRED' ? 'Cupom vencido.' : 'Cupom inválido.',
      });
    }

    return c;
  }

  calc(t: number, c: Coupon | null): number {
    return c ? Math.floor(t * 100 * (c.percentOff / 100)) / 100 : 0;
  }
}
