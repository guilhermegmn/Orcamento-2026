"use client";

import { useState, useMemo } from "react";
import { Upload, Download, TrendingUp, TrendingDown } from "lucide-react";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BudgetData, KPIData, ChartData } from "@/lib/types";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function Dashboard() {
  const [data, setData] = useState<BudgetData[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>("Todas");
  const [selectedCentroCusto, setSelectedCentroCusto] = useState<string>("Todos");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<BudgetData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.map((row) => ({
          ...row,
          previsto: parseFloat(String(row.previsto)),
          realizado: parseFloat(String(row.realizado)),
        }));
        setData(parsedData);
      },
      error: (error) => {
        console.error("Erro ao parsear CSV:", error);
        alert("Erro ao importar arquivo CSV. Verifique o formato do arquivo.");
      },
    });
  };

  const downloadCSVTemplate = () => {
    const template = `categoria,subcategoria,mes,previsto,realizado,centro_custo
Pessoal,Salários,Jan,100000,95000,CC-001
Pessoal,Salários,Fev,100000,98000,CC-001
Pessoal,Benefícios,Jan,30000,28000,CC-001
Operacional,Materiais,Jan,50000,45000,CC-002
Operacional,Materiais,Fev,50000,52000,CC-002
Operacional,Serviços,Jan,40000,38000,CC-002
Infraestrutura,Equipamentos,Jan,80000,75000,CC-003
Infraestrutura,Manutenção,Jan,25000,23000,CC-003`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_orcamento.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const categoriaMatch = selectedCategoria === "Todas" || item.categoria === selectedCategoria;
      const centroCustoMatch =
        selectedCentroCusto === "Todos" || item.centro_custo === selectedCentroCusto;
      return categoriaMatch && centroCustoMatch;
    });
  }, [data, selectedCategoria, selectedCentroCusto]);

  const kpis: KPIData = useMemo(() => {
    const totalPrevisto = filteredData.reduce((sum, item) => sum + item.previsto, 0);
    const totalRealizado = filteredData.reduce((sum, item) => sum + item.realizado, 0);
    const variacao = totalRealizado - totalPrevisto;
    const percentualExecutado = totalPrevisto > 0 ? (totalRealizado / totalPrevisto) * 100 : 0;

    return { totalPrevisto, totalRealizado, variacao, percentualExecutado };
  }, [filteredData]);

  const chartData: ChartData[] = useMemo(() => {
    const monthlyData = MESES.map((mes) => {
      const monthData = filteredData.filter((item) => item.mes === mes);
      const previsto = monthData.reduce((sum, item) => sum + item.previsto, 0);
      const realizado = monthData.reduce((sum, item) => sum + item.realizado, 0);
      return { mes, previsto, realizado };
    });

    return monthlyData.filter((item) => item.previsto > 0 || item.realizado > 0);
  }, [filteredData]);

  const categorias = useMemo(() => {
    return ["Todas", ...Array.from(new Set(data.map((item) => item.categoria)))];
  }, [data]);

  const centrosCusto = useMemo(() => {
    return ["Todos", ...Array.from(new Set(data.map((item) => item.centro_custo)))];
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
              Dashboard de Orçamento 2025/2026
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Acompanhamento e análise do orçamento institucional
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadCSVTemplate} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Baixar modelo CSV
            </Button>
            <label htmlFor="file-upload">
              <Button asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar CSV
                </span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {data.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao Dashboard</CardTitle>
              <CardDescription>
                Importe um arquivo CSV para começar a visualizar seus dados orçamentários.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="h-16 w-16 text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Nenhum dado importado ainda
              </p>
              <Button onClick={downloadCSVTemplate} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Baixar modelo CSV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Categoria
                </label>
                <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Centro de Custo
                </label>
                <Select value={selectedCentroCusto} onValueChange={setSelectedCentroCusto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um centro de custo" />
                  </SelectTrigger>
                  <SelectContent>
                    {centrosCusto.map((cc) => (
                      <SelectItem key={cc} value={cc}>
                        {cc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Orçamento Previsto</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(kpis.totalPrevisto)}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Orçamento Realizado</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(kpis.totalRealizado)}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Variação</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {formatCurrency(Math.abs(kpis.variacao))}
                    {kpis.variacao >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>% Executado</CardDescription>
                  <CardTitle className="text-2xl">
                    {kpis.percentualExecutado.toFixed(1)}%
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução Mensal</CardTitle>
                  <CardDescription>Comparação entre previsto e realizado</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="previsto"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Previsto"
                      />
                      <Line
                        type="monotone"
                        dataKey="realizado"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Realizado"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comparação Mensal</CardTitle>
                  <CardDescription>Previsto vs Realizado por mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="previsto" fill="#3b82f6" name="Previsto" />
                      <Bar dataKey="realizado" fill="#10b981" name="Realizado" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de dados */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Categoria</CardTitle>
                <CardDescription>Visualização detalhada dos dados orçamentários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium text-slate-700 dark:text-slate-300">
                          Categoria
                        </th>
                        <th className="text-left p-2 font-medium text-slate-700 dark:text-slate-300">
                          Subcategoria
                        </th>
                        <th className="text-left p-2 font-medium text-slate-700 dark:text-slate-300">
                          Mês
                        </th>
                        <th className="text-right p-2 font-medium text-slate-700 dark:text-slate-300">
                          Previsto
                        </th>
                        <th className="text-right p-2 font-medium text-slate-700 dark:text-slate-300">
                          Realizado
                        </th>
                        <th className="text-right p-2 font-medium text-slate-700 dark:text-slate-300">
                          Variação
                        </th>
                        <th className="text-left p-2 font-medium text-slate-700 dark:text-slate-300">
                          Centro de Custo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(0, 20).map((item, index) => {
                        const variacao = item.realizado - item.previsto;
                        return (
                          <tr key={index} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                            <td className="p-2 text-slate-600 dark:text-slate-400">
                              {item.categoria}
                            </td>
                            <td className="p-2 text-slate-600 dark:text-slate-400">
                              {item.subcategoria}
                            </td>
                            <td className="p-2 text-slate-600 dark:text-slate-400">{item.mes}</td>
                            <td className="p-2 text-right text-slate-600 dark:text-slate-400">
                              {formatCurrency(item.previsto)}
                            </td>
                            <td className="p-2 text-right text-slate-600 dark:text-slate-400">
                              {formatCurrency(item.realizado)}
                            </td>
                            <td
                              className={`p-2 text-right font-medium ${
                                variacao >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {formatCurrency(variacao)}
                            </td>
                            <td className="p-2 text-slate-600 dark:text-slate-400">
                              {item.centro_custo}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredData.length > 20 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center">
                      Mostrando 20 de {filteredData.length} registros
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
