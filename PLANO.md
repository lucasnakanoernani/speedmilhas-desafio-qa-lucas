# Plano de testes

## Riscos, em ordem de prioridade

1. **Exposição de dados entre agências:** permitir que uma agência
   consulte reservas ou informações de clientes de outra.

2. **Reservas duplicadas:** uma repetição da mesma solicitação gerar 
   uma nova reserva, em vez de retornar a reserva já existente.

3. **Cobrança incorreta:** calcular ou arredondar incorretamente
   as taxas e o total, ou apresentar valores diferentes
   entre a oferta selecionada e a reserva.

4. **Inconsistência do itinerário:** criar uma reserva com aeroportos,
   datas ou trechos diferentes dos selecionados, principalmente
   no fluxo de ida e volta.

5. **Validações inadequadas na busca:** aceitar origem e destino
   iguais ou datas incompatíveis com as regras da SPEC.

6. **Falhas na busca:** indisponibilidade ou lentidão de um fornecedor
   impedir a apresentação das ofertas disponíveis dos demais.

7. **Validações inadequadas do passageiro:** permitir reserva sem nome
   ou impedir a conclusão pela ausência de campos opcionais.

## O que automatizar

Utilizar Playwright com TypeScript para testes de tela e API.

### Testes E2E

1. **Busca e reserva somente de ida**
   - Realizar uma busca válida.
   - Conferir a ordenação crescente das ofertas por milhas.
   - Selecionar uma oferta e concluir a reserva.
   - Validar passageiro, aeroportos, data e milhas.
   - Conferir o cálculo da taxa de serviço e do total.
   - Comparar os dados da reserva com a oferta selecionada.
   - Conferir a ausência de trecho de volta na reserva.

2. **Busca e reserva de ida e volta**
   - Realizar uma busca com datas válidas.
   - Selecionar ou confirmar os voos de ida e volta conforme
     o fluxo previsto na SPEC.
   - Concluir a reserva.
   - Conferir se os dois trechos correspondem à seleção realizada.
   - Validar aeroportos, datas, passageiro e milhas.
   - Conferir o cálculo das taxas e do total.
   - Verificar se os trechos de ida e volta estão claramente
     identificados na reserva.

3. **Busca com falha de fornecedor**
   - Simular uma falha utilizando os controles existentes do mock.
   - Conferir a apresentação das ofertas dos demais fornecedores.
   - Validar o aviso de resultado parcial.
   - Restaurar o estado do mock após o teste.

### Testes de API

Planejar quatro testes:

1. **Ausência de agência:** operação de reserva sem identificação
   da agência deve retornar 401.

2. **Nome obrigatório:** tentativa de reserva sem nome deve
   retornar 400 com mensagem explicativa.

3. **Idempotência:** reenviar a solicitação com a mesma chave
   deve retornar a mesma reserva e indicar o replay,
   sem criar uma reserva adicional.

4. **Isolamento entre agências:** consultar uma reserva de outra
   agência deve retornar 404, sem expor seus dados.

Validar os códigos de resposta e o conteúdo retornado conforme
a SPEC.

Caso seja necessário reduzir a cobertura para três testes de API,
registrar o cenário adiado e a justificativa no QA_NOTES.md.

## O que testar manualmente

### Busca e datas

- Fluxo principal de busca e ordenação das ofertas.
- Origem e destino iguais.
- Datas passadas e ida na data atual.
- Volta anterior à ida.
- Ida e volta no mesmo dia.
- Alteração entre somente ida e ida e volta, conferindo
  o tratamento dos campos e dos resultados anteriores.

A aceitação das datas será avaliada conforme a SPEC.
Não assumir que ida e volta no mesmo dia são proibidas
sem uma regra que sustente essa restrição.

### Itinerário e reserva

- Busca somente de ida apresentar apenas o trecho correspondente.
- Busca de ida e volta apresentar informações dos dois trechos.
- Seleção ou confirmação correta do voo de volta.
- Correspondência entre os voos selecionados e a reserva.
- Identificação clara da ida e da volta na reserva.
- Exibição correta do passageiro e dos dados da viagem.

A necessidade de selecionar a volta separadamente será avaliada
conforme o fluxo definido na SPEC.

### Cálculo das taxas e consistência dos valores

- Taxa de serviço correspondente a 7% da taxa de embarque,
  com arredondamento para cima ao centavo.
- Total em reais correspondente à soma de embarque e serviço.
- Milhas conferidas separadamente do valor em reais.
- Correspondência dos valores entre oferta e reserva.

### Validações e isolamento

- Bloqueio da reserva sem nome e mensagem explicativa.
- Reserva com nome preenchido e documento e e-mail vazios,
  considerando que esses campos são opcionais.
- Clareza das mensagens de validação.
- Separação das reservas nas listas de cada agência.
- Tentativa de acesso direto ao detalhe de uma reserva
  pertencente a outra agência.

### Fornecedores

- Tratamento de falhas, lentidão e dados incompletos.
- Preservação das ofertas disponíveis dos demais fornecedores.
- Clareza dos avisos de resultado parcial.
- Consideração do cache de 60 segundos ao alterar o mock.
- Restauração do estado do mock após a exploração.

## O que fica de fora agora, e por quê

- Itens explicitamente excluídos pelo README.
- Carga e performance, acessibilidade, responsividade avançada
  e investigação de segurança além das regras da SPEC,
  devido ao limite de tempo e à priorização funcional.
- Cobertura exaustiva de aeroportos, datas e passageiros.
- Automação de todas as combinações inválidas: parte dessas
  verificações será realizada manualmente.
- Correções no código da aplicação e dos fornecedores simulados:
  os problemas encontrados serão documentados.

O uso dos controles existentes do mock permanece dentro
da cobertura planejada.

## Cuidados na execução da automação

- Cada teste deve preparar os próprios dados.
- Utilizar esperas por condições da aplicação, evitando pausas fixas.
- Evitar execução simultânea dos testes que alteram o mock.
- Restaurar as configurações alteradas durante os testes.
- Documentar um comando para executar a suíte.
- Manter as validações corretas diante de bugs confirmados,
  associando as falhas aos respectivos registros no BUGS.md.

## Registro dos resultados

- Comparar os comportamentos observados com a SPEC.
- Reproduzir as divergências antes de classificá-las como bugs.
- Registrar ambiente, dados, passos, esperado, obtido,
  impacto, regra relacionada e evidência.
- Identificar comportamentos sem regra explícita como
  pontos de atenção ou dúvidas de requisito.
- Registrar cenários executados, resultados, tempo real
  e pendências no QA_NOTES.md.
- Incluir a busca com datas invertidas na cobertura de validação,
  relacionada ao BUG-03 e à regra 1.2 da SPEC.