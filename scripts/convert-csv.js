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
  'BM': 'BRITADOR',
  'GE': 'GRUPO GERADOR',
  'MN': 'MOTONIVELADORA',
  'PTA': 'EQUIPAMENTO LOCADO',
  'TI': 'TRATOR INDUSTRIAL',
  'RE': 'RETROESCAVADEIRA',
  'RP': 'ROMPEDOR',
  'AMB': 'AMBULANCIA'
};

// Função para extrair categoria do código de equipamento
function extrairCategoria(codigo) {
  if (!codigo) return null;

  const prefixo = codigo.split('-')[0];
  return CATEGORIAS_VALIDAS[prefixo] || null;
}

// Função para extrair TAG de equipamento do campo "Desc. Classe de Valor"
function extrairEquipamento(descClasseValor) {
  if (!descClasseValor || descClasseValor.trim() === '' || descClasseValor === '""') {
    return 'GERAL';
  }

  // Remove aspas
  const desc = descClasseValor.replace(/"/g, '').trim();

  // Procura por padrão TAG-NUMERO (ex: CB-01, VL-20, EH-05)
  const match = desc.match(/^([A-Z]{2,3})-(\d+)/);

  if (match) {
    const prefixo = match[1];
    const numero = match[2];

    // Valida se é uma categoria válida
    if (CATEGORIAS_VALIDAS[prefixo]) {
      return `${prefixo}-${numero}`;
    }
  }

  // Se não encontrou padrão válido, retorna GERAL
  return 'GERAL';
}

// Função para mapear nome do mês em português para abreviação
function mapearMes(mesCompleto) {
  const mapa = {
    'Janeiro': 'Jan',
    'Fevereiro': 'Fev',
    'Março': 'Mar',
    'Abril': 'Abr',
    'Maio': 'Mai',
    'Junho': 'Jun',
    'Julho': 'Jul',
    'Agosto': 'Ago',
    'Setembro': 'Set',
    'Outubro': 'Out',
    'Novembro': 'Nov',
    'Dezembro': 'Dez'
  };
  return mapa[mesCompleto] || mesCompleto;
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

// Processar arquivo "RAZÃO CONTÁBIL - ANALÍTICO" para dados reais de 2025
function processarRazaoContabil() {
  const arquivo = fs.readFileSync(
    path.join(__dirname, '../data/RAZÃO CONTÁBIL - ANALÍTICO.csv'),
    'utf-8'
  );

  // Usar split manual para respeitar aspas
  const linhas = arquivo.split('\n');
  const resultado = [];

  // Pular cabeçalho
  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    // Parse CSV respeitando aspas e vírgulas
    const colunas = [];
    let atual = '';
    let dentroAspas = false;

    for (let j = 0; j < linha.length; j++) {
      const char = linha[j];

      if (char === '"') {
        dentroAspas = !dentroAspas;
      } else if (char === ',' && !dentroAspas) {
        colunas.push(atual);
        atual = '';
      } else {
        atual += char;
      }
    }
    colunas.push(atual); // Última coluna

    if (colunas.length < 19) continue;

    const ano = colunas[5]?.trim();
    const mesCompleto = colunas[6]?.trim();
    const classeCompleta = colunas[8]?.trim(); // "421301 - CONVENIO MEDICO..."
    const valorStr = colunas[10]?.trim();
    const descClasseValor = colunas[18]?.trim();

    // Validar ano 2025
    if (ano !== '2025') continue;

    // Extrair código da classe (primeiros 6 dígitos)
    const classeCodigoMatch = classeCompleta?.match(/^(\d{6})/);
    if (!classeCodigoMatch) continue;

    const classeOrc = classeCodigoMatch[1];
    const mapeamento = mapearClasse(classeOrc, classeCompleta, '');

    // Parse valor (pode estar com vírgula e negativo)
    const valor = parseValor(valorStr);
    if (valor === 0) continue;

    // Extrair equipamento
    const equipamento = extrairEquipamento(descClasseValor);
    const categoria = extrairCategoria(equipamento);

    // Mapear mês
    const mes = mapearMes(mesCompleto);

    resultado.push({
      ano: parseInt(ano),
      mes: mes,
      classe_codigo: classeOrc,
      classe_orcamentaria: mapeamento.classe,
      subclasse: mapeamento.subclasse,
      equipamento: equipamento,
      categoria: categoria,
      centro_custo: `CC-${classeOrc.substring(0, 3)}`,
      valor: valor
    });
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

    // Processar 2026 (colunas 17-28, coluna 16 é separador)
    for (let m = 0; m < 12; m++) {
      const valor = parseValor(colunas[17 + m]);

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

// Processar arquivo "RAZÃO CLASSE DE VALOR 2025" para detalhamento
function processarDetalhamento2025() {
  const arquivo = fs.readFileSync(
    path.join(__dirname, '../data/RAZÃO CLASSE DE VALOR 2025.csv'),
    'utf-8'
  );

  const linhas = arquivo.split('\n');
  const resultado = [];

  // Pular cabeçalho
  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    // Parse CSV respeitando aspas e vírgulas
    const colunas = [];
    let atual = '';
    let dentroAspas = false;

    for (let j = 0; j < linha.length; j++) {
      const char = linha[j];

      if (char === '"') {
        dentroAspas = !dentroAspas;
      } else if (char === ',' && !dentroAspas) {
        colunas.push(atual);
        atual = '';
      } else {
        atual += char;
      }
    }
    colunas.push(atual); // Última coluna

    if (colunas.length < 22) continue;

    const dtEmissao = colunas[3]?.trim(); // 2025-04-10 00:00:00
    const descProduto = colunas[6]?.trim();
    const qtde = colunas[7]?.trim();
    const vlrUnit = colunas[8]?.trim();
    const rTotal = colunas[9]?.trim();
    const descClasseValor = colunas[18]?.trim(); // Equipamento
    const descFornecedor = colunas[21]?.trim();

    // Extrair equipamento válido
    const equipamento = extrairEquipamento(descClasseValor);

    // Filtrar apenas equipamentos válidos (não GERAL)
    if (equipamento === 'GERAL') continue;

    // Parse valores
    const quantidade = parseFloat(qtde?.replace(',', '.') || '0');
    const valorUnitario = parseFloat(vlrUnit?.replace(',', '.') || '0');
    const valorTotal = parseFloat(rTotal?.replace(',', '.') || '0');

    if (valorTotal === 0) continue;

    resultado.push({
      data: dtEmissao,
      equipamento: equipamento,
      produto: descProduto || '',
      quantidade: quantidade,
      valorUnitario: Math.abs(valorUnitario),
      valorTotal: Math.abs(valorTotal),
      fornecedor: descFornecedor || ''
    });
  }

  return resultado;
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

// Salvar CSV de detalhamento
function salvarDetalhamentoCSV(dados, arquivo) {
  const cabecalho = 'data,equipamento,produto,quantidade,valorUnitario,valorTotal,fornecedor\n';
  const linhas = dados.map(d =>
    `${d.data},${d.equipamento},"${d.produto.replace(/"/g, '""')}",${d.quantidade},${d.valorUnitario},${d.valorTotal},"${d.fornecedor.replace(/"/g, '""')}"`
  ).join('\n');

  fs.writeFileSync(arquivo, cabecalho + linhas, 'utf-8');
  console.log(`✓ Arquivo salvo: ${arquivo}`);
}

// Executar conversão
console.log('Iniciando conversão dos arquivos CSV...\n');

console.log('1. Processando Razão Contábil 2025 (dados reais)...');
const resultado2025 = processarRazaoContabil();
console.log(`   - ${resultado2025.length} registros processados`);

console.log('\n2. Processando Orçamento Detalhado 2026...');
const { resultado2026 } = processarOrcamentoDetalhado();
console.log(`   - ${resultado2026.length} registros processados`);

console.log('\n3. Processando Detalhamento 2025 (Classe de Valor)...');
const detalhamento2025 = processarDetalhamento2025();
console.log(`   - ${detalhamento2025.length} registros processados`);

// Calcular totais para verificação
const total2025 = resultado2025.reduce((sum, item) => sum + item.valor, 0);
const total2026 = resultado2026.reduce((sum, item) => sum + item.valor, 0);
const totalDetalhamento = detalhamento2025.reduce((sum, item) => sum + item.valorTotal, 0);

// Contar equipamentos únicos em 2025
const equipamentos2025 = new Set(resultado2025.map(item => item.equipamento));
const equipamentosComTag = Array.from(equipamentos2025).filter(eq => eq !== 'GERAL');

const equipamentosDetalhamento = new Set(detalhamento2025.map(item => item.equipamento));

console.log(`\n   Total 2025 (Realizado): R$ ${total2025.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
console.log(`   Equipamentos identificados: ${equipamentosComTag.length} (${equipamentosComTag.slice(0, 10).join(', ')}...)`);
console.log(`\n   Total 2026 (Orçamento): R$ ${total2026.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
console.log(`\n   Total Detalhamento 2025: R$ ${totalDetalhamento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
console.log(`   Equipamentos no detalhamento: ${equipamentosDetalhamento.size}`);

// Criar diretórios se não existirem
const dir2025 = path.join(__dirname, '../data/2025');
const dir2026 = path.join(__dirname, '../data/2026');

if (!fs.existsSync(dir2025)) fs.mkdirSync(dir2025, { recursive: true });
if (!fs.existsSync(dir2026)) fs.mkdirSync(dir2026, { recursive: true });

// Salvar arquivos
console.log('\n4. Salvando arquivos...');
salvarCSV(resultado2025, path.join(dir2025, 'realizado.csv'));
salvarCSV(resultado2026, path.join(dir2026, 'orcado.csv'));
salvarDetalhamentoCSV(detalhamento2025, path.join(dir2025, 'detalhamento.csv'));

console.log('\n✓ Conversão concluída com sucesso!');
console.log('\nArquivos gerados:');
console.log('  - data/2025/realizado.csv');
console.log('  - data/2026/orcado.csv');
console.log('  - data/2025/detalhamento.csv');
console.log('\nNota: Para dados realizados de 2026, será necessário fornecer um arquivo adicional.');
