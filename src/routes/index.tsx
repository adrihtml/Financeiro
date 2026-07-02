import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";

import { useFinance, BRL, type TxKind } from "@/lib/finance-store";
import { BillsList } from "@/components/BillsList";
import {
  AttentionItems,
  NameHeader,
  NewTransactionButton,
  RecentTransactions,
  SavingsCard,
  StatCard,
  TransactionDialog,
  TransactionList,
} from "@/components/FinanceParts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel financeiro pessoal" },
      {
        name: "description",
        content:
          "Controle gastos, guarde dinheiro e separe contas indispensáveis e dispensáveis num só painel calmo e direto.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const finance = useFinance();
  const { state, hydrated } = finance;

  const [txOpen, setTxOpen] = React.useState(false);
  const [defaultKind, setDefaultKind] = React.useState<TxKind>("essential");

  const income = state.transactions
    .filter((t) => t.kind === "income")
    .reduce((s, t) => s + t.amount, 0);
  const essentialSpend = state.transactions
    .filter((t) => t.kind === "essential")
    .reduce((s, t) => s + t.amount, 0);
  const dispensableSpend = state.transactions
    .filter((t) => t.kind === "dispensable")
    .reduce((s, t) => s + t.amount, 0);
  const paidBills = state.bills
    .filter((b) => b.paidDate)
    .reduce((s, b) => s + b.amount, 0);

  const totalSpend = essentialSpend + dispensableSpend + paidBills;
  const balance = income - totalSpend - state.goal.current;

  const overdueBills = state.bills.filter(
    (b) =>
      !b.paidDate &&
      new Date(b.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)),
  ).length;

  const spendRatio = income > 0 ? Math.min(1, totalSpend / income) : 0;

  const openNewTx = (kind: TxKind = "essential") => {
    setDefaultKind(kind);
    setTxOpen(true);
  };

  const essentialTxs = state.transactions.filter((t) => t.kind === "essential");
  const dispensableTxs = state.transactions.filter(
    (t) => t.kind === "dispensable",
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-medium text-brand-deep">Visão Geral</span>
          <NewTransactionButton onClick={() => openNewTx("essential")} />
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12">
          <NameHeader
            name={state.name}
            onChange={finance.setName}
            hydrated={hydrated}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard
              label="Saldo disponível"
              value={BRL.format(balance)}
              footer={
                <span
                  className={
                    "rounded px-2 py-0.5 text-xs font-medium " +
                    (balance >= 0
                      ? "bg-accent text-accent-foreground"
                      : "bg-alert-surface text-alert")
                  }
                >
                  {income > 0
                    ? `${Math.round((balance / income) * 100)}% da receita`
                    : "Sem receita registrada"}
                </span>
              }
            />
            <StatCard
              label="Gastos totais"
              value={BRL.format(totalSpend)}
              footer={
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-muted-foreground/60 transition-all"
                    style={{ width: `${spendRatio * 100}%` }}
                  />
                </div>
              }
            />
            <StatCard
              label="Reserva guardada"
              value={BRL.format(state.goal.current)}
              footer={
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
                  <div
                    className="h-full rounded-full bg-brand-accent transition-all"
                    style={{
                      width: `${state.goal.target > 0 ? Math.min(100, (state.goal.current / state.goal.target) * 100) : 0}%`,
                    }}
                  />
                </div>
              }
            />
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <BillsList
              bills={state.bills}
              hydrated={hydrated}
              onToggle={finance.toggleBillPaid}
              onRemove={finance.removeBill}
              onAdd={finance.addBill}
              onUpdate={finance.updateBill}
            />

            <TransactionList
              title="Contas Indispensáveis"
              subtitle="Prioridade máxima"
              transactions={essentialTxs}
              emptyText="Nenhum gasto indispensável registrado. Adicione uma transação para começar."
              toneClass="text-muted-foreground"
              onRemove={finance.removeTransaction}
            />

            <div className="-mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => openNewTx("essential")}
              >
                + Adicionar indispensável
              </Button>
            </div>

            <TransactionList
              title="Contas Dispensáveis"
              subtitle="Oportunidade de corte"
              transactions={dispensableTxs}
              emptyText="Nenhum gasto dispensável registrado."
              toneClass="text-warn"
              onRemove={finance.removeTransaction}
            />

            <div className="-mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => openNewTx("dispensable")}
              >
                + Adicionar dispensável
              </Button>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <AttentionItems
              overdueBills={overdueBills}
              dispensableSpend={dispensableSpend}
              essentialSpend={essentialSpend + paidBills}
              income={income}
            />

            <SavingsCard
              goal={state.goal}
              onDeposit={finance.deposit}
              onEditGoal={finance.setGoal}
            />

            <RecentTransactions
              transactions={state.transactions}
              onRemove={finance.removeTransaction}
            />
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-border px-6 py-8">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Painel financeiro pessoal · dados salvos apenas neste navegador
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (
                window.confirm(
                  "Apagar todos os dados? Essa ação não pode ser desfeita.",
                )
              ) {
                finance.resetAll();
              }
            }}
          >
            <RotateCcw className="mr-1.5 size-3" />
            Zerar dados
          </Button>
        </div>
      </footer>

      <TransactionDialog
        open={txOpen}
        onOpenChange={setTxOpen}
        defaultKind={defaultKind}
        onSubmit={(tx) => {
          finance.addTransaction(tx);
          setTxOpen(false);
        }}
      />
    </div>
  );
}
