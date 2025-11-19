"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, BarChart3, LineChart } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";
import { loadAllData, formatCurrency, formatPercentage, getVariacaoColor } from "@/lib/data-loader";
import type {
  BudgetDataRow,
  ComparativoClasse,
  ComparativoEquipamento,
  ExecutadoMensal,
  ClasseOrcamentaria,
  Equipamento,
  Config,
} from "@/lib/types";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function Dashboard() {
  const [realizado2025, setRealizado2025] = useState<BudgetDataRow[]>([]);
  const [orcado2026, setOrcado2026] = useState<BudgetDataRow[]>([]);
  const [realizado2026, setRealizado2026] = useState<BudgetDataRow[]>([]);
  const [classes, setClasses] = useState<ClasseOrcamentaria[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros Planejamento (multi-select)
  const [filtroClassesPlanejamento, setFiltroClassesPlanejamento] = useState<string[]>([]);
  const [filtroCategoriasPlanejamento, setFiltroCategoriasPlanejamento] = useState<string[]>([]);
  const [filtroEquipamentosPlanejamento, setFiltroEquipamentosPlanejamento] = useState<string[]>([]);

  // Filtros Execução (multi-select)
  const [filtroClassesExecucao, setFiltroClassesExecucao] = useState<string[]>([]);
  const [filtroCategoriasExecucao, setFilterCategoriasExecucao] = useState<string[]>([]);
  const [filtroEquipamentosExecucao, setFiltroEquipamentosExecucao] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await loadAllData();
      setRealizado2025(data.realizado2025);
      setOrcado2026(data.orcado2026);
      setRealizado2026(data.realizado2026);
      setClasses(data.classes);
      setEquipamentos(data.equipamentos);
      setConfig(data.config);
      setLoading(false);
    }
    fetchData();
  }, []);

  // ============= ABA PLANEJAMENTO: Realizado 2025 vs Orçamento 2026 =============

  const dadosPlanejamento = useMemo(() => {
    const filtrado2025 = realizado2025.filter((item) => {
      const classeMatch =
        filtroClassesPlanejamento.length === 0 || filtroClassesPlanejamento.includes(item.classe_orcamentaria);

      const equipamentoObj = equipamentos.find(eq => eq.codigo === item.equipamento);
      const categoriaMatch =
        filtroCategoriasPlanejamento.length === 0 ||
        (equipamentoObj && filtroCategoriasPlanejamento.includes(equipamentoObj.categoria));

      const equipamentoMatch =
        filtroEquipamentosPlanejamento.length === 0 || filtroEquipamentosPlanejamento.includes(item.equipamento);

      return classeMatch && categoriaMatch && equipamentoMatch;
    });

    const filtrado2026 = orcado2026.filter((item) => {
      const classeMatch =
        filtroClassesPlanejamento.length === 0 || filtroClassesPlanejamento.includes(item.classe_orcamentaria);

      const equipamentoObj = equipamentos.find(eq => eq.codigo === item.equipamento);
      const categoriaMatch =
        filtroCategoriasPlanejamento.length === 0 ||
        (equipamentoObj && filtroCategoriasPlanejamento.includes(equipamentoObj.categoria));

      const equipamentoMatch =
        filtroEquipamentosPlanejamento.length === 0 || filtroEquipamentosPlanejamento.includes(item.equipamento);

      return classeMatch && categoriaMatch && equipamentoMatch;
    });

    const total2025 = filtrado2025.reduce((sum, item) => sum + item.valor, 0);
    const total2026 = filtrado2026.reduce((sum, item) => sum + item.valor, 0);
    const variacao = total2026 - total2025;
    const variacaoPercentual = total2025 > 0 ? (variacao / total2025) * 100 : 0;

    return {
      total2025,
      total2026,
      variacao,
      variacaoPercentual,
      filtrado2025,
      filtrado2026,
    };
  }, [realizado2025, orcado2026, filtroClassesPlanejamento, filtroCategoriasPlanejamento, filtroEquipamentosPlanejamento, equipamentos]);

  const comparativoPorClasse = useMemo((): ComparativoClasse[] => {
    const { filtrado2025, filtrado2026 } = dadosPlanejamento;
    const classesMap = new Map<string, { orcado2025: number; orcado2026: number }>();

    filtrado2025.forEach((item) => {
      const current = classesMap.get(item.classe_orcamentaria) || { orcado2025: 0, orcado2026: 0 };
      current.orcado2025 += item.valor;
      classesMap.set(item.classe_orcamentaria, current);
    });

    filtrado2026.forEach((item) => {
      const current = classesMap.get(item.classe_orcamentaria) || { orcado2025: 0, orcado2026: 0 };
      current.orcado2026 += item.valor;
      classesMap.set(item.classe_orcamentaria, current);
    });

    return Array.from(classesMap.entries()).map(([classe, values]) => {
      const variacao = values.orcado2026 - values.orcado2025;
      const variacaoPercentual =
        values.orcado2025 > 0 ? (variacao / values.orcado2025) * 100 : 0;
      return {
        classe,
        orcado2025: values.orcado2025,
        orcado2026: values.orcado2026,
        variacao,
        variacaoPercentual,
      };
    });
  }, [dadosPlanejamento]);

  // ============= ABA EXECUÇÃO: Orçado 2026 vs Realizado 2026 =============

  const dadosExecucao = useMemo(() => {
    const filtradoOrcado = orcado2026.filter((item) => {
      const classeMatch =
        filtroClassesExecucao.length === 0 || filtroClassesExecucao.includes(item.classe_orcamentaria);

      const equipamentoObj = equipamentos.find(eq => eq.codigo === item.equipamento);
      const categoriaMatch =
        filtroCategoriasExecucao.length === 0 ||
        (equipamentoObj && filtroCategoriasExecucao.includes(equipamentoObj.categoria));

      const equipamentoMatch =
        filtroEquipamentosExecucao.length === 0 || filtroEquipamentosExecucao.includes(item.equipamento);

      return classeMatch && categoriaMatch && equipamentoMatch;
    });

    const filtradoRealizado = realizado2026.filter((item) => {
      const classeMatch =
        filtroClassesExecucao.length === 0 || filtroClassesExecucao.includes(item.classe_orcamentaria);

      const equipamentoObj = equipamentos.find(eq => eq.codigo === item.equipamento);
      const categoriaMatch =
        filtroCategoriasExecucao.length === 0 ||
        (equipamentoObj && filtroCategoriasExecucao.includes(equipamentoObj.categoria));

      const equipamentoMatch =
        filtroEquipamentosExecucao.length === 0 || filtroEquipamentosExecucao.includes(item.equipamento);

      return classeMatch && categoriaMatch && equipamentoMatch;
    });

    const totalOrcado = filtradoOrcado.reduce((sum, item) => sum + item.valor, 0);
    const totalRealizado = filtradoRealizado.reduce((sum, item) => sum + item.valor, 0);
    const variacao = totalRealizado - totalOrcado;
    const percentualExecutado = totalOrcado > 0 ? (totalRealizado / totalOrcado) * 100 : 0;

    return {
      totalOrcado,
      totalRealizado,
      variacao,
      percentualExecutado,
      filtradoOrcado,
      filtradoRealizado,
    };
  }, [orcado2026, realizado2026, filtroClassesExecucao, filtroCategoriasExecucao, filtroEquipamentosExecucao, equipamentos]);

  const execucaoMensal = useMemo((): ExecutadoMensal[] => {
    const { filtradoOrcado, filtradoRealizado } = dadosExecucao;

    return MESES.map((mes) => {
      const orcadoMes = filtradoOrcado
        .filter((item) => item.mes === mes)
        .reduce((sum, item) => sum + item.valor, 0);
      const realizadoMes = filtradoRealizado
        .filter((item) => item.mes === mes)
        .reduce((sum, item) => sum + item.valor, 0);
      const variacao = realizadoMes - orcadoMes;
      const percentualExecutado = orcadoMes > 0 ? (realizadoMes / orcadoMes) * 100 : 0;

      return {
        mes,
        orcado: orcadoMes,
        realizado: realizadoMes,
        variacao,
        percentualExecutado,
      };
    }).filter((item) => item.orcado > 0 || item.realizado > 0);
  }, [dadosExecucao]);

  const execucaoPorClasse = useMemo(() => {
    const { filtradoOrcado, filtradoRealizado } = dadosExecucao;
    const classesMap = new Map<string, { orcado: number; realizado: number }>();

    filtradoOrcado.forEach((item) => {
      const current = classesMap.get(item.classe_orcamentaria) || { orcado: 0, realizado: 0 };
      current.orcado += item.valor;
      classesMap.set(item.classe_orcamentaria, current);
    });

    filtradoRealizado.forEach((item) => {
      const current = classesMap.get(item.classe_orcamentaria) || { orcado: 0, realizado: 0 };
      current.realizado += item.valor;
      classesMap.set(item.classe_orcamentaria, current);
    });

    return Array.from(classesMap.entries()).map(([classe, values]) => ({
      classe,
      orcado: values.orcado,
      realizado: values.realizado,
      variacao: values.realizado - values.orcado,
      percentualExecutado: values.orcado > 0 ? (values.realizado / values.orcado) * 100 : 0,
    }));
  }, [dadosExecucao]);

  const execucaoPorEquipamento = useMemo(() => {
    const { filtradoOrcado, filtradoRealizado } = dadosExecucao;
    const equipamentosMap = new Map<string, { orcado: number; realizado: number }>();

    filtradoOrcado.forEach((item) => {
      const current = equipamentosMap.get(item.equipamento) || { orcado: 0, realizado: 0 };
      current.orcado += item.valor;
      equipamentosMap.set(item.equipamento, current);
    });

    filtradoRealizado.forEach((item) => {
      const current = equipamentosMap.get(item.equipamento) || { orcado: 0, realizado: 0 };
      current.realizado += item.valor;
      equipamentosMap.set(item.equipamento, current);
    });

    return Array.from(equipamentosMap.entries()).map(([equipamento, values]) => ({
      equipamento,
      orcado: values.orcado,
      realizado: values.realizado,
      variacao: values.realizado - values.orcado,
      percentualExecutado: values.orcado > 0 ? (values.realizado / values.orcado) * 100 : 0,
    }));
  }, [dadosExecucao]);

  // Opções para os filtros
  const opcoesClasses = useMemo(() =>
    Array.from(new Set([...realizado2025, ...orcado2026].map((item) => item.classe_orcamentaria))).map(c => ({
      value: c,
      label: c
    })),
    [realizado2025, orcado2026]
  );

  const opcoesCategorias = useMemo(() =>
    Array.from(new Set(equipamentos.map((eq) => eq.categoria))).map(c => ({
      value: c,
      label: c
    })),
    [equipamentos]
  );

  const opcoesEquipamentos = useMemo(() =>
    equipamentos.map(eq => ({
      value: eq.codigo,
      label: eq.nome
    })),
    [equipamentos]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            Dashboard de Orçamento 2025/2026
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Análise comparativa e acompanhamento orçamentário
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="planejamento" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="planejamento" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Planejamento
            </TabsTrigger>
            <TabsTrigger value="execucao" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Execução 2026
            </TabsTrigger>
          </TabsList>

          {/* ========== ABA PLANEJAMENTO ========== */}
          <TabsContent value="planejamento" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Planejamento: Realizado 2025 vs Orçamento 2026</CardTitle>
                <CardDescription>
                  Comparação entre gastos efetivos de 2025 e orçamento planejado para 2026
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Classe Orçamentária
                    </label>
                    <MultiSelect
                      options={opcoesClasses}
                      selected={filtroClassesPlanejamento}
                      onChange={setFiltroClassesPlanejamento}
                      placeholder="Todas as classes"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Categoria
                    </label>
                    <MultiSelect
                      options={opcoesCategorias}
                      selected={filtroCategoriasPlanejamento}
                      onChange={setFiltroCategoriasPlanejamento}
                      placeholder="Todas as categorias"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Equipamento
                    </label>
                    <MultiSelect
                      options={opcoesEquipamentos}
                      selected={filtroEquipamentosPlanejamento}
                      onChange={setFiltroEquipamentosPlanejamento}
                      placeholder="Todos os equipamentos"
                    />
                  </div>
                </div>

                {/* KPIs Planejamento */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Realizado 2025</CardDescription>
                      <CardTitle className="text-2xl">
                        {formatCurrency(dadosPlanejamento.total2025, config || undefined)}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Orçamento 2026</CardDescription>
                      <CardTitle className="text-2xl">
                        {formatCurrency(dadosPlanejamento.total2026, config || undefined)}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Variação</CardDescription>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        {formatCurrency(Math.abs(dadosPlanejamento.variacao), config || undefined)}
                        {dadosPlanejamento.variacao >= 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Variação %</CardDescription>
                      <CardTitle
                        className="text-2xl"
                        style={{
                          color: getVariacaoColor(
                            dadosPlanejamento.variacaoPercentual,
                            config || undefined
                          ),
                        }}
                      >
                        {formatPercentage(dadosPlanejamento.variacaoPercentual)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Gráfico Comparativo por Classe */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Comparativo por Classe Orçamentária</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparativoPorClasse}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="classe" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value, config || undefined)}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="orcado2025" fill="#3b82f6" name="Realizado 2025" />
                      <Bar dataKey="orcado2026" fill="#10b981" name="Orçamento 2026" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabela Comparativa */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detalhamento por Classe</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Classe</th>
                          <th className="text-right p-2 font-medium">Realizado 2025</th>
                          <th className="text-right p-2 font-medium">Orçamento 2026</th>
                          <th className="text-right p-2 font-medium">Variação</th>
                          <th className="text-right p-2 font-medium">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparativoPorClasse.map((item, idx) => (
                          <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                            <td className="p-2">{item.classe}</td>
                            <td className="p-2 text-right">
                              {formatCurrency(item.orcado2025, config || undefined)}
                            </td>
                            <td className="p-2 text-right">
                              {formatCurrency(item.orcado2026, config || undefined)}
                            </td>
                            <td
                              className="p-2 text-right font-medium"
                              style={{
                                color:
                                  item.variacao >= 0
                                    ? "#10b981"
                                    : "#ef4444",
                              }}
                            >
                              {formatCurrency(item.variacao, config || undefined)}
                            </td>
                            <td
                              className="p-2 text-right font-medium"
                              style={{
                                color: getVariacaoColor(
                                  item.variacaoPercentual,
                                  config || undefined
                                ),
                              }}
                            >
                              {formatPercentage(item.variacaoPercentual)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== ABA EXECUÇÃO ========== */}
          <TabsContent value="execucao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Execução 2026: Orçamento vs Realizado</CardTitle>
                <CardDescription>
                  Acompanhamento mensal comparando orçamento planejado com gastos efetivos de 2026
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Classe Orçamentária
                    </label>
                    <MultiSelect
                      options={opcoesClasses}
                      selected={filtroClassesExecucao}
                      onChange={setFiltroClassesExecucao}
                      placeholder="Todas as classes"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Categoria
                    </label>
                    <MultiSelect
                      options={opcoesCategorias}
                      selected={filtroCategoriasExecucao}
                      onChange={setFilterCategoriasExecucao}
                      placeholder="Todas as categorias"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Equipamento
                    </label>
                    <MultiSelect
                      options={opcoesEquipamentos}
                      selected={filtroEquipamentosExecucao}
                      onChange={setFiltroEquipamentosExecucao}
                      placeholder="Todos os equipamentos"
                    />
                  </div>
                </div>

                {/* KPIs Execução */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Orçado 2026</CardDescription>
                      <CardTitle className="text-2xl">
                        {formatCurrency(dadosExecucao.totalOrcado, config || undefined)}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Realizado 2026</CardDescription>
                      <CardTitle className="text-2xl">
                        {formatCurrency(dadosExecucao.totalRealizado, config || undefined)}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Variação</CardDescription>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        {formatCurrency(Math.abs(dadosExecucao.variacao), config || undefined)}
                        {dadosExecucao.variacao >= 0 ? (
                          <TrendingUp className="h-5 w-5 text-red-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-green-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>% Executado</CardDescription>
                      <CardTitle className="text-2xl">
                        {formatPercentage(dadosExecucao.percentualExecutado)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Gráfico Evolução Mensal */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Evolução Mensal</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={execucaoMensal}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value, config || undefined)}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="orcado"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Orçado"
                      />
                      <Line
                        type="monotone"
                        dataKey="realizado"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Realizado"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico por Classe */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Execução por Classe Orçamentária</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={execucaoPorClasse}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="classe" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value, config || undefined)}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="orcado" fill="#3b82f6" name="Orçado" />
                      <Bar dataKey="realizado" fill="#10b981" name="Realizado" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabela Mensal */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Detalhamento Mensal</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Mês</th>
                          <th className="text-right p-2 font-medium">Orçado</th>
                          <th className="text-right p-2 font-medium">Realizado</th>
                          <th className="text-right p-2 font-medium">Variação</th>
                          <th className="text-right p-2 font-medium">% Executado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {execucaoMensal.map((item, idx) => (
                          <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                            <td className="p-2">{item.mes}</td>
                            <td className="p-2 text-right">
                              {formatCurrency(item.orcado, config || undefined)}
                            </td>
                            <td className="p-2 text-right">
                              {formatCurrency(item.realizado, config || undefined)}
                            </td>
                            <td
                              className="p-2 text-right font-medium"
                              style={{
                                color: item.variacao >= 0 ? "#ef4444" : "#10b981",
                              }}
                            >
                              {formatCurrency(item.variacao, config || undefined)}
                            </td>
                            <td className="p-2 text-right">
                              {formatPercentage(item.percentualExecutado)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabela por Equipamento */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Execução por Equipamento</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Equipamento</th>
                          <th className="text-right p-2 font-medium">Orçado</th>
                          <th className="text-right p-2 font-medium">Realizado</th>
                          <th className="text-right p-2 font-medium">Variação</th>
                          <th className="text-right p-2 font-medium">% Executado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {execucaoPorEquipamento.map((item, idx) => (
                          <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                            <td className="p-2">{item.equipamento}</td>
                            <td className="p-2 text-right">
                              {formatCurrency(item.orcado, config || undefined)}
                            </td>
                            <td className="p-2 text-right">
                              {formatCurrency(item.realizado, config || undefined)}
                            </td>
                            <td
                              className="p-2 text-right font-medium"
                              style={{
                                color: item.variacao >= 0 ? "#ef4444" : "#10b981",
                              }}
                            >
                              {formatCurrency(item.variacao, config || undefined)}
                            </td>
                            <td className="p-2 text-right">
                              {formatPercentage(item.percentualExecutado)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
