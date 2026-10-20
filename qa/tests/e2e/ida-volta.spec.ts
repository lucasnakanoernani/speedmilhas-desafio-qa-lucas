import { test, expect } from '@playwright/test';

test('Reservar passagens de ida e volta', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('link', {
      name: 'Speed Milhas',
      exact: true,
    })
  ).toBeVisible();

  // Mantém os seletores que funcionaram no primeiro teste.
  await page
    .getByLabel('AgênciaAlfa TurismoBeta')
    .selectOption('alfa-turismo');

  // Seleciona ida e volta.
  const modalidade = page.getByRole('radio', {
    name: 'Ida e volta',
    exact: true,
  });

  await modalidade.check();
  await expect(modalidade).toBeChecked();

  // Ida: GIG → GRU.
  await page
    .getByLabel('OrigemGRU — São Paulo —')
    .selectOption('GIG');

  await page
    .getByLabel('DestinoSelecione o destinoGRU')
    .selectOption('GRU');

  // Data da ida.
  await page.getByRole('button', {
    name: 'Ida',
    exact: true,
  }).click();

  await page.getByRole('button', {
    name: '28 de outubro de 2026',
    exact: true,
  }).click();

  // Data da volta.
  await page.getByRole('button', {
    name: 'Volta',
    exact: true,
  }).click();

  await page.getByRole('button', {
    name: '30 de outubro de 2026',
    exact: true,
  }).click();

  await page.getByRole('button', {
    name: 'Buscar passagens',
    exact: true,
  }).click();

  // Localiza separadamente os resultados dos dois trechos.
  const ida = page.getByRole('region', {
    name: 'Ida',
    exact: true,
  });

  const volta = page.getByRole('region', {
    name: 'Volta',
    exact: true,
  });

  // Aguarda uma oferta reservável em cada trecho.
  await expect(
    ida.getByRole('link', {
      name: 'Reservar',
      exact: true,
    }).first()
  ).toBeVisible({ timeout: 20_000 });

  await expect(
    volta.getByRole('link', {
      name: 'Reservar',
      exact: true,
    }).first()
  ).toBeVisible({ timeout: 20_000 });

    //RESERVA DA IDA

  await ida.getByRole('link', {
    name: 'Reservar',
    exact: true,
  }).first().click();

  await page.getByRole('textbox', {
    name: 'Nome do passageiro',
  }).fill('Teste Passageiro QA');

  await page.getByRole('button', {
    name: 'Continuar',
    exact: true,
  }).click();

  // Registra a espera antes de confirmar.
  const respostaIda = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/orders' &&
    response.request().method() === 'POST'
  );

  await page.getByRole('button', {
    name: 'Confirmar reserva',
    exact: true,
  }).click();

  const retornoIda = await respostaIda;

  expect(retornoIda.status()).toBe(201);

  const reservaIda = await retornoIda.json();

  expect(reservaIda.clientId).toBe('alfa-turismo');
  expect(reservaIda.passageiro.nome).toBe('Teste Passageiro QA');

  expect(reservaIda.trecho).toEqual({
    origin: 'GIG',
    destination: 'GRU',
    date: '2026-10-28',
  });

  await expect(
    page.getByRole('heading', {
      name: 'Reserva confirmada',
      exact: true,
    })
  ).toBeVisible();

  // Retorna à busca para selecionar a volta.
  await page.getByRole('link', {
    name: 'Buscar outra passagem',
    exact: true,
  }).click();

  // RESERVA DA VOLTA

  const ofertaVolta = volta.getByRole('link', {
    name: 'Reservar',
    exact: true,
  }).first();

  await expect(ofertaVolta).toBeVisible({
    timeout: 20_000,
  });

  await ofertaVolta.click();

  await page.getByRole('textbox', {
    name: 'Nome do passageiro',
  }).fill('Teste Passageiro QA');

  await page.getByRole('button', {
    name: 'Continuar',
    exact: true,
  }).click();

  const respostaVolta = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/orders' &&
    response.request().method() === 'POST'
  );

  await page.getByRole('button', {
    name: 'Confirmar reserva',
    exact: true,
  }).click();

  const retornoVolta = await respostaVolta;

  expect(retornoVolta.status()).toBe(201);

  const reservaVolta = await retornoVolta.json();

  expect(reservaVolta.clientId).toBe('alfa-turismo');
  expect(reservaVolta.passageiro.nome).toBe('Teste Passageiro QA');

  expect(reservaVolta.trecho).toEqual({
    origin: 'GRU',
    destination: 'GIG',
    date: '2026-10-30',
  });

  await expect(
    page.getByRole('heading', {
      name: 'Reserva confirmada',
      exact: true,
    })
  ).toBeVisible();

  await expect(
    page.getByText('Teste Passageiro QA', {
      exact: true,
    })
  ).toBeVisible();

  // Cada trecho precisa gerar sua própria reserva.
  expect(reservaIda.id).toBeTruthy();
  expect(reservaVolta.id).toBeTruthy();
  expect(reservaVolta.id).not.toBe(reservaIda.id);
});