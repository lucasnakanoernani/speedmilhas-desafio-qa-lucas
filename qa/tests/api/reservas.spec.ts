import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('Não permitir listar reservas sem identificar a agência', async ({
  request,
}) => {
  // Envia a consulta sem o cabeçalho x-client-id.
  const resposta = await request.get('http://localhost:3000/orders');

  // A SPEC exige 401 quando a agência não é informada.
  expect(resposta.status()).toBe(401);
});

test('Recusar reserva sem nome do passageiro', async ({ request }) => {
  const api = 'http://localhost:3000';

  // Prepara uma data futura para buscar ofertas.
  const dataIda = new Date();
  dataIda.setDate(dataIda.getDate() + 7);
  const dataBusca = dataIda.toISOString().slice(0, 10);

  // Busca uma oferta válida para preparar a tentativa de reserva.
  const busca = await request.post(`${api}/search`, {
    data: {
      origin: 'GIG',
      destination: 'GRU',
      date: dataBusca,
    },
  });

  expect(busca.status()).toBe(200);

  const resultado: {
    quotes: { id: string; bookable: boolean }[];
  } = await busca.json();

  const oferta = resultado.quotes.find((item) => item.bookable);

  if (!oferta) {
    throw new Error('Preparação falhou: nenhuma oferta reservável retornada.');
  }

  // Informa a agência e a oferta, mas omite o nome do passageiro.
  const resposta = await request.post(`${api}/orders`, {
    headers: {
      'x-client-id': 'alfa-turismo',
    },
    data: {
      quoteId: oferta.id,
      passageiro: {},
      idempotencyKey: randomUUID(),
    },
  });

  const corpo = await resposta.json();

  // Ajuda a investigar caso o resultado seja diferente do esperado.
  console.log('Status da reserva:', resposta.status());
  console.log('Resposta da reserva:', corpo);

  expect(resposta.status()).toBe(400);

  // A mensagem deve explicar o problema com o passageiro/nome.
  expect(corpo.error.message).toMatch(/nome|name|passageiro|passenger/i);
});

test('Retornar a mesma reserva ao repetir a mesma chave', async ({
  request,
}) => {
  const api = 'http://localhost:3000';
  const headers = {
    'x-client-id': 'alfa-turismo',
  };

  const dataIda = new Date();
  dataIda.setDate(dataIda.getDate() + 8);

  // Obtém uma oferta reservável.
  const busca = await request.post(`${api}/search`, {
    data: {
      origin: 'GIG',
      destination: 'GRU',
      date: dataIda.toISOString().slice(0, 10),
    },
  });

  expect(busca.status()).toBe(200);

  const resultado: {
    quotes: { id: string; bookable: boolean }[];
  } = await busca.json();

  const oferta = resultado.quotes.find((item) => item.bookable);

  if (!oferta) {
    throw new Error('Preparação falhou: nenhuma oferta reservável retornada.');
  }

  // Gera a chave uma única vez para usar nas duas chamadas.
  const dadosReserva = {
    quoteId: oferta.id,
    passageiro: {
      nome: 'Teste Idempotencia QA',
    },
    idempotencyKey: randomUUID(),
  };

  // Primeira tentativa: cria a reserva.
  const primeira = await request.post(`${api}/orders`, {
    headers,
    data: dadosReserva,
  });

  expect(primeira.status()).toBe(201);

  const reservaOriginal = await primeira.json();
  expect(reservaOriginal.id).toEqual(expect.any(String));

  // Repete exatamente a mesma tentativa, com a mesma chave.
  const repeticao = await request.post(`${api}/orders`, {
    headers,
    data: dadosReserva,
  });

  expect(repeticao.status()).toBe(201);

  const reservaRepetida = await repeticao.json();

  // Deve devolver a reserva original e identificar a repetição.
  expect(reservaRepetida.id).toBe(reservaOriginal.id);
  expect(repeticao.headers()['idempotent-replay']).toBe('true');
});

test('Impedir que Beta consulte uma reserva da Alfa', async ({
  request,
}) => {
  const api = 'http://localhost:3000';

  const dataIda = new Date();
  dataIda.setDate(dataIda.getDate() + 9);

  // Busca uma oferta para criar uma reserva independente.
  const busca = await request.post(`${api}/search`, {
    data: {
      origin: 'GIG',
      destination: 'GRU',
      date: dataIda.toISOString().slice(0, 10),
    },
  });

  expect(busca.status()).toBe(200);

  const resultado: {
    quotes: { id: string; bookable: boolean }[];
  } = await busca.json();

  const oferta = resultado.quotes.find((item) => item.bookable);

  if (!oferta) {
    throw new Error('Preparação falhou: nenhuma oferta reservável retornada.');
  }

  // Cria a reserva pertencente à Alfa.
  const criacao = await request.post(`${api}/orders`, {
    headers: {
      'x-client-id': 'alfa-turismo',
    },
    data: {
      quoteId: oferta.id,
      passageiro: {
        nome: 'Teste Isolamento QA',
      },
      idempotencyKey: randomUUID(),
    },
  });

  expect(criacao.status()).toBe(201);

  const reserva = await criacao.json();

  expect(reserva.id).toEqual(expect.any(String));
  expect(reserva.clientId).toBe('alfa-turismo');

  // Confirma que a agência proprietária consegue consultar.
  const consultaAlfa = await request.get(`${api}/orders/${reserva.id}`, {
    headers: {
      'x-client-id': 'alfa-turismo',
    },
  });

  expect(consultaAlfa.status()).toBe(200);

  // Tenta consultar a mesma reserva identificando-se como Beta.
  const consultaBeta = await request.get(`${api}/orders/${reserva.id}`, {
    headers: {
      'x-client-id': 'beta-viagens',
    },
  });

  console.log('ID da reserva da Alfa:', reserva.id);
  console.log('Agência enviada na consulta: beta-viagens');
  console.log('Status da consulta pela Beta:', consultaBeta.status());
  console.log('Resposta da consulta pela Beta:', await consultaBeta.json());

  // A SPEC exige 404 para uma reserva de outra agência.
  expect(consultaBeta.status()).toBe(404);
});