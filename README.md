# Dashboard de Orçamento 2025-2026

Dashboard interativo para análise de orçamentos e gastos de equipamentos, desenvolvido com Next.js 15, React 19 e TypeScript.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Alimentação de Dados](#alimentação-de-dados)
- [Estrutura dos Dados](#estrutura-dos-dados)
- [Categorias de Equipamentos](#categorias-de-equipamentos)
- [Customização](#customização)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O dashboard possui 3 abas principais:

### 1. **Planejamento**
Compara valores realizados em 2025 vs orçamento planejado para 2026.
- Gráficos comparativos por classe orçamentária
- Gráficos por equipamento
- Filtros por classe, categoria e equipamento
- Classes agrupadas: FOLHA SALARIAL, RECEITAS, CUSTOS OPERACIONAIS

### 2. **Execução 2026**
Compara orçamento 2026 vs valores realizados em 2026.
- Acompanhamento mensal
- Percentual executado
- Variações e desvios

### 3. **Detalhamento**
Visualização detalhada dos gastos reais de 2025.
- Tabela de gastos por categoria de equipamento
- Drill-down interativo por equipamento
- Filtros por equipamento, categoria e período
- Registros transacionais detalhados

## 📁 Estrutura do Projeto

```
Orcamento-2026/
├── data/                          # Dados processados (não commitados)
│   ├── 2025/
│   │   ├── realizado.csv         # Dados reais 2025
│   │   └── detalhamento.csv      # Detalhamento transacional 2025
│   ├── 2026/
│   │   ├── orcado.csv            # Orçamento 2026
│   │   └── realizado.csv         # Dados reais 2026
│   └── metadata/
│       ├── classes.json          # Classes orçamentárias
│       ├── equipamentos.json     # Equipamentos e categorias
│       └── config.json           # Configurações globais
│
├── public/data/                   # Cópia dos dados para frontend
│   └── [mesma estrutura de data/]
│
├── scripts/                       # Scripts de processamento
│   ├── convert-csv.js            # Converte CSVs originais
│   └── generate-metadata.js      # Gera metadados
│
├── src/
│   ├── app/
│   │   └── page.tsx              # Componente principal do dashboard
│   ├── components/ui/            # Componentes de interface
│   └── lib/
│       ├── data-loader.ts        # Carrega dados no frontend
│       └── types.ts              # Definições TypeScript
│
├── package.json
└── README.md
```

## 🔧 Pré-requisitos

- **Node.js**: versão 18.x ou superior
- **npm**: versão 9.x ou superior

Verifique as versões instaladas:
```bash
node --version
npm --version
```

## 📦 Instalação

### 1. Clone o repositório (ou copie os arquivos)

```bash
git clone <url-do-repositorio>
cd Orcamento-2026
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Crie os diretórios necessários

```bash
mkdir -p data/2025 data/2026 data/metadata
mkdir -p public/data/2025 public/data/2026 public/data/metadata
```

## 📊 Alimentação de Dados

### Passo 1: Prepare os Arquivos CSV Originais

Coloque os seguintes arquivos na pasta `data/`:

#### **RAZÃO CONTÁBIL - ANALÍTICO.csv**
- Dados realizados de 2025
- Colunas necessárias: Mês, Classe Orçamentária, Sub-Classe, Valor, Equipamento

#### **orçamento detalhado 2026.csv**
- Orçamento planejado para 2026
- Mesma estrutura do arquivo acima

#### **RAZÃO CLASSE DE VALOR 2025.csv**
- Detalhamento transacional de 2025
- Colunas necessárias:
  - DT EMISSÃO (coluna 3)
  - DESC. PRODUTO (coluna 6)
  - QTDE (coluna 7)
  - VLR UNIT. (coluna 8)
  - R$ TOTAL (coluna 9)
  - DESC CLASSE VALOR (coluna 18) - contém o código do equipamento
  - DESC FORNECEDOR (coluna 21)

### Passo 2: Execute o Script de Conversão

```bash
node scripts/convert-csv.js
```

**O que este script faz:**
- Processa "RAZÃO CONTÁBIL - ANALÍTICO.csv" → gera `data/2025/realizado.csv`
- Processa "orçamento detalhado 2026.csv" → gera `data/2026/orcado.csv`
- Processa "RAZÃO CLASSE DE VALOR 2025.csv" → gera `data/2025/detalhamento.csv`
- Extrai e valida códigos de equipamentos
- Calcula totais e agrupa dados

**Saída esperada:**
```
Iniciando conversão dos arquivos CSV...
1. Processando Razão Contábil 2025 (dados reais)...
   - 18354 registros processados
2. Processando Orçamento Detalhado 2026...
   - 360 registros processados
3. Processando Detalhamento 2025 (Classe de Valor)...
   - 10333 registros processados
✓ Conversão concluída com sucesso!
```

### Passo 3: Gere os Metadados

```bash
node scripts/generate-metadata.js
```

**O que este script faz:**
- Extrai todos os equipamentos únicos dos dados processados
- Cria `data/metadata/equipamentos.json` com lista de equipamentos e categorias
- Valida categorias contra CATEGORIAS_VALIDAS

**Saída esperada:**
```
Gerando metadata de equipamentos...
✓ 134 equipamentos encontrados
Equipamentos por categoria:
  - VEICULO LEVE: 36 equipamento(s)
  - CAMINHÃO BASCULANTE: 25 equipamento(s)
  ...
✓ Metadata gerado com sucesso!
```

### Passo 4: Copie os Dados para a Pasta Pública

```bash
cp -r data/* public/data/
```

### Passo 5: Execute o Dashboard

```bash
npm run dev
```

Acesse em: http://localhost:3000

## 📋 Estrutura dos Dados

### Formato: realizado.csv e orcado.csv

```csv
mes,classe_codigo,subclasse,tipo_orcamento,valor,equipamento
Jan,411101,SALARIO E ORDENADOS,REALIZADO,50000.00,GERAL
Fev,421101,VALE TRANSPORTE,REALIZADO,1200.50,VL-20
```

**Colunas:**
- `mes`: Mês (Jan, Fev, Mar, etc.)
- `classe_codigo`: Código da classe orçamentária (ex: 411101)
- `subclasse`: Descrição da classe (ex: SALARIO E ORDENADOS)
- `tipo_orcamento`: REALIZADO ou ORÇADO
- `valor`: Valor numérico (ponto como separador decimal)
- `equipamento`: Código do equipamento (ex: VL-20) ou GERAL

### Formato: detalhamento.csv

```csv
data,equipamento,produto,quantidade,valorUnitario,valorTotal,fornecedor
2025-05-28 00:00:00,BM-01,"SERVICOS DE MANUTENCAO",1,125513.85,125513.85,"SOTREQ S/A"
```

**Colunas:**
- `data`: Data no formato ISO (YYYY-MM-DD HH:MM:SS)
- `equipamento`: Código do equipamento (ex: BM-01)
- `produto`: Descrição do produto/serviço
- `quantidade`: Quantidade numérica
- `valorUnitario`: Valor unitário
- `valorTotal`: Valor total da transação
- `fornecedor`: Nome do fornecedor

### Formato: equipamentos.json

```json
{
  "equipamentos": [
    {
      "codigo": "VL-20",
      "nome": "VL-20",
      "categoria": "VEICULO LEVE",
      "descricao": "VEICULO LEVE VL-20",
      "centro_custo": "CC-001",
      "responsavel": "A definir",
      "email": "equipamentos@empresa.com.br",
      "ativo": true
    }
  ]
}
```

## 🏷️ Categorias de Equipamentos

As categorias são definidas pelo prefixo do código do equipamento:

| Prefixo | Categoria | Exemplo |
|---------|-----------|---------|
| CB | CAMINHÃO BASCULANTE | CB-01 |
| CC | CAMINHÃO COMBOIO | CC-01 |
| CG | CAMINHÃO GUINDAUTO | CG-01 |
| CP | CAMINHÃO PIPA | CP-01 |
| EH | ESCAVADEIRA HIDRAULICA | EH-05 |
| TE | TRATOR DE ESTEIRA | TE-02 |
| TP | TRATOR DE PNEUS | TP-01 |
| PC | PA CARREGADEIRA | PC-01 |
| VL | VEICULO LEVE | VL-20 |
| CA | COMPRESSOR DE AR | CA-01 |
| KSS | ORE SORTER | KSS-01 |
| TC | TRANSPORTADOR DE CORREIA | TC-01 |
| PM | PENEIRA MOVEL | PM-01 |
| PV | PENEIRA VIBRATORIA | PV-01 |
| BM | BRITADOR | BM-01 |
| GE | GRUPO GERADOR | GE-01 |
| MN | MOTONIVELADORA | MN-01 |
| PTA | EQUIPAMENTO LOCADO | PTA-001 |
| TI | TORRE DE ILUMINACAO | TI-02 |
| RE | RETROESCAVADEIRA | RE-01 |
| RP | ROMPEDOR | RP-01 |
| AMB | AMBULANCIA | AMB-001 |

### Como Adicionar uma Nova Categoria

1. **Edite os scripts de processamento:**

```javascript
// scripts/convert-csv.js
const CATEGORIAS_VALIDAS = {
  // ... categorias existentes ...
  'NV': 'NOVA CATEGORIA',  // Adicione aqui
};
```

```javascript
// scripts/generate-metadata.js
const CATEGORIAS_VALIDAS = {
  // ... categorias existentes ...
  'NV': 'NOVA CATEGORIA',  // Adicione aqui
};
```

2. **Reprocesse os dados:**

```bash
node scripts/convert-csv.js
node scripts/generate-metadata.js
cp -r data/* public/data/
```

3. **Rebuild o projeto:**

```bash
npm run build
```

## ⚙️ Customização

### Alterar Agrupamento de Classes

As classes orçamentárias são agrupadas na função `agruparClasse()` em `src/app/page.tsx`:

```typescript
function agruparClasse(classeCodigo: string, subclasse: string): string {
  const codigoNum = parseInt(classeCodigo);

  // FOLHA SALARIAL: 411101 até 421405, mais 421901, 421902, 421903
  if ((codigoNum >= 411101 && codigoNum <= 421405) ||
      classeCodigo === '421901' || classeCodigo === '421902' || classeCodigo === '421903') {
    return "FOLHA SALARIAL";
  }

  // RECEITAS: classes que começam com 3
  if (classeCodigo.startsWith('3')) {
    return "RECEITAS";
  }

  // CUSTOS OPERACIONAIS: classes que começam com 5
  if (classeCodigo.startsWith('5')) {
    return "CUSTOS OPERACIONAIS";
  }

  // Outras classes: manter formato original
  return `${classeCodigo} - ${subclasse}`;
}
```

**Para adicionar um novo grupo:**
1. Adicione uma nova condição na função
2. Rebuild: `npm run build`

### Alterar Cores ou Formatação

As cores e estilos usam Tailwind CSS. Principais customizações em `src/app/page.tsx`:

```typescript
// Cores dos gráficos
<Bar dataKey="orcado" fill="#3b82f6" name="Orçado" />
<Bar dataKey="realizado" fill="#10b981" name="Realizado" />

// Cores de variação
style={{ color: variacao >= 0 ? "#ef4444" : "#10b981" }}
```

### Alterar Formato de Moeda

Em `src/lib/data-loader.ts`:

```typescript
export function formatCurrency(value: number, config?: Config): string {
  const currency = config?.currency || "BRL";
  const locale = config?.locale || "pt-BR";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}
```

## 🚀 Deploy

### Vercel (Recomendado)

1. **Instale a CLI do Vercel:**
```bash
npm install -g vercel
```

2. **Faça login:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

### Build para produção (servidor próprio)

1. **Build:**
```bash
npm run build
```

2. **Inicie o servidor:**
```bash
npm start
```

### Build estático (export)

1. **Configure em `next.config.js`:**
```javascript
module.exports = {
  output: 'export',
}
```

2. **Build:**
```bash
npm run build
```

3. **Arquivos em `out/` prontos para servidor estático**

## 🔍 Troubleshooting

### Problema: "Equipamentos não aparecem nos filtros"

**Solução:**
1. Verifique se o prefixo do equipamento está em CATEGORIAS_VALIDAS
2. Reprocesse os dados: `node scripts/convert-csv.js`
3. Regenere metadados: `node scripts/generate-metadata.js`
4. Copie para public: `cp -r data/* public/data/`

### Problema: "Dados não aparecem no dashboard"

**Solução:**
1. Verifique se os arquivos estão em `public/data/`
2. Verifique o console do navegador (F12) para erros
3. Confirme que os CSVs têm o formato correto
4. Teste localmente: `npm run dev`

### Problema: "Build falha"

**Solução:**
1. Limpe cache: `rm -rf .next node_modules`
2. Reinstale: `npm install`
3. Build novamente: `npm run build`

### Problema: "Valores incorretos nos totais"

**Solução:**
1. Verifique formato dos valores nos CSVs (use ponto como decimal)
2. Confirme que não há linhas duplicadas
3. Reprocesse: `node scripts/convert-csv.js`

### Problema: "CSV com vírgulas dentro de campos quebra parsing"

**Solução:**
Os scripts já tratam campos entre aspas. Certifique-se de que campos com vírgulas estejam entre aspas:
```csv
"produto com, vírgula","fornecedor nome, ltda"
```

## 📝 Manutenção

### Atualização Mensal de Dados

1. Exporte novos arquivos CSV do sistema contábil
2. Coloque na pasta `data/`
3. Execute: `node scripts/convert-csv.js`
4. Copie: `cp -r data/* public/data/`
5. Commit e deploy

### Backup dos Dados

Recomenda-se fazer backup regular de:
- `data/` - Dados processados
- `public/data/` - Dados públicos
- Arquivos CSV originais

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique este README
2. Consulte a seção Troubleshooting
3. Verifique os logs do console
4. Entre em contato com o desenvolvedor

## 📄 Licença

[Especifique a licença do projeto]

---

**Última atualização:** 2025-01-21
**Versão do Dashboard:** 1.0.0
**Versão do Next.js:** 15.5.3
