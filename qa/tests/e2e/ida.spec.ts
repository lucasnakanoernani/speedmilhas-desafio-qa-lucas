import { test, expect } from '@playwright/test';

test('Reservar passagem somente de ida', async ({ page }) => {
  // Abre o endereço configurado no playwright.config.ts.
  await page.goto('/');

  // Confirma que a aplicação carregou.
  await expect(
    page.getByRole('link', {
      name: 'Speed Milhas',
      exact: true,
    })
  ).toBeVisible();

  // Seleciona a agência.
  await page.getByLabel('AgênciaAlfa TurismoBeta').selectOption('alfa-turismo');

  // Seleciona a modalidade.
  const somenteIda = page.getByRole('radio', {
    name: 'Somente ida',
    exact: true,
  });

  await somenteIda.check();
  await expect(somenteIda).toBeChecked();

  // Preenche os aeroportos.
  await page.getByLabel('OrigemGRU — São Paulo —').selectOption('GIG');
  await page.getByLabel('DestinoSelecione o destinoGRU').selectOption('GRU');

  // Seleciona a data da Ida
  await page.getByRole('button', { name: 'Ida' }).click();
  await page.getByRole('button', { name: '28 de outubro de' }).click();

  // Clica em buscar passagens
  await page.getByRole('button', { name: 'Buscar passagens' }).click();

  // Seleciona a primeira opção
  await page.getByRole('listitem').filter({ hasText: 'LATAMLAMelhor preçovia parceiro' }).getByRole('link').click();

  // Preenche o nome
  await page.getByRole('textbox', { name: 'Nome do passageiro' }).fill('Teste Passageiro QA');

  //
  await page.getByRole('main').click();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Aguarda a resposta da criação da reserva.
  // A espera é registrada antes do clique para não perder a resposta.
  const respostaReserva = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/orders' &&
    response.request().method() === 'POST'
  );

  // Confirma a reserva.
  await page.getByRole('button', {
    name: 'Confirmar reserva',
  }).click();

  // Valida a criação na API.
  const resposta = await respostaReserva;

  expect(resposta.status()).toBe(201);

  const reserva = await resposta.json();

  expect(reserva.clientId).toBe('alfa-turismo');
  expect(reserva.passageiro.nome).toBe('Teste Passageiro QA');

  expect(reserva.trecho).toEqual({
    origin: 'GIG',
    destination: 'GRU',
    date: '2026-10-28',
  });

  // Valida a confirmação apresentada ao usuário.
  await expect(
    page.getByRole('heading', {
      name: 'Reserva confirmada',
      exact: true,
    })
  ).toBeVisible();

  await expect(
    page.getByText('Teste Passageiro QA', { exact: true })
  ).toBeVisible();
  
});