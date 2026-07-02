import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Pencil, Trash2, Plus, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BRL, type Bill } from "@/lib/finance-store";

function fmt(d: string | null) {
  if (!d) return "—";
  return format(new Date(d), "dd MMM yyyy", { locale: ptBR });
}

export function BillsList({
  bills,
  hydrated,
  onToggle,
  onRemove,
  onAdd,
  onUpdate,
}: {
  bills: Bill[];
  hydrated: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (bill: Omit<Bill, "id">) => void;
  onUpdate: (bill: Bill) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Bill | null>(null);

  const total = bills.reduce((sum, b) => sum + b.amount, 0);
  const pago = bills
    .filter((b) => b.paidDate)
    .reduce((sum, b) => sum + b.amount, 0);
  const aberto = total - pago;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Contas a Pagar</h2>
          <p className="text-xs text-muted-foreground">
            {BRL.format(aberto)} em aberto · {BRL.format(pago)} já pago
          </p>
        </div>
        <Button
          size="sm"
          className="bg-brand text-primary-foreground hover:bg-brand-deep"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-1.5 size-4" strokeWidth={2.5} />
          Nova conta
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
        {!hydrated || bills.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {hydrated
              ? "Nenhuma conta cadastrada. Clique em 'Nova conta' para começar."
              : "Carregando..."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {bills.map((bill) => {
              const paid = !!bill.paidDate;
              const overdue =
                !paid &&
                new Date(bill.dueDate) <
                  new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <li
                  key={bill.id}
                  className="group flex items-center gap-4 p-4 transition-colors hover:bg-surface-muted"
                >
                  <Checkbox
                    checked={paid}
                    onCheckedChange={() => onToggle(bill.id)}
                    className="size-5 rounded-md data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                    aria-label={paid ? "Marcar como não pago" : "Marcar como pago"}
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        paid && "text-muted-foreground line-through",
                      )}
                    >
                      {bill.label}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className={cn(overdue && "font-medium text-alert")}>
                        Vence {fmt(bill.dueDate)}
                      </span>
                      {paid && (
                        <span className="inline-flex items-center gap-1 text-brand-accent">
                          <Check className="size-3" strokeWidth={2.5} />
                          Pago em {fmt(bill.paidDate)}
                        </span>
                      )}
                      {overdue && (
                        <span className="rounded bg-alert-surface px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-alert">
                          Atrasada
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-medium tabular-nums",
                        paid && "text-muted-foreground",
                      )}
                    >
                      {BRL.format(bill.amount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditing(bill);
                        setOpen(true);
                      }}
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(bill.id)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <BillDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSubmit={(bill) => {
          if (editing) onUpdate(bill as Bill);
          else {
            const { id: _id, ...rest } = bill;
            void _id;
            onAdd(rest);
          }
          setOpen(false);
        }}
      />
    </section>
  );
}

function BillDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Bill | null;
  onSubmit: (bill: Bill) => void;
}) {
  const [label, setLabel] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);
  const [paidDate, setPaidDate] = React.useState<Date | undefined>(undefined);

  React.useEffect(() => {
    if (open) {
      setLabel(editing?.label ?? "");
      setAmount(editing ? String(editing.amount) : "");
      setDueDate(editing ? new Date(editing.dueDate) : new Date());
      setPaidDate(editing?.paidDate ? new Date(editing.paidDate) : undefined);
    }
  }, [open, editing]);

  const parsedAmount = parseFloat(amount.replace(",", "."));
  const canSubmit =
    label.trim().length > 0 &&
    !!dueDate &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount >= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !dueDate) return;
    onSubmit({
      id: editing?.id ?? "",
      label: label.trim().slice(0, 80),
      amount: parsedAmount,
      dueDate: dueDate.toISOString(),
      paidDate: paidDate ? paidDate.toISOString() : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editing ? "Editar conta" : "Nova conta"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="label">Descrição</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex.: Aluguel, Energia, Internet"
                maxLength={80}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
                }
                placeholder="0,00"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Vencimento</Label>
                <DateField value={dueDate} onChange={setDueDate} />
              </div>
              <div className="space-y-1.5">
                <Label>Pago em</Label>
                <DateField
                  value={paidDate}
                  onChange={setPaidDate}
                  placeholder="Em aberto"
                  clearable
                />
              </div>
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
              {editing ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DateField({
  value,
  onChange,
  placeholder = "Selecionar data",
  clearable,
}: {
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  placeholder?: string;
  clearable?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? (
            format(value, "dd MMM yyyy", { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          locale={ptBR}
          initialFocus
          className={cn("pointer-events-auto p-3")}
        />
        {clearable && value && (
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              Limpar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
