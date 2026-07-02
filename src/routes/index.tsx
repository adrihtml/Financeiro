import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Home,
  Zap,
  ShoppingCart,
  Tv,
  Heart,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { BillsList } from "@/components/BillsList";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vela — Painel financeiro pessoal" },
      {
        name: "description",
        content:
          "Controle gastos, guarde dinheiro e separe contas indispensáveis e dispensáveis num só painel calmo e direto.",
      },
      { property: "og:title", content: "Vela — Painel financeiro pessoal" },
      {
        property: "og:description",
        content:
          "Controle gastos, guarde dinheiro e separe contas indispensáveis e dispensáveis num só painel calmo e direto.",
      },
    ],
  }),
  component: DashboardPage,
});

type Indispensavel = {
  id: string;
  label: string;
  meta: string;
  amount: string;
  action: "pagar" | "agendado" | "ajustar";
  icon: typeof Home;
};

type Dispensavel = {
  id: string;
  label: string;
  meta: string;
  amount: string;
  action: "cancelar" | "reduzir";
  icon: typeof Tv;
};

const indispensaveis: Indispensavel[] = [
  {
    id: "aluguel",
    label: "Aluguel e Condomínio",
    meta: "Vence em 5 dias",
    amount: "R$ 2.450,00",
    action: "pagar",
    icon: Home,
  },
  {
    id: "energia",
    label: "Energia Elétrica",
    meta: "Débito automático",
    amount: "R$ 312,40",
    action: "agendado",
    icon: Zap,
  },
  {
    id: "mercado",
    label: "Supermercado",
    meta: "Gasto estimado",
    amount: "R$ 1.200,00",
    action: "ajustar",
    icon: ShoppingCart,
  },
];

const dispensaveis: Dispensavel[] = [
  {
    id: "streaming",
    label: "Assinaturas de Streaming",
    meta: "Netflix, HBO, Disney+",
    amount: "R$ 145,80",
    action: "cancelar",
    icon: Tv,
  },
  {
    id: "lazer",
    label: "Restaurantes & Lazer",
    meta: "Média das últimas 4 semanas",
    amount: "R$ 890,00",
    action: "reduzir",
    icon: Heart,
  },
];

