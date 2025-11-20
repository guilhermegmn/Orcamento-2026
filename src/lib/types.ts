export interface BudgetDataRow {
  ano: string;
  mes: string;
  classe_codigo: string;
  classe_orcamentaria: string;
  subclasse: string;
  equipamento: string;
  centro_custo: string;
  valor: number;
}

export interface KPIData {
  total: number;
  variacao: number;
  variacaoPercentual: number;
}

export interface ChartData {
  mes: string;
  [key: string]: string | number;
}

export interface ComparativoClasse {
  classe: string;
  orcado2025: number;
  orcado2026: number;
  variacao: number;
  variacaoPercentual: number;
}

export interface ComparativoEquipamento {
  equipamento: string;
  orcado2025: number;
  orcado2026: number;
  variacao: number;
  variacaoPercentual: number;
}

export interface ExecutadoMensal {
  mes: string;
  orcado: number;
  realizado: number;
  variacao: number;
  percentualExecutado: number;
}

export interface ClasseOrcamentaria {
  codigo: string;
  nome: string;
  descricao: string;
  cor: string;
  subclasses: Subclasse[];
}

export interface Subclasse {
  codigo: string;
  nome: string;
  descricao: string;
}

export interface Equipamento {
  codigo: string;
  nome: string;
  categoria: string;
  descricao: string;
  centro_custo: string;
  responsavel: string;
  email: string;
  ativo: boolean;
}

export interface Config {
  aplicacao: {
    nome: string;
    versao: string;
    ano_atual: number;
    moeda: string;
    simbolo_moeda: string;
  };
  periodo: {
    ano_comparacao: number;
    ano_vigente: number;
    meses: string[];
    meses_completos: string[];
  };
  alertas: {
    variacao_critica_percentual: number;
    variacao_alerta_percentual: number;
    variacao_atencao_percentual: number;
    cores: {
      critico: string;
      alerta: string;
      atencao: string;
      normal: string;
    };
  };
  formatacao: {
    casas_decimais: number;
    separador_milhar: string;
    separador_decimal: string;
    prefixo_moeda: string;
  };
}

export interface DetalhamentoRow {
  data: string;
  equipamento: string;
  produto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  fornecedor: string;
}
