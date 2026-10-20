import { test, expect } from '@playwright/test';

test('Manter ofertas e mostrar aviso quando B falha', async ({
  page,
  request,
}) => {
  const mock = 'http://localhost:4000';

  // Limpa configurações anteriores.
  const resetInicial = await request.post(`${mock}/admin/reset`);
  expect(resetInicial.ok()).toBeTruthy();

  try {
    // Faz B falhar em todas as chamadas.
    const falhaB = await request.post(
      `${mock}/admin/force-fail/supplier-b`
    );

    expect(falhaB.ok()).toBeTruthy();

    // Fixa C no cenário de taxa não informada.
    // Essas ofertas devem aparecer, mesmo sem permitir reserva.
    const controleC = await request.post(
      `${mock}/admin/force-dirty/supplier-c?mode=null`
    );

    expect(controleC.ok()).toBeTruthy();

    await page.goto('/');

    await page
      .getByLabel('AgênciaAlfa TurismoBeta')
      .selectOption('alfa-turismo');

    await page.getByRole('radio', {
      name: 'Somente ida',
      exact: true,
    }).check();

    // Usa dados diferentes dos outros testes para evitar cache anterior.
    await page
      .getByLabel('OrigemGRU — São Paulo —')
      .selectOption('BSB');

    await page
      .getByLabel('DestinoSelecione o destinoGRU')
      .selectOption('SSA');

    await page.getByRole('button', {
      name: 'Ida',
      exact: true,
    }).click();

    await page.getByRole('button', {
      name: '29 de outubro de 2026',
      exact: true,
    }).click();

    const buscar = page.getByRole('button', {
      name: 'Buscar passagens',
      exact: true,
    });

    // Começa a observar a resposta antes de clicar.
    const respostaBuscaPromise = page.waitForResponse((response) =>
    new URL(response.url()).pathname === '/search/stream'
    );

    await buscar.click();

    // Mostra no terminal a resposta recebida pela própria tela.
    const respostaBusca = await respostaBuscaPromise;
    console.log('RESPOSTA DA BUSCA:', await respostaBusca.text());

    // Aguarda o término da busca.
    await expect(buscar).toBeEnabled({
      timeout: 20_000,
    });

    const resultados = page.getByRole('region', {
      name: 'Ida',
      exact: true,
    });

    // Os resultados disponíveis devem permanecer na tela.
    await expect.soft(
      resultados.getByRole('listitem').first()
    ).toBeVisible({ timeout: 15_000 });

    // A tela deve comunicar que o resultado é parcial.
    await expect.soft(
      page.getByText('Pode haver mais opções para esta data.', {
        exact: false,
      })
    ).toBeVisible({ timeout: 15_000 });

    await expect.soft(
      page.getByText('Nenhuma oferta disponível agora', {
        exact: false,
      })
    ).toHaveCount(0);
  } finally {
    // Executa a restauração mesmo se alguma validação falhar.
    const restauracao = await request.post(`${mock}/admin/reset`);
    expect(restauracao.ok()).toBeTruthy();
  }
});