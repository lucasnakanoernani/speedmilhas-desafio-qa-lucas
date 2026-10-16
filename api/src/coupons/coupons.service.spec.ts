import { CouponsService } from './coupons.service';

const cupons = {
  SPEED10: { code: 'SPEED10', percentOff: 10, validUntil: new Date('2099-12-31T23:59:59Z') },
  VERAO25: { code: 'VERAO25', percentOff: 25, validUntil: new Date('2026-03-31T23:59:59Z') },
};

const prisma = {
  coupon: {
    findUnique: ({ where }: { where: { code: keyof typeof cupons } }) =>
      Promise.resolve(cupons[where.code] ?? null),
  },
};

describe('CouponsService', () => {
  const service = new CouponsService(prisma as never);

  it('aceita cupom válido', async () => {
    const cupom = await service.validar('SPEED10');

    expect(cupom.percentOff).toBe(10);
  });

  it('recusa cupom vencido', async () => {
    await expect(service.validar('VERAO25', new Date('2026-10-15T12:00:00Z'))).rejects;
  });

  it('recusa cupom inexistente', async () => {
    await expect(service.validar('NAOEXISTE')).rejects.toThrow('Cupom inválido.');
  });

  it('calcula 10% de desconto sobre a taxa de serviço', () => {
    expect(service.calc(12.65, cupons.SPEED10 as never)).toBe(1.26);
  });
});
