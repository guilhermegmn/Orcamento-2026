export interface BudgetData {
  categoria: string;
  subcategoria: string;
  mes: string;
  previsto: number;
  realizado: number;
  centro_custo: string;
}

export interface KPIData {
  totalPrevisto: number;
  totalRealizado: number;
  variacao: number;
  percentualExecutado: number;
}

export interface ChartData {
  mes: string;
  previsto: number;
  realizado: number;
}