function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div className="hidden items-center gap-6 md:flex">
              <a href="#" className="text-sm font-medium text-brand-deep">
                Visão Geral
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Relatórios
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Planejamento
              </a>
            </div>
          </div>
          <button className="inline-flex items-center rounded-lg bg-brand py-2 pl-2 pr-3 text-sm font-medium text-primary-foreground shadow-sm ring-1 ring-brand transition-transform hover:bg-brand-deep active:scale-95">
            <Plus className="mr-2 size-4 shrink-0" strokeWidth={2.5} />
            Nova Transação
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Header & Core Stats */}
        <header className="mb-12">
          <h1 className="mb-8 text-balance font-serif text-3xl font-medium leading-tight">
            Boa tarde, Marcelo.
          </h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard
              label="Saldo Total"
              value="R$ 14.820,40"
              footer={
                <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  +2,4% este mês
                </span>
              }
            />
            <StatCard
              label="Gastos Mensais"
              value="R$ 4.290,15"
              footer={
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-3/4 rounded-full bg-muted-foreground/60" />
                </div>
              }
            />
            <StatCard
              label="Meta de Reserva"
              value="R$ 8.500,00"
              footer={
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
                  <div
                    className="h-full rounded-full bg-brand-accent"
                    style={{ width: "68%" }}
                  />
                </div>
              }
            />
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Column: Split Expenses */}
          <div className="space-y-8 lg:col-span-8">
            <BillsList />
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">Contas Indispensáveis</h2>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Prioridade Máxima
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
                <ul className="divide-y divide-border">
                  {indispensaveis.map((item) => (
                    <ExpenseRow
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      meta={item.meta}
                      amount={item.amount}
                      cta={
                        item.action === "pagar" ? (
                          <button className="text-[10px] font-semibold uppercase tracking-tight text-brand-accent hover:underline">
                            Pagar Agora
                          </button>
                        ) : item.action === "agendado" ? (
                          <span className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground">
                            Agendado
                          </span>
                        ) : (
                          <button className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground hover:text-foreground">
                            Ajustar
                          </button>
                        )
                      }
                    />
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">Contas Dispensáveis</h2>
                <span className="text-xs font-medium uppercase tracking-wider text-warn">
                  Oportunidade de Corte
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
                <ul className="divide-y divide-border">
                  {dispensaveis.map((item) => (
                    <ExpenseRow
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      meta={item.meta}
                      amount={item.amount}
                      cta={
                        item.action === "cancelar" ? (
                          <button className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground transition-colors hover:text-destructive">
                            Cancelar
                          </button>
                        ) : (
                          <button className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground transition-colors hover:text-warn">
                            Reduzir
                          </button>
                        )
                      }
                    />
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Right Column: Alerts & Goals */}
          <div className="space-y-6 lg:col-span-4">
            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Itens de Atenção
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3 rounded-xl bg-warn-surface p-4 ring-1 ring-warn/10">
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-warn"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="text-sm font-medium text-warn-foreground">
                      Limite Atingido
                    </p>
                    <p className="text-pretty text-xs leading-normal text-warn-foreground/80">
                      Você atingiu 90% do seu orçamento planejado para Lazer
                      esta semana.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-xl bg-alert-surface p-4 ring-1 ring-alert/10">
                  <Clock
                    className="mt-0.5 size-4 shrink-0 text-alert"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="text-sm font-medium text-alert-foreground">
                      Vencimento Próximo
                    </p>
                    <p className="text-pretty text-xs leading-normal text-alert-foreground/80">
                      A fatura do cartão vence em 2 dias. Saldo disponível para
                      pagamento.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-brand-deep p-6 text-primary-foreground shadow-lg ring-1 ring-black/5">
              <h3 className="mb-4 text-sm font-medium">Guardar Dinheiro</h3>
              <div className="mb-2 flex items-end justify-between">
                <span className="font-serif text-3xl">R$ 12.450</span>
                <span className="rounded bg-brand/60 px-2 py-0.5 text-xs font-medium">
                  Faltam R$ 3.550
                </span>
              </div>
              <p className="mb-6 text-xs text-primary-foreground/70">
                Meta: Reserva de Emergência 2026
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-brand/60">
                <div
                  className="h-full rounded-full bg-brand-accent"
                  style={{ width: "78%" }}
                />
              </div>
              <button className="mt-6 w-full rounded-lg bg-brand/70 py-2.5 text-xs font-medium transition-colors hover:bg-brand">
                Aportar Agora
              </button>
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Transações Recentes
              </h3>
              <div className="space-y-4">
                <TxRow positive label="Pix Recebido" value="+ R$ 450,00" />
                <TxRow label="Padaria Pão de Mel" value="- R$ 24,50" />
                <TxRow label="Farmácia Central" value="- R$ 82,90" />
                <TxRow label="Uber" value="- R$ 36,40" />
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-border px-6 py-8">
        <p className="text-xs text-muted-foreground">
          Painel financeiro pessoal
        </p>
      </footer>
    </div>
  );
}

function StatCard({
  label,
  value,
  footer,
}: {
  label: string;
  value: string;
  footer: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border">
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-medium tracking-tight">{value}</p>
      <div className="mt-4">{footer}</div>
    </div>
  );
}

function ExpenseRow({
  icon: Icon,
  label,
  meta,
  amount,
  cta,
}: {
  icon: typeof Home;
  label: string;
  meta: string;
  amount: string;
  cta: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between p-4 transition-colors hover:bg-surface-muted">
      <div className="flex items-center gap-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{meta}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{amount}</p>
        {cta}
      </div>
    </li>
  );
}

function TxRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {positive ? (
          <ArrowUpRight className="size-3.5 text-brand-accent" strokeWidth={2.5} />
        ) : (
          <ArrowDownRight className="size-3.5 text-muted-foreground/70" strokeWidth={2} />
        )}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span
        className={
          "text-sm font-medium " +
          (positive ? "text-brand-accent" : "text-muted-foreground")
        }
      >
        {value}
      </span>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i}>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
