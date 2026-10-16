# PR: Cupom de desconto na reserva

**Branch:** `feature/cupom-desconto` → `main`

## Contexto

O comercial quer distribuir cupons para as agências parceiras. Este PR adiciona o cupom
no `POST /orders`. A tela vem num PR separado.

## Regras

- O cupom é opcional e vai no corpo do pedido, no campo `cupom`.
- O código não diferencia maiúsculas de minúsculas (`speed10` = `SPEED10`).
- O desconto é um percentual **sobre a taxa de serviço**, arredondado para baixo ao centavo.
  Ele não incide sobre as milhas nem sobre a taxa de embarque.
- O cupom vale até a data e a hora de `validUntil`, inclusive.
- Cupom inexistente → `422` com `code: COUPON_INVALID`.
- Cupom vencido → `422` com `code: COUPON_EXPIRED`.
- A resposta da reserva passa a trazer `total.discountBrl` e `total.couponCode`, e o
  `total.totalBrl` já sai com o desconto aplicado.

## O que muda

- Tabela `Coupon` com dois cupons de exemplo: `SPEED10` (10%, válido) e `VERAO25` (25%,
  venceu em 31/03/2026).
- `Order` ganha `couponCode` e `discountBrl`.
- `CouponsService` valida o cupom e calcula o desconto.
- O cupom entra no hash de idempotência: a mesma chave com outro cupom é outro pedido.

## Como testar

```bash
docker compose up --build

# reserva com cupom válido
curl -X POST http://localhost:3000/orders \
  -H 'content-type: application/json' -H 'x-client-id: alfa-turismo' \
  -d '{"quoteId":"<id>","passageiro":{"nome":"Ana"},"idempotencyKey":"k-1","cupom":"speed10"}'
```

Testes unitários em `api/src/coupons/coupons.service.spec.ts`. O cenário do cupom vencido está coberto.

```bash
cd api
cp .env.example .env
npm install
npx prisma generate
npm test
```
