const fs = require('fs');
const path = require('path');

// Função para remover formatação de moeda e converter para número
function parseValor(valor) {
  if (!valor || valor.trim() === '' || valor === 'R$ -') return 0;

  // Remove R$, espaços, pontos de milhar
  let numero = valor.replace(/R\$\s*/g, '').replace(/\s/g, '').replace(/\./g, '');
  // Substitui vírgula decimal por ponto
  numero = numero.replace(',', '.');
  // Remove sinal negativo se houver
  numero = parseFloat(numero);

  return Math.abs(numero) || 0;
}

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

// Mapear classe orçamentária para classe e subclasse
function mapearClasse(classeCodigo, descricao, grupoContas) {
  const mapa = {
    '421101': { classe: 'Pessoal', subclasse: 'Salários' },
    '421201': { classe: 'Pessoal', subclasse: 'INSS' },
    '421202': { classe: 'Pessoal', subclasse: 'FGTS' },
    '421204': { classe: 'Pessoal', subclasse: 'Vale Transporte' },
    '421301': { classe: 'Pessoal', subclasse: 'Convênio Médico' },
    '421302': { classe: 'Pessoal', subclasse: 'Outros Benefícios' },
    '421303': { classe: 'Pessoal', subclasse: 'Seguro de Vida' },
    '421304': { classe: 'Pessoal', subclasse: 'Alimentação' },
    '421405': { classe: 'Pessoal', subclasse: 'Saúde Ocupacional' },
    '421406': { classe: 'Pessoal', subclasse: 'Treinamentos' },
    '421407': { classe: 'Pessoal', subclasse: 'Uniformes e EPI' },
    '422101': { classe: 'Operacional', subclasse: 'Aluguel de Equipamentos' },
    '422102': { classe: 'Operacional', subclasse: 'Serviços Gerais' },
    '422103': { classe: 'Operacional', subclasse: 'Combustíveis' },
    '422104': { classe: 'Operacional', subclasse: 'Manutenção de Equipamentos' },
    '422105': { classe: 'Operacional', subclasse: 'Manutenção de Edificações' },
    '422109': { classe: 'Operacional', subclasse: 'Pneus' },
    '422110': { classe: 'Operacional', subclasse: 'Embalagens' },
    '422111': { classe: 'Operacional', subclasse: 'Armazenagem' },
    '422112': { classe: 'Operacional', subclasse: 'Limpeza e Conservação' },
    '422113': { classe: 'Operacional', subclasse: 'Ferramentas' },
    '422114': { classe: 'Operacional', subclasse: 'Água e Esgoto' },
    '422115': { classe: 'Operacional', subclasse: 'Energia Elétrica' },
    '422116': { classe: 'Operacional', subclasse: 'Comunicações' },
    '422117': { classe: 'Operacional', subclasse: 'Exames e Análises' },
    '422118': { classe: 'Operacional', subclasse: 'Insumos Laboratoriais' },
    '422119': { classe: 'Tecnologia', subclasse: 'Software' },
    '422120': { classe: 'Operacional', subclasse: 'Industrialização' },
    '422121': { classe: 'Operacional', subclasse: 'Gás GLP' },
    '422122': { classe: 'Tecnologia', subclasse: 'Telefonia e Internet' },
    '422123': { classe: 'Operacional', subclasse: 'Fretes e Carretos' },
    '422124': { classe: 'Operacional', subclasse: 'Viagens' },
    '422125': { classe: 'Tecnologia', subclasse: 'Material de Escritório' },
    '422126': { classe: 'Operacional', subclasse: 'Material de Limpeza' },
    '422127': { classe: 'Operacional', subclasse: 'Segurança' },
    '422128': { classe: 'Operacional', subclasse: 'Lanches e Refeições' },
    '422129': { classe: 'Operacional', subclasse: 'Custas Cartoriais' },
    '422130': { classe: 'Operacional', subclasse: 'Taxas' },
    '422131': { classe: 'Operacional', subclasse: 'Assessoria Jurídica' },
    '422137': { classe: 'Operacional', subclasse: 'Seguros' },
    '422139': { classe: 'Operacional', subclasse: 'Móveis e Utensílios' },
    '422141': { classe: 'Operacional', subclasse: 'Equipamentos de Segurança' },
    '422142': { classe: 'Operacional', subclasse: 'IPVA' },
    '422144': { classe: 'Operacional', subclasse: 'Peças' }
  };

  return mapa[classeCodigo] || { classe: 'Outros', subclasse: descricao || 'Diversos' };
}

