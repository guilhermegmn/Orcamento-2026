const fs = require('fs');
const path = require('path');

// Categorias válidas conforme especificado
const CATEGORIAS_VALIDAS = {
  'CB': 'CAMINHÃO BASCULANTE',
  'CC': 'CAMINHÃO COMBOIO',
  'CG': 'CAMINHÃO GUINDAUTO',
  'CP': 'CAMINHÃO PIPA',
  'EH': 'ESCAVADEIRA HIDRAULICA',
  'TE': 'TRATOR DE ESTEIRA',
  'TP': 'TRATOR DE PNEUS',
  'PC': 'PA CARREGADEIRA',
  'VL': 'VEICULO LEVE',
  'CA': 'COMPRESSOR DE AR',
  'KSS': 'ORE SORTER',
  'TC': 'TRANSPORTADOR DE CORREIA',
  'PM': 'PENEIRA MOVEL',
  'PV': 'PENEIRA VIBRATORIA',
  'BM': 'BRITADOR'
};

// Função para extrair categoria do código de equipamento
function extrairCategoria(codigo) {
  if (!codigo) return null;

  const prefixo = codigo.split('-')[0];
  return CATEGORIAS_VALIDAS[prefixo] || null;
}

// Função para validar se é um equipamento válido (TAG-NUMERO)
function isEquipamentoValido(codigo) {
  if (!codigo) return false;

  // Deve ter formato TAG-NUMERO onde TAG é uma das categorias válidas
  const match = codigo.match(/^([A-Z]+)-(\d+)$/);
  if (!match) return false;

  const prefixo = match[1];
  return CATEGORIAS_VALIDAS.hasOwnProperty(prefixo);
}

// Função para gerar descrição
function gerarDescricao(codigo, categoria) {
  if (codigo === 'GERAL') return 'Custos gerais não alocados a equipamentos específicos';

  return `${categoria} ${codigo}`;
}

// Processar arquivo e extrair equipamentos únicos
function extrairEquipamentos() {
  const arquivo = fs.readFileSync(
    path.join(__dirname, '../data/Orçamento 2026 -Dashboard - csv.csv'),
    'utf-8'
  );

  const linhas = arquivo.split('\n');
  const equipamentosSet = new Set();

  // Pular cabeçalho
  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    const colunas = linha.split(';');
    if (colunas.length < 17) continue;

    const equipamento = colunas[16]?.trim();
    // Só adicionar se for um equipamento válido (TAG-NUMERO)
    if (isEquipamentoValido(equipamento)) {
      equipamentosSet.add(equipamento);
    }
  }

  // Converter para array e ordenar
  const equipamentosArray = Array.from(equipamentosSet).sort();

  // Criar objetos de equipamentos
  const equipamentos = equipamentosArray.map((codigo, index) => {
    const categoria = extrairCategoria(codigo);

    return {
      codigo: codigo,
      nome: codigo,
      categoria: categoria,
      descricao: `${categoria} ${codigo}`,
      centro_custo: `CC-${String(index + 1).padStart(3, '0')}`,
      responsavel: 'A definir',
      email: 'equipamentos@empresa.com.br',
      ativo: true
    };
  });

  return equipamentos;
}

// Gerar metadata
console.log('Gerando metadata de equipamentos...\n');

const equipamentos = extrairEquipamentos();
console.log(`✓ ${equipamentos.length} equipamentos encontrados`);

// Agrupar por categoria para estatísticas
const categorias = {};
equipamentos.forEach(eq => {
  if (!categorias[eq.categoria]) {
    categorias[eq.categoria] = 0;
  }
  categorias[eq.categoria]++;
});

console.log('\nEquipamentos por categoria:');
Object.entries(categorias).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  - ${cat}: ${count} equipamento(s)`);
});

// Criar objeto final
const metadata = {
  equipamentos: equipamentos
};

// Salvar arquivos
const dirMetadata = path.join(__dirname, '../data/metadata');
const dirPublicMetadata = path.join(__dirname, '../public/data/metadata');

if (!fs.existsSync(dirMetadata)) fs.mkdirSync(dirMetadata, { recursive: true });
if (!fs.existsSync(dirPublicMetadata)) fs.mkdirSync(dirPublicMetadata, { recursive: true });

const jsonContent = JSON.stringify(metadata, null, 2);

fs.writeFileSync(path.join(dirMetadata, 'equipamentos.json'), jsonContent, 'utf-8');
fs.writeFileSync(path.join(dirPublicMetadata, 'equipamentos.json'), jsonContent, 'utf-8');

console.log('\n✓ Arquivos salvos:');
console.log('  - data/metadata/equipamentos.json');
console.log('  - public/data/metadata/equipamentos.json');
console.log('\n✓ Metadata gerado com sucesso!');
