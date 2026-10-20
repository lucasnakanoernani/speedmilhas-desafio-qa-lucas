# Notas de QA

## Tempo gasto

Os tempos abaixo distinguem trabalho ativo de espera por downloads e build.

| Data | Atividade | Trabalho ativo |  
| --- | --- | --- |
| 15/10/2026 | Preparação do repositório, leitura das instruções, Docker e reconhecimento da aplicação | 20 minutos | 
| 17/10/2026 | Identificação de riscos e elaboração do plano de testes | 40 minutos |
| 18/10/2026 | Exploração manual, investigação dos achados e organização das evidências | 60 minutos |
| 19/10/2026 | Construção e depuração da automação, investigação das falhas e documentação | 120 minutos | 

## Atividades e cobertura realizadas

- Elaboração do plano com priorização de riscos e cobertura manual e automatizada.
- Exploração do arredondamento da taxa de serviço, acesso entre agências e datas de ida e volta.
- Implementação de três testes E2E com Playwright e TypeScript: somente ida, ida e volta e resultado parcial de fornecedores.
- Implementação de quatro testes de API: ausência de agência, nome obrigatório, idempotência e isolamento entre agências.
- Captura da resposta de /search/stream para comparar as ofertas retornadas com a interface.
- A revisão da branch feature/cupom-desconto não foi concluída; a pendência está registrada em REVIEW.md.

## Como rodar a automação

### Preparação do ambiente

Pré-requisitos: Docker com Compose e Node.js 20.9 ou superior.

Na raiz do repositório:

```bash
docker compose up --build -d
```

Aguardar a aplicação em http://localhost:3001, a API em http://localhost:3000 e os fornecedores em http://localhost:4000 ficarem disponíveis.

Instalar as dependências da automação:

```bash
cd qa
npm ci
npx playwright install chromium
```

### Comando único para executar os testes

Dentro de qa:

```bash
npm test -- --workers=1 --max-failures=0
```

A execução usa um worker para evitar concorrência durante a configuração dos fornecedores. O parâmetro max-failures=0 permite concluir os demais testes mesmo havendo falhas.

Para acompanhar um E2E passo a passo:

```bash
npx playwright test tests/e2e/ida.spec.ts --debug
```

Para verificar o TypeScript:

```bash
npx tsc --noEmit
```

Para abrir o relatório da última execução:

```bash
npx playwright show-report
```

## Resultados das execuções individuais

| Tipo | Cenário | Resultado observado | Registro relacionado |
| --- | --- | --- | --- |
| E2E | Reserva somente de ida | Aprovado | — |
| E2E | Reserva dos trechos de ida e volta | Aprovado | — |
| E2E | Manter ofertas e aviso quando B falha | Reprovado: interface apresentou indisponibilidade apesar de a API retornar ofertas | BUG-04 |
| API | Listagem sem identificação da agência | Aprovado: retornou 401 | — |
| API | Reserva sem nome do passageiro | Reprovado: retornou 500 em vez de 400 | BUG-05 |
| API | Repetição com a mesma chave de idempotência | Aprovado: mesmo ID, status 201 e Idempotent-Replay: true | — |
| API | Beta consultando reserva da Alfa | Reprovado: retornou 200 em vez de 404 | BUG-06 |

Nas execuções individuais, foram observados **4 cenários aprovados e 3 reprovados**. As três reprovações estão relacionadas aos comportamentos documentados acima. As expectativas foram mantidas conforme as regras de negócio, sem ocultar as falhas.

**Execução conjunta final:** realizada em 19/10/2026.
Foram executados 7 testes: 4 aprovados e 3 reprovados.
As reprovações ocorreram nos cenários de resultado parcial
(BUG-04), reserva sem nome (BUG-05) e isolamento entre
agências pela API (BUG-06). O resultado foi consistente
com as execuções individuais.

**Verificação TypeScript:** realizada em 19/10/2026 com
`npx tsc --noEmit`, concluída sem erros.

## Organização e limitações

- Os cenários estão nos arquivos de teste, sem fixtures.ts, global-setup.ts ou ui.ts personalizados.
- Os testes de API que precisam de uma reserva buscam uma oferta reservável e preparam seus próprios dados.
- O teste de resultado parcial usa os controles administrativos do mock e restaura sua configuração em finally.
- Os fornecedores possuem falhas aleatórias previstas no desafio. Divergências na preparação dos testes devem ser distinguidas das falhas de validação do comportamento testado.
- Os E2E usam datas fixas de outubro de 2026 e precisam de atualização para execuções futuras.
- A automação implementada não cobre todas as regras do plano; o cálculo de arredondamento foi investigado manualmente.
- O BUG-02 descreve o fluxo observado na interface; o BUG-06 confirma o acesso direto pela API com x-client-id: beta-viagens. A afirmação de que a interface envia a agência anterior depende de evidência do cabeçalho da requisição.
- A revisão de código da branch feature/cupom-desconto não foi concluída no tempo disponível. Foram priorizados plano, exploração, evidências e automação. A entrega permanece parcial quanto a esse item, conforme a orientação do e-mail para explicar o que ficou faltando ao encerrar o trabalho.

## O que eu faria com mais tempo

- Substituir as datas fixas dos E2E por datas futuras e tornar os seletores menos dependentes do texto completo das opções.
- Automatizar o arredondamento para cima, incluindo resultados exatos e resultados com fração de centavo.
- Ampliar os casos de datas invertidas, origem igual ao destino, cotação expirada e oferta com taxa não informada.
- Completar a matriz de isolamento entre agências e conferir os cabeçalhos enviados pela interface após a troca de agência.
- Concluir a revisão da branch feature/cupom-desconto, comparando o diff com as regras descritas no PR e registrando bloqueios e sugestões.
- Configurar GitHub Actions para executar a suíte e disponibilizar as evidências.

## Como usei IA

Utilizei ChatGPT/Codex para esclarecer as instruções, organizar o plano e os registros de bugs, apoiar a configuração do ambiente e construir os testes Playwright e TypeScript passo a passo. A IA também sugeriu uma análise da branch de cupom, mas não concluí minha conferência desse item; por isso, não a apresento como revisão finalizada.

Executei os testes no meu ambiente e confrontei os resultados com a SPEC. Uma estrutura de automação inicialmente sugerida não funcionou no meu ambiente; pedi uma abordagem mais simples, sem os arquivos personalizados fixtures.ts, global-setup.ts e ui.ts, para acompanhar a construção e compreender cada cenário.

Também discordei da sugestão de unificar o registro do fluxo da interface com a consulta direta pela API e optei por mantê-los separados. Para não atribuir uma causa sem evidência, o clientId retornado no corpo deve ser distinguido do x-client-id efetivamente enviado no cabeçalho.

As sugestões da IA não foram consideradas prova de aprovação: os resultados de execução registrados são os observados no ambiente local; a revisão do PR permanece registrada como não concluída.