// Processar arquivo "Orçamento 2026 -Dashboard - csv.csv"
function processarOrcamento2026() {
  const arquivo = fs.readFileSync(
    path.join(__dirname, '../data/Orçamento 2026 -Dashboard - csv.csv'),
    'utf-8'
  );

  const linhas = arquivo.split('\n');
  const resultado = [];

  // Pular cabeçalho
  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    const colunas = linha.split(';');
    if (colunas.length < 17) continue;

    const classeOrc = colunas[0]?.replace(/^\uFEFF/, '').trim();
    const descricao = colunas[1]?.trim();
    const grupoContas = colunas[2]?.trim();
    const equipamento = colunas[16]?.trim() || '';

    if (!classeOrc) continue;

    const mapeamento = mapearClasse(classeOrc, descricao, grupoContas);
    const categoria = extrairCategoria(equipamento);

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (let m = 0; m < 12; m++) {
      const valor = parseValor(colunas[3 + m]);

      if (valor > 0) {
        resultado.push({
          ano: 2026,
          mes: meses[m],
          classe_codigo: classeOrc,
          classe_orcamentaria: mapeamento.classe,
          subclasse: mapeamento.subclasse,
          equipamento: equipamento || 'GERAL',
          categoria: categoria,
          centro_custo: `CC-${classeOrc.substring(0, 3)}`,
          valor: valor
        });
      }
    }
  }

  return resultado;
}

// Processar arquivo "orçamento detalhado 2026 - Dashboard - csv.csv"
function processarOrcamentoDetalhado() {
  const arquivo = fs.readFileSync(
    path.join(__dirname, '../data/orçamento detalhado 2026 - Dashboard - csv.csv'),
    'utf-8'
  );

  const linhas = arquivo.split('\n');
  const resultado2025 = [];
  const resultado2026 = [];

  // Pular cabeçalho
  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    const colunas = linha.split(';');
    if (colunas.length < 30) continue;

    const classeOrc = colunas[0]?.replace(/^\uFEFF/, '').trim();
    const descricao = colunas[1]?.trim();

    if (!classeOrc || classeOrc === '' || descricao === 'MARGEM DE CONTRIBUIÇÃO') continue;

    const mapeamento = mapearClasse(classeOrc, descricao, '');

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Processar 2025 (colunas 2-13)
    for (let m = 0; m < 12; m++) {
      const valor = parseValor(colunas[2 + m]);

      if (valor > 0) {
        resultado2025.push({
          ano: 2025,
          mes: meses[m],
          classe_codigo: classeOrc,
          classe_orcamentaria: mapeamento.classe,
          subclasse: mapeamento.subclasse,
          equipamento: 'GERAL',
          categoria: 'Geral',
          centro_custo: `CC-${classeOrc.substring(0, 3)}`,
          valor: valor
        });
      }
    }

    // Processar 2026 (colunas 16-27, pulando 14 e 15 que são totais)
    for (let m = 0; m < 12; m++) {
      const valor = parseValor(colunas[16 + m]);

      if (valor > 0) {
        resultado2026.push({
          ano: 2026,
          mes: meses[m],
          classe_codigo: classeOrc,
          classe_orcamentaria: mapeamento.classe,
          subclasse: mapeamento.subclasse,
          equipamento: 'GERAL',
          categoria: 'Geral',
          centro_custo: `CC-${classeOrc.substring(0, 3)}`,
          valor: valor
        });
      }
    }
  }

  return { resultado2025, resultado2026 };
}

// Salvar arquivos CSV
function salvarCSV(dados, arquivo) {
  const cabecalho = 'ano,mes,classe_codigo,classe_orcamentaria,subclasse,equipamento,centro_custo,valor\n';
  const linhas = dados.map(d =>
    `${d.ano},${d.mes},${d.classe_codigo},${d.classe_orcamentaria},${d.subclasse},${d.equipamento},${d.centro_custo},${d.valor}`
  ).join('\n');

  fs.writeFileSync(arquivo, cabecalho + linhas, 'utf-8');
  console.log(`✓ Arquivo salvo: ${arquivo}`);
}

// Executar conversão
console.log('Iniciando conversão dos arquivos CSV...\n');

console.log('1. Processando Orçamento 2026 por equipamento...');
const orcado2026Equipamentos = processarOrcamento2026();
console.log(`   - ${orcado2026Equipamentos.length} registros processados`);

console.log('\n2. Processando Orçamento Detalhado 2025 e 2026...');
const { resultado2025, resultado2026 } = processarOrcamentoDetalhado();
console.log(`   - 2025: ${resultado2025.length} registros`);
console.log(`   - 2026: ${resultado2026.length} registros`);

// Combinar dados de 2026 (detalhado + equipamentos)
console.log('\n3. Combinando dados de 2026...');
const orcado2026Final = [...resultado2026, ...orcado2026Equipamentos];
console.log(`   - Total 2026: ${orcado2026Final.length} registros`);

// Criar diretórios se não existirem
const dir2025 = path.join(__dirname, '../data/2025');
const dir2026 = path.join(__dirname, '../data/2026');

if (!fs.existsSync(dir2025)) fs.mkdirSync(dir2025, { recursive: true });
if (!fs.existsSync(dir2026)) fs.mkdirSync(dir2026, { recursive: true });

// Salvar arquivos
console.log('\n4. Salvando arquivos...');
salvarCSV(resultado2025, path.join(dir2025, 'orcado.csv'));
salvarCSV(orcado2026Final, path.join(dir2026, 'orcado.csv'));

console.log('\n✓ Conversão concluída com sucesso!');
console.log('\nArquivos gerados:');
console.log('  - data/2025/orcado.csv');
console.log('  - data/2026/orcado.csv');
console.log('\nNota: Para dados realizados de 2026, será necessário fornecer um arquivo adicional.');
