const fs = require('fs');
const path = require('path');

// Função para extrair categoria do código de equipamento
function extrairCategoria(codigo) {
  if (!codigo || codigo === 'GERAL') return 'Geral';

  const prefixo = codigo.split('-')[0];
  const categorias = {
    'CB': 'Caminhão Basculante',
    'CC': 'Caminhão Comboio',
    'CG': 'Caminhão Guindauto',
    'CP': 'Caminhão Pipa',
    'EH': 'Escavadeira Hidráulica',
    'TE': 'Trator de Esteira',
    'TP': 'Trator de Pneus',
    'PC': 'Pá Carregadeira',
    'VL': 'Veículo Leve',
    'CA': 'Compressor de Ar',
    'KSS': 'Ore Sorter',
    'TC': 'Transportador de Correia',
    'PM': 'Peneira Móvel',
    'PV': 'Peneira Vibratória',
    'BM': 'Britador',
    'SD': 'Spray Dust',
    'RE': 'Retroescavadeira',
    'MN': 'Motoniveladora'
  };

  return categorias[prefixo] || 'Outros';
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
    // Só adicionar se for um código válido (letras-números, não começar com -)
    if (equipamento && equipamento !== '' && /^[A-Z]+/.test(equipamento)) {
      equipamentosSet.add(equipamento);
    }
  }

  // Sempre incluir GERAL
  equipamentosSet.add('GERAL');

  // Converter para array e ordenar
  const equipamentosArray = Array.from(equipamentosSet).sort();

  // Criar objetos de equipamentos
  const equipamentos = equipamentosArray.map((codigo, index) => {
    const categoria = extrairCategoria(codigo);
    const centroCusto = codigo === 'GERAL' ? 'CC-000' : `CC-${String(index + 1).padStart(3, '0')}`;

    return {
      codigo: codigo,
      nome: categoria,
      categoria: categoria,
      descricao: gerarDescricao(codigo, categoria),
      centro_custo: centroCusto,
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
