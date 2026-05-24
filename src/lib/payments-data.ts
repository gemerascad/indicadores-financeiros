import rawData from "@/data/pagamentos.json";

export type RawPayment = {
  r: string | null;
  dc: string | null;
  dp: string | null;
  a: string | null;
  t: string | null;
  v: number;
  e: string | null;
  s: string | null;
  m: string | null;
  em: string | null;
};

export type Payment = {
  responsavel: string;
  dataPagamento: Date | null;
  dataConfirmacao: Date | null;
  area: string;
  tipo: string;
  valor: number;
  empresa: string;
  status: string;
  mes: string;
  emergencial: boolean;
};

const MES_ORDER = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
];

export const MES_LIST = MES_ORDER;

// --- Anonymization (dados fictícios para portfólio) ---
const respMap = new Map<string, string>();
const empMap = new Map<string, string>();
const labelFor = (
  raw: string,
  map: Map<string, string>,
  prefix: string,
): string => {
  const key = raw.trim().toUpperCase();
  if (!key) return `${prefix} —`;
  const existing = map.get(key);
  if (existing) return existing;
  const label = `${prefix} ${map.size + 1}`;
  map.set(key, label);
  return label;
};

// Hash determinístico simples para escalar valores sem expor números reais
const hashStr = (s: string): number => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
};

const scrambleValor = (v: number, seed: string): number => {
  if (!v) return 0;
  // fator entre 0.65 e 1.45
  const f = 0.65 + (hashStr(seed) % 1000) / 1250;
  const out = v * f;
  return Math.round(out * 100) / 100;
};

export const ALL_PAYMENTS: Payment[] = (rawData as RawPayment[]).map((r, i) => {
  const responsavel = labelFor(r.r || "", respMap, "Responsável");
  const empresa = labelFor(r.e || "", empMap, "Empresa");
  const seed = `${i}|${r.r}|${r.e}|${r.dp}|${r.v}`;
  return {
    responsavel,
    dataPagamento: r.dp ? new Date(r.dp + "T00:00:00") : null,
    dataConfirmacao: r.dc ? new Date(r.dc + "T00:00:00") : null,
    area: r.a || "—",
    tipo: (r.t || "—").trim(),
    valor: scrambleValor(Number(r.v) || 0, seed),
    empresa,
    status: (r.s || "—").trim(),
    mes: (r.m || "").trim(),
    emergencial: !!r.em,
  };
});


export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export const formatBRLFull = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatInt = (n: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export const formatCompact = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}k`;
  return formatBRL(n);
};

export type Filters = {
  meses: string[]; // empty = all
  responsaveis: string[];
  status: string[];
  tipos: string[];
  empresas: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
};

export const EMPTY_FILTERS: Filters = {
  meses: [],
  responsaveis: [],
  status: [],
  tipos: [],
  empresas: [],
  dateFrom: null,
  dateTo: null,
};

export function applyFilters(rows: Payment[], f: Filters): Payment[] {
  return rows.filter((p) => {
    if (f.meses.length && !f.meses.includes(p.mes)) return false;
    if (f.responsaveis.length && !f.responsaveis.includes(p.responsavel))
      return false;
    if (f.status.length && !f.status.includes(p.status)) return false;
    if (f.tipos.length && !f.tipos.includes(p.tipo)) return false;
    if (f.empresas.length && !f.empresas.includes(p.empresa)) return false;
    const d = p.dataPagamento;
    if (f.dateFrom && (!d || d < f.dateFrom)) return false;
    if (f.dateTo && (!d || d > f.dateTo)) return false;
    return true;
  });
}

export function uniqueSorted<T extends string>(rows: Payment[], key: keyof Payment): T[] {
  const set = new Set<string>();
  for (const r of rows) {
    const v = r[key];
    if (typeof v === "string" && v) set.add(v);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR")) as T[];
}

export function groupSum<K extends string>(
  rows: Payment[],
  key: (p: Payment) => K,
): { name: K; valor: number; qtd: number }[] {
  const map = new Map<K, { valor: number; qtd: number }>();
  for (const r of rows) {
    const k = key(r);
    const cur = map.get(k) || { valor: 0, qtd: 0 };
    cur.valor += r.valor;
    cur.qtd += 1;
    map.set(k, cur);
  }
  return Array.from(map.entries()).map(([name, v]) => ({ name, ...v }));
}

export const dateMinMax = (() => {
  let min: Date | null = null;
  let max: Date | null = null;
  for (const p of ALL_PAYMENTS) {
    const d = p.dataPagamento;
    if (!d) continue;
    if (!min || d < min) min = d;
    if (!max || d > max) max = d;
  }
  return { min, max };
})();
