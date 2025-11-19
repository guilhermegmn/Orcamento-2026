# Estrutura de Dados - Dashboard de Orçamento

Este documento descreve a estrutura de arquivos e formatos esperados para o dashboard de orçamento.

## 📁 Estrutura de Diretórios

```
public/data/
├── 2025/
│   ├── orcado.csv           # Orçamento aprovado de 2025
│   └── realizado.csv        # Execução realizada de 2025
├── 2026/
│   ├── orcado.csv           # Orçamento aprovado de 2026
│   └── realizado.csv        # Execução realizada de 2026 (em andamento)
└── metadata/
    ├── classes.json         # Definição das classes orçamentárias
    ├── equipamentos.json    # Cadastro de equipamentos
    └── config.json          # Configurações gerais
```

## 📊 Formato dos Arquivos CSV

### Arquivo: `orcado.csv` e `realizado.csv`

**Campos obrigatórios:**
- `ano`: Ano do orçamento (ex: 2025, 2026)
- `mes`: Mês abreviado (Jan, Fev, Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez)
- `classe_orcamentaria`: Nome da classe orçamentária (ex: Pessoal, Operacional)
- `subclasse`: Nome da subclasse (ex: Salários, Materiais)
- `equipamento`: Código do equipamento/departamento (ex: EQ-ADM, EQ-OPE)
- `centro_custo`: Código do centro de custo (ex: CC-001)
- `valor`: Valor em reais (número decimal sem formatação)

### Exemplo de CSV:

```csv
ano,mes,classe_orcamentaria,subclasse,equipamento,centro_custo,valor
2026,Jan,Pessoal,Salários,EQ-ADM,CC-001,108000
2026,Jan,Pessoal,Benefícios,EQ-ADM,CC-001,33000
2026,Jan,Operacional,Materiais,EQ-OPE,CC-002,55000
2026,Fev,Pessoal,Salários,EQ-ADM,CC-001,108000
```

**Importante:**
- Use vírgula (,) como separador de campos
- Não use separadores de milhar nos valores
- Use ponto (.) para decimais nos valores
- Primeira linha deve conter os cabeçalhos
- Encoding: UTF-8

## 📋 Formato dos Arquivos JSON

### 1. classes.json

Define as classes orçamentárias e suas subclasses.

```json
{
  "classes_orcamentarias": [
    {
      "codigo": "01",
      "nome": "Pessoal",
      "descricao": "Despesas com pessoal, salários e benefícios",
      "cor": "#3b82f6",
      "subclasses": [
        {
          "codigo": "01.01",
          "nome": "Salários",
          "descricao": "Salários e vencimentos"
        },
        {
          "codigo": "01.02",
          "nome": "Benefícios",
          "descricao": "Benefícios e auxílios"
        }
      ]
    }
  ]
}
```

**Campos:**
- `codigo`: Código numérico da classe
- `nome`: Nome da classe (deve corresponder ao CSV)
- `descricao`: Descrição detalhada
- `cor`: Cor em hexadecimal para gráficos
- `subclasses`: Array de subclasses

### 2. equipamentos.json

Cadastro de equipamentos/departamentos.

```json
{
  "equipamentos": [
    {
      "codigo": "EQ-ADM",
      "nome": "Administrativo",
      "descricao": "Departamento Administrativo e Financeiro",
      "centro_custo": "CC-001",
      "responsavel": "João Silva",
      "email": "joao.silva@exemplo.com.br",
      "ativo": true
    }
  ]
}
```

**Campos:**
- `codigo`: Código do equipamento (deve corresponder ao CSV)
- `nome`: Nome do departamento/equipamento
- `descricao`: Descrição detalhada
- `centro_custo`: Centro de custo associado
- `responsavel`: Nome do responsável
- `email`: Email do responsável
- `ativo`: Boolean indicando se está ativo

### 3. config.json

Configurações gerais do sistema.

