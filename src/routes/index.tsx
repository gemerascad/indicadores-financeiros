import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  CheckCircle2,
  CircleDollarSign,
  RotateCcw,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ChartCard } from "@/components/dashboard/ChartCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MultiSelect } from "@/components/dashboard/MultiSelect";
import { DateRange } from "@/components/dashboard/DateRange";

import {
  ALL_PAYMENTS,
  EMPTY_FILTERS,
  MES_LIST,
  applyFilters,
  formatBRL,
  formatBRLFull,
  formatCompact,
  formatInt,
  groupSum,
  uniqueSorted,
  type Filters,
} from "@/lib/payments-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard Financeiro · Controle de Pagamentos" },
      {
        name: "description",
        content:
          "Painel de análise financeira com KPIs, status de pagamentos, responsáveis, tipos e empresas.",
      },
    ],
  }),
  component: Dashboard,
});

const STATUS_COLORS: Record<string, string> = {
  OK: "hsl(152 60% 42%)",
  DEVOLVIDO: "hsl(0 72% 55%)",
  "GUIA DIVERGENTE": "hsl(38 92% 50%)",
  "LOJA MIGRADA": "hsl(220 70% 55%)",
};

const CHART_PALETTE = [
  "hsl(220 70% 50%)",
  "hsl(152 60% 42%)",
  "hsl(38 92% 50%)",
  "hsl(280 60% 55%)",
  "hsl(0 72% 55%)",
  "hsl(190 70% 45%)",
  "hsl(48 95% 50%)",
  "hsl(330 70% 55%)",
];

