import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, AlertTriangle, Clock, Pencil, PiggyBank } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRL, type Transaction, type TxKind, type SavingsGoal } from "@/lib/finance-store";

const KIND_LABEL: Record<TxKind, string> = {
  income: "Receita",
  essential: "Indispensável",
  dispensable: "Dispensável",
};

export function TransactionDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultKind = "essential",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (tx: Omit<Transaction, "id">) => void;
  defaultKind?: TxKind;
}) {
  const [kind, setKind] = React.useState<TxKind>(defaultKind);
  const [label, setLabel] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [amount, setAmount] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setKind(defaultKind);
      setLabel("");
      setCategory("");
      setAmount("");
    }
  }, [open, defaultKind]);

  const parsed = parseFloat(amount.replace(",", "."));
  const canSubmit =
    label.trim().length > 0 && !Number.isNaN(parsed) && parsed > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      kind,
      label: label.trim().slice(0, 60),
      category: category.trim().slice(0, 30) || KIND_LABEL[kind],
      amount: parsed,
      date: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Nova transação
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as TxKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita (entrada)</SelectItem>
                  <SelectItem value="essential">Gasto indispensável</SelectItem>
                  <SelectItem value="dispensable">Gasto dispensável</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tx-label">Descrição</Label>
              <Input
                id="tx-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex.: Salário, Mercado, Cinema"
                maxLength={60}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tx-cat">Categoria (opcional)</Label>
              <Input
                id="tx-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex.: Alimentação, Transporte"
                maxLength={30}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tx-amount">Valor (R$)</Label>
              <Input
                id="tx-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
                }
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-brand text-primary-foreground hover:bg-brand-deep"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TransactionList({
  title,
  subtitle,
  transactions,
  emptyText,
  toneClass,
  onRemove,
}: {
  title: string;
  subtitle: string;
  transactions: Transaction[];
  emptyText: string;
  toneClass: string;
  onRemove: (id: string) => void;
}) {
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        <span
          className={cn(
            "text-xs font-medium uppercase tracking-wider",
            toneClass,
          )}
        >
          {subtitle} · {BRL.format(total)}
        </span>
      </div>
      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
        {transactions.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((t) => (
              <li
                key={t.id}
                className="group flex items-center justify-between p-4 transition-colors hover:bg-surface-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category} ·{" "}
                    {format(new Date(t.date), "dd MMM", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium tabular-nums">
                    {BRL.format(t.amount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-within:opacity-100"
                    onClick={() => onRemove(t.id)}
                    aria-label="Excluir transação"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function RecentTransactions({
  transactions,
  onRemove,
}: {
  transactions: Transaction[];
  onRemove: (id: string) => void;
}) {
  const recent = transactions.slice(0, 6);
  return (
    <section>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Transações Recentes
      </h3>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma transação ainda.
        </p>
      ) : (
        <div className="space-y-4">
          {recent.map((t) => {
            const positive = t.kind === "income";
            return (
              <div
                key={t.id}
                className="group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {positive ? (
                    <ArrowUpRight
                      className="size-3.5 text-brand-accent"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <ArrowDownRight
                      className="size-3.5 text-muted-foreground/70"
                      strokeWidth={2}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {t.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      positive ? "text-brand-accent" : "text-muted-foreground",
                    )}
                  >
                    {positive ? "+ " : "- "}
                    {BRL.format(t.amount)}
                  </span>
                  <button
                    onClick={() => onRemove(t.id)}
                    aria-label="Excluir"
                    className="text-muted-foreground/60 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function AttentionItems({
  overdueBills,
  dispensableSpend,
  essentialSpend,
  income,
}: {
  overdueBills: number;
  dispensableSpend: number;
  essentialSpend: number;
  income: number;
}) {
  const items: { tone: "warn" | "alert"; title: string; body: string }[] = [];

  if (overdueBills > 0) {
    items.push({
      tone: "alert",
      title: "Contas atrasadas",
      body: `Você tem ${overdueBills} conta${overdueBills > 1 ? "s" : ""} vencida${overdueBills > 1 ? "s" : ""} sem pagamento registrado.`,
    });
  }

  if (income > 0 && dispensableSpend / income > 0.2) {
    items.push({
      tone: "warn",
      title: "Gastos dispensáveis altos",
      body: `Dispensáveis representam ${Math.round((dispensableSpend / income) * 100)}% da sua receita.`,
    });
  }

  if (income > 0 && essentialSpend + dispensableSpend > income) {
    items.push({
      tone: "alert",
      title: "Gastos acima da receita",
      body: `Você gastou ${BRL.format(essentialSpend + dispensableSpend - income)} a mais do que recebeu.`,
    });
  }

  if (items.length === 0) {
    items.push({
      tone: "warn",
      title: "Tudo sob controle",
      body: "Nenhum item de atenção no momento. Continue registrando suas transações.",
    });
  }

  return (
    <section>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Itens de Atenção
      </h3>
      <div className="space-y-3">
        {items.map((it, i) => {
          const Icon = it.tone === "alert" ? Clock : AlertTriangle;
          const surface =
            it.tone === "alert" ? "bg-alert-surface ring-alert/10" : "bg-warn-surface ring-warn/10";
          const iconColor = it.tone === "alert" ? "text-alert" : "text-warn";
          const titleColor =
            it.tone === "alert" ? "text-alert-foreground" : "text-warn-foreground";
          const bodyColor =
            it.tone === "alert"
              ? "text-alert-foreground/80"
              : "text-warn-foreground/80";
          return (
            <div
              key={i}
              className={cn("flex gap-3 rounded-xl p-4 ring-1", surface)}
            >
              <Icon
                className={cn("mt-0.5 size-4 shrink-0", iconColor)}
                strokeWidth={2}
              />
              <div>
                <p className={cn("text-sm font-medium", titleColor)}>
                  {it.title}
                </p>
                <p className={cn("text-pretty text-xs leading-normal", bodyColor)}>
                  {it.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SavingsCard({
  goal,
  onDeposit,
  onEditGoal,
}: {
  goal: SavingsGoal;
  onDeposit: (amount: number) => void;
  onEditGoal: (goal: SavingsGoal) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [target, setTarget] = React.useState(String(goal.target));
  const [label, setLabel] = React.useState(goal.label);

  const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
  const remaining = Math.max(0, goal.target - goal.current);

  return (
    <section className="rounded-2xl bg-brand-deep p-6 text-primary-foreground shadow-lg ring-1 ring-black/5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium">Guardar Dinheiro</h3>
        <button
          onClick={() => {
            setLabel(goal.label);
            setTarget(String(goal.target));
            setEditOpen(true);
          }}
          className="text-primary-foreground/70 hover:text-primary-foreground"
          aria-label="Editar meta"
        >
          <Pencil className="size-3.5" />
        </button>
      </div>

      <div className="mb-2 flex items-end justify-between">
        <span className="font-serif text-3xl">{BRL.format(goal.current)}</span>
        <span className="rounded bg-brand/60 px-2 py-0.5 text-xs font-medium">
          Faltam {BRL.format(remaining)}
        </span>
      </div>
      <p className="mb-6 text-xs text-primary-foreground/70">
        Meta: {goal.label} · {BRL.format(goal.target)}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-brand/60">
        <div
          className="h-full rounded-full bg-brand-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <Button
        onClick={() => {
          setAmount("");
          setOpen(true);
        }}
        className="mt-6 w-full rounded-lg bg-brand/70 py-2.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-brand"
      >
        <PiggyBank className="mr-1.5 size-4" />
        Aportar Agora
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = parseFloat(amount.replace(",", "."));
              if (!Number.isNaN(v) && v > 0) {
                onDeposit(v);
                setOpen(false);
              }
            }}
          >
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                Novo aporte
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-1.5 py-4">
              <Label htmlFor="dep">Valor (R$)</Label>
              <Input
                id="dep"
                autoFocus
                inputMode="decimal"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
                }
                placeholder="0,00"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-brand text-primary-foreground hover:bg-brand-deep"
              >
                Aportar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const t = parseFloat(target.replace(",", "."));
              if (!Number.isNaN(t) && t > 0 && label.trim()) {
                onEditGoal({
                  ...goal,
                  label: label.trim().slice(0, 40),
                  target: t,
                });
                setEditOpen(false);
              }
            }}
          >
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                Editar meta
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="glabel">Nome da meta</Label>
                <Input
                  id="glabel"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gtarget">Valor alvo (R$)</Label>
                <Input
                  id="gtarget"
                  inputMode="decimal"
                  value={target}
                  onChange={(e) =>
                    setTarget(e.target.value.replace(/[^0-9.,]/g, ""))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-brand text-primary-foreground hover:bg-brand-deep"
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function NameHeader({
  name,
  onChange,
  hydrated,
}: {
  name: string;
  onChange: (name: string) => void;
  hydrated: boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(name);

  React.useEffect(() => {
    setValue(name);
  }, [name]);

  const displayName = hydrated ? name : "";

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onChange(value.trim());
          setEditing(false);
        }}
        className="mb-8 flex items-center gap-2"
      >
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Seu nome"
          className="max-w-xs font-serif text-xl"
          onBlur={() => {
            onChange(value.trim());
            setEditing(false);
          }}
        />
      </form>
    );
  }

  return (
    <h1 className="mb-8 text-balance font-serif text-3xl font-medium leading-tight">
      {displayName ? (
        <>
          Olá,{" "}
          <button
            onClick={() => setEditing(true)}
            className="underline decoration-brand/40 decoration-2 underline-offset-4 transition-colors hover:decoration-brand"
          >
            {displayName}
          </button>
          .
        </>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-muted-foreground underline decoration-brand/40 decoration-2 underline-offset-4 transition-colors hover:decoration-brand hover:text-foreground"
        >
          {hydrated ? "Clique para definir seu nome" : "Carregando..."}
        </button>
      )}
    </h1>
  );
}

export function StatCard({
  label,
  value,
  footer,
}: {
  label: string;
  value: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border">
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-medium tracking-tight tabular-nums">{value}</p>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

export function NewTransactionButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className="inline-flex items-center rounded-lg bg-brand py-2 pl-2 pr-3 text-sm font-medium text-primary-foreground shadow-sm ring-1 ring-brand transition-transform hover:bg-brand-deep active:scale-95"
    >
      <Plus className="mr-2 size-4 shrink-0" strokeWidth={2.5} />
      Nova Transação
    </Button>
  );
}
