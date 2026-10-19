# Notas

## Tempo gasto

### 15/10/2026 — Preparação e reconhecimento da aplicação

- **Tempo de trabalho ativo:** 20 minutos.
- **Espera por downloads e build, sem outras atividades do desafio:** 10 minutos.

**Atividades realizadas:**

- Criação do repositório a partir do template, incluindo todas as branches.
- Leitura das instruções e das regras de negócio.
- Instalação e configuração do Docker Desktop.
- Inicialização dos serviços pelo Docker Compose.
- Acesso à aplicação e navegação inicial.

**Resultado:** ambiente disponível para iniciar os testes planejados.

### 17/10/2026 — Elaboração do plano de testes

- **Tempo de trabalho ativo:** 40 minutos.

**Atividades realizadas:**

- Identificação e priorização dos riscos.
- Definição da cobertura manual e automatizada.
- Consolidação do PLANO.md, incluindo somente ida e ida e volta.

**Resultado:** plano de testes elaborado.

### 19/10/2026 — Exploração manual e investigação de divergências

- **Tempo de trabalho ativo:** 60 minutos.

**Atividades realizadas:**

- Conferência do cálculo e do arredondamento da taxa de serviço.
- Verificação dos valores apresentados na reserva.
- Verificação da listagem após alteração de agência.
- Tentativa de acesso direto à reserva de outra agência.
- Inspeção da identificação enviada na requisição de consulta.
- Execução de busca com data de volta anterior à ida.
- Organização dos achados e das evidências.

**Resultados:**

- BUG-01: taxa de serviço apresentada sem o arredondamento
  para cima exigido pela SPEC, com repercussão no total.
- BUG-02: acesso direto apresenta reserva da Alfa com Beta
  selecionada; a consulta envia o clienteId da Alfa.
- BUG-03: busca executada com volta anterior à ida, sem aviso,
  contrariando a regra 1.2 da SPEC.

## Como rodar a automação

A automação ainda não foi implementada e executada nesta etapa.

## Pendências para concluir a entrega

- Preencher os dados de reprodução restantes no BUGS.md.
- Conferir os arquivos e os caminhos das evidências.
- Implementar e executar os três testes E2E e três ou quatro de API.
- Validar diretamente na API o isolamento entre agências.
- Revisar a branch de cupom e preencher o REVIEW.md.
- Documentar o comando de execução e os resultados reais da suíte.

## O que eu faria com mais tempo

- Ampliaria a cobertura de valores e limites de arredondamento.
- Testaria outras transições de agência e formas de acessar reservas.
- Ampliaria as combinações de datas válidas e inválidas.
- Aprofundaria os cenários de lentidão, falha e dados incompletos
  dos fornecedores que não fossem cobertos na execução inicial.

## Como usei IA

Utilizei o ChatGPT para esclarecer as instruções do desafio,
organizar as etapas de trabalho e auxiliar na configuração
do ambiente com Docker.

Também utilizei a ferramenta como apoio na organização do plano
de testes, na discussão dos comportamentos observados,
no esclarecimento da regra de arredondamento e na redação
dos registros dos achados.

### Exemplo de sugestão corrigida

Durante a investigação do acesso entre agências, a hipótese inicial
de falha no bloqueio da API foi refinada após minha inspeção
da requisição.

Identifiquei o envio do clienteId da Alfa, apesar de Beta estar
selecionada. O registro foi ajustado para descrever essa evidência,
mantendo a validação direta do bloqueio da API como pendente.