function Dashboard() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const responsavelOpts = useMemo(
    () => uniqueSorted<string>(ALL_PAYMENTS, "responsavel"),
    [],
  );
  const statusOpts = useMemo(
    () => uniqueSorted<string>(ALL_PAYMENTS, "status"),
    [],
  );
  const tipoOpts = useMemo(
    () => uniqueSorted<string>(ALL_PAYMENTS, "tipo"),
    [],
  );
  const empresaOpts = useMemo(
    () => uniqueSorted<string>(ALL_PAYMENTS, "empresa"),
    [],
  );

  const filtered = useMemo(() => applyFilters(ALL_PAYMENTS, filters), [filters]);

  const kpis = useMemo(() => {
    let totalValor = 0;
    let okValor = 0;
    let okQtd = 0;
    let devValor = 0;
    let devQtd = 0;
    for (const p of filtered) {
      totalValor += p.valor;
      if (p.status === "OK") {
        okValor += p.valor;
        okQtd++;
      } else if (p.status === "DEVOLVIDO") {
        devValor += p.valor;
        devQtd++;
      }
    }
    const total = filtered.length;
    return {
      total,
      totalValor,
      okQtd,
      okValor,
      devQtd,
      devValor,
      ticketMedio: total > 0 ? totalValor / total : 0,
      taxaDevolucao: total > 0 ? (devQtd / total) * 100 : 0,
    };
  }, [filtered]);

  const statusData = useMemo(
    () =>
      groupSum(filtered, (p) => p.status).sort((a, b) => b.qtd - a.qtd),
    [filtered],
  );

  const respData = useMemo(
    () =>
      groupSum(filtered, (p) => p.responsavel)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10),
    [filtered],
  );

  const tipoData = useMemo(
    () =>
      groupSum(filtered, (p) => p.tipo)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10),
    [filtered],
  );

  const empresaData = useMemo(
    () =>
      groupSum(filtered, (p) => p.empresa)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 8),
    [filtered],
  );

  const mesData = useMemo(() => {
    const m = groupSum(filtered, (p) => p.mes);
    const order = new Map(MES_LIST.map((mes, i) => [mes, i]));
    return m
      .filter((d) => order.has(d.name))
      .sort((a, b) => (order.get(a.name) ?? 0) - (order.get(b.name) ?? 0))
      .map((d) => ({ ...d, name: d.name.slice(0, 3) }));
  }, [filtered]);

  const recent = useMemo(
    () =>
      [...filtered]
        .filter((p) => p.dataPagamento)
        .sort(
          (a, b) =>
            (b.dataPagamento?.getTime() ?? 0) -
            (a.dataPagamento?.getTime() ?? 0),
        )
        .slice(0, 25),
    [filtered],
  );

  const hasActiveFilters =
    filters.meses.length +
      filters.responsaveis.length +
      filters.status.length +
      filters.tipos.length +
      filters.empresas.length >
      0 ||
    filters.dateFrom !== null ||
    filters.dateTo !== null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Controle de Pagamentos
              </h1>
              <p className="text-xs text-muted-foreground">
                Painel financeiro · {formatInt(ALL_PAYMENTS.length)} registros
                na base
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden md:inline-flex">
              {formatInt(filtered.length)} registros filtrados
            </Badge>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpar filtros
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-6 py-6">
        {/* Filters */}
        <Card className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MultiSelect
              label="Mês"
              options={MES_LIST}
              selected={filters.meses}
              onChange={(v) => setFilters((f) => ({ ...f, meses: v }))}
            />
            <DateRange
              label="Período (data pagamento)"
              from={filters.dateFrom}
              to={filters.dateTo}
              onChange={(from, to) =>
                setFilters((f) => ({ ...f, dateFrom: from, dateTo: to }))
              }
            />
            <MultiSelect
              label="Responsável"
              options={responsavelOpts}
              selected={filters.responsaveis}
              onChange={(v) => setFilters((f) => ({ ...f, responsaveis: v }))}
            />
            <MultiSelect
              label="Status"
              options={statusOpts}
              selected={filters.status}
              onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            />
            <MultiSelect
              label="Tipo de pagamento"
              options={tipoOpts}
              selected={filters.tipos}
              onChange={(v) => setFilters((f) => ({ ...f, tipos: v }))}
            />
            <MultiSelect
              label="Empresa"
              options={empresaOpts}
              selected={filters.empresas}
              onChange={(v) => setFilters((f) => ({ ...f, empresas: v }))}
            />
          </div>
        </Card>

        {/* KPI Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total de pagamentos"
            value={formatInt(kpis.total)}
            hint={`Ticket médio ${formatBRL(kpis.ticketMedio)}`}
            icon={<CircleDollarSign className="h-5 w-5" />}
          />
          <KpiCard
            label="Valor total"
            value={formatCompact(kpis.totalValor)}
            hint={formatBRLFull(kpis.totalValor)}
            accent="default"
            icon={<Wallet className="h-5 w-5" />}
          />
          <KpiCard
            label="Pagamentos OK"
            value={formatInt(kpis.okQtd)}
            hint={`${formatCompact(kpis.okValor)} liquidados`}
            accent="success"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <KpiCard
            label="Pagamentos devolvidos"
            value={formatInt(kpis.devQtd)}
            hint={`${kpis.taxaDevolucao.toFixed(1)}% do total · ${formatCompact(kpis.devValor)}`}
            accent="danger"
            icon={<ArrowDownCircle className="h-5 w-5" />}
          />
        </div>

        {/* Row: monthly + status */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard
            className="lg:col-span-2 min-h-[320px]"
            title="Evolução mensal"
            subtitle="Valor pago por mês (ordem cronológica)"
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mesData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => formatCompact(Number(v))}
                />
                <Tooltip
                  formatter={(v: number, n) =>
                    n === "valor" ? formatBRLFull(v) : formatInt(v)
                  }
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="valor"
                  name="Valor"
                  stroke={CHART_PALETTE[0]}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="qtd"
                  name="Quantidade"
                  stroke={CHART_PALETTE[1]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  yAxisId={0}
                />

              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Status dos pagamentos" subtitle="Distribuição por quantidade">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="qtd"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {statusData.map((d, i) => (
                    <Cell
                      key={d.name}
                      fill={STATUS_COLORS[d.name] ?? CHART_PALETTE[i % CHART_PALETTE.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatInt(v)}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row: responsável + tipo */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Responsáveis" subtitle="Por valor pago e quantidade">
            <ResponsiveContainer width="100%" height={Math.max(260, respData.length * 44)}>
              <BarChart
                data={respData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  xAxisId="valor"
                  type="number"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => formatCompact(Number(v))}
                />
                <XAxis
                  xAxisId="qtd"
                  type="number"
                  orientation="top"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => formatInt(Number(v))}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={110}
                />
                <Tooltip
                  formatter={(v: number, n) =>
                    n === "Valor" ? formatBRLFull(v) : formatInt(v)
                  }
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar xAxisId="valor" dataKey="valor" name="Valor" radius={[0, 4, 4, 0]} fill={CHART_PALETTE[0]} />
                <Bar xAxisId="qtd" dataKey="qtd" name="Quantidade" radius={[0, 4, 4, 0]} fill={CHART_PALETTE[2]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Tipos de pagamento" subtitle="Top 10 por valor e quantidade">
            <ResponsiveContainer width="100%" height={Math.max(260, tipoData.length * 44)}>
              <BarChart
                data={tipoData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  xAxisId="valor"
                  type="number"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => formatCompact(Number(v))}
                />
                <XAxis
                  xAxisId="qtd"
                  type="number"
                  orientation="top"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => formatInt(Number(v))}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={150}
                />
                <Tooltip
                  formatter={(v: number, n) =>
                    n === "Valor" ? formatBRLFull(v) : formatInt(v)
                  }
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar xAxisId="valor" dataKey="valor" name="Valor" radius={[0, 4, 4, 0]} fill={CHART_PALETTE[3]} />
                <Bar xAxisId="qtd" dataKey="qtd" name="Quantidade" radius={[0, 4, 4, 0]} fill={CHART_PALETTE[2]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>


          <ChartCard title="Tipos de pagamento" subtitle="Top 10 por valor">
            <ResponsiveContainer width="100%" height={Math.max(240, tipoData.length * 32)}>
              <BarChart
                data={tipoData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => formatCompact(Number(v))}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={150}
                />
                <Tooltip
                  formatter={(v: number) => formatBRLFull(v)}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="valor" name="Valor" radius={[0, 4, 4, 0]} fill={CHART_PALETTE[3]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Empresa */}
        <ChartCard title="Empresas (clientes)" subtitle="Top 8 por valor total pago">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={empresaData} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={10}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={70}
                tickFormatter={(v: string) => (v.length > 28 ? v.slice(0, 28) + "…" : v)}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickFormatter={(v) => formatCompact(Number(v))}
              />
              <Tooltip
                formatter={(v: number, n) =>
                  n === "valor" ? formatBRLFull(v) : formatInt(v)
                }
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="valor" name="Valor" radius={[6, 6, 0, 0]} fill={CHART_PALETTE[0]} />
              <Bar dataKey="qtd" name="Quantidade" radius={[6, 6, 0, 0]} fill={CHART_PALETTE[2]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent table */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Pagamentos recentes</h3>
              <p className="text-xs text-muted-foreground">
                Últimos 25 pagamentos filtrados, por data
              </p>
            </div>
          </div>
          <ScrollArea className="h-[420px] rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {p.dataPagamento?.toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{p.responsavel}</TableCell>
                    <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground">
                      {p.empresa}
                    </TableCell>
                    <TableCell className="text-xs">{p.tipo}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "OK"
                            ? "secondary"
                            : p.status === "DEVOLVIDO"
                              ? "destructive"
                              : "outline"
                        }
                        className="text-[10px]"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-mono text-xs">
                      {formatBRLFull(p.valor)}
                    </TableCell>
                  </TableRow>
                ))}
                {recent.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      Nenhum registro encontrado para os filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>

        <footer className="pb-4 pt-2 text-center text-xs text-muted-foreground">
          Dashboard gerado a partir de CONTROLE_DE_PAGAMENTOS.xlsx
        </footer>
      </main>
    </div>
  );
}