```json
{
  "aplicacao": {
    "nome": "Dashboard de Orçamento Institucional",
    "versao": "2.0.0",
    "ano_atual": 2026,
    "moeda": "BRL",
    "simbolo_moeda": "R$"
  },
  "periodo": {
    "ano_comparacao": 2025,
    "ano_vigente": 2026,
    "meses": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  },
  "alertas": {
    "variacao_critica_percentual": 15,
    "variacao_alerta_percentual": 10,
    "variacao_atencao_percentual": 5,
    "cores": {
      "critico": "#ef4444",
      "alerta": "#f59e0b",
      "atencao": "#eab308",
      "normal": "#10b981"
    }
  }
}
```

## 🔄 Como Atualizar os Dados

### Opção 1: Substituir Arquivos Completos

1. Edite seus dados em Excel/Google Sheets
2. Exporte como CSV (UTF-8, separador vírgula)
3. Substitua os arquivos em `public/data/XXXX/`
4. Recarregue o dashboard

### Opção 2: Atualizar Apenas Dados Novos

Para adicionar dados do mês atual:

1. Abra `public/data/2026/realizado.csv`
2. Adicione as novas linhas no final
3. Salve o arquivo
4. Recarregue o dashboard

### Exemplo de Atualização Mensal:

```csv
# Adicionar ao final de realizado.csv
2026,Mai,Pessoal,Salários,EQ-ADM,CC-001,108500
2026,Mai,Pessoal,Benefícios,EQ-ADM,CC-001,33200
2026,Mai,Operacional,Materiais,EQ-OPE,CC-002,56000
```

## ✅ Checklist de Validação

Antes de importar dados, verifique:

- [ ] Todos os CSVs têm os 7 campos obrigatórios
- [ ] Os valores de `mes` estão no formato correto (Jan, Fev, etc)
- [ ] Os valores de `ano` são numéricos (2025, 2026)
- [ ] Os códigos de `equipamento` existem em `equipamentos.json`
- [ ] As `classe_orcamentaria` existem em `classes.json`
- [ ] Os valores não contêm separadores de milhar
- [ ] O arquivo está em UTF-8
- [ ] Não há linhas vazias no meio do arquivo

## 🚨 Erros Comuns

### Erro: "Dados não carregados"
**Causa:** Caminho do arquivo incorreto ou formato inválido
**Solução:** Verifique se os arquivos estão em `public/data/`

### Erro: "Valores NaN no gráfico"
**Causa:** Valores com formato incorreto (vírgula, texto)
**Solução:** Use apenas números com ponto decimal

### Erro: "Classe não encontrada"
**Causa:** Nome da classe no CSV diferente do JSON
**Solução:** Certifique-se que os nomes são exatamente iguais

## 📖 Exemplos de Uso

### Cenário 1: Início do Ano

1. Crie `public/data/2027/orcado.csv` com o planejamento
2. Deixe `realizado.csv` vazio inicialmente
3. Atualize `config.json` com ano_vigente: 2027
4. Adicione dados mensalmente em `realizado.csv`

### Cenário 2: Meio do Ano

1. Mantenha `orcado.csv` completo (12 meses)
2. Atualize `realizado.csv` apenas com meses já executados
3. Dashboard mostrará os meses realizados vs projeção

### Cenário 3: Comparação de Anos

1. Mantenha dados completos de anos anteriores
2. Dashboard automaticamente compara ano_comparacao vs ano_vigente
3. Use aba "Planejamento" para análise estratégica

## 🔐 Boas Práticas

1. **Backup**: Sempre faça backup antes de atualizar
2. **Versionamento**: Use Git para controlar versões dos dados
3. **Validação**: Valide dados no Excel antes de exportar
4. **Consistência**: Mantenha códigos e nomes padronizados
5. **Documentação**: Documente mudanças em estruturas

## 📞 Suporte

Para dúvidas sobre a estrutura de dados:
- Consulte os arquivos de exemplo em `public/data/`
- Verifique a console do navegador para erros de carregamento
- Valide JSONs em https://jsonlint.com/
