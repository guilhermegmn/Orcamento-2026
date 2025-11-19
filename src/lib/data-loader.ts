import Papa from "papaparse";
import type { BudgetDataRow, ClasseOrcamentaria, Equipamento, Config } from "./types";

export async function loadCSVData(filePath: string): Promise<BudgetDataRow[]> {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse<BudgetDataRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data.map((row) => ({
            ...row,
            valor: parseFloat(String(row.valor)) || 0,
          }));
          resolve(data);
        },
        error: (error: Error) => reject(error),
      });
    });
  } catch (error) {
    console.error(`Erro ao carregar ${filePath}:`, error);
    return [];
  }
}

export async function loadJSON<T>(filePath: string): Promise<T | null> {
  try {
    const response = await fetch(filePath);
    return await response.json();
  } catch (error) {
    console.error(`Erro ao carregar ${filePath}:`, error);
    return null;
  }
}

export async function loadAllData() {
  const [
    realizado2025,
    orcado2026,
    realizado2026,
    classesData,
    equipamentosData,
    configData,
  ] = await Promise.all([
    loadCSVData("/data/2025/realizado.csv"),
    loadCSVData("/data/2026/orcado.csv"),
    loadCSVData("/data/2026/realizado.csv"),
    loadJSON<{ classes_orcamentarias: ClasseOrcamentaria[] }>(
      "/data/metadata/classes.json"
    ),
    loadJSON<{ equipamentos: Equipamento[] }>("/data/metadata/equipamentos.json"),
    loadJSON<Config>("/data/metadata/config.json"),
  ]);

  return {
    realizado2025,
    orcado2026,
    realizado2026,
    classes: classesData?.classes_orcamentarias || [],
    equipamentos: equipamentosData?.equipamentos || [],
    config: configData,
  };
}

export function formatCurrency(value: number, config?: Config): string {
  if (config) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: config.aplicacao.moeda,
    }).format(value);
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getVariacaoColor(
  variacaoPercentual: number,
  config?: Config
): string {
  if (!config) {
    if (Math.abs(variacaoPercentual) >= 15) return "#ef4444";
    if (Math.abs(variacaoPercentual) >= 10) return "#f59e0b";
    if (Math.abs(variacaoPercentual) >= 5) return "#eab308";
    return "#10b981";
  }

  const { alertas } = config;
  if (Math.abs(variacaoPercentual) >= alertas.variacao_critica_percentual)
    return alertas.cores.critico;
  if (Math.abs(variacaoPercentual) >= alertas.variacao_alerta_percentual)
    return alertas.cores.alerta;
  if (Math.abs(variacaoPercentual) >= alertas.variacao_atencao_percentual)
    return alertas.cores.atencao;
  return alertas.cores.normal;
}
