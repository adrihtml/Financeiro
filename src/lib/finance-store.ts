import * as React from "react";

export type TxKind = "income" | "essential" | "dispensable";

export type Transaction = {
  id: string;
  kind: TxKind;
  label: string;
  category: string;
  amount: number;
  date: string; // ISO
};

export type Bill = {
  id: string;
  label: string;
  amount: number;
  dueDate: string; // ISO
  paidDate: string | null;
};

export type SavingsGoal = {
  label: string;
  target: number;
  current: number;
};

export type FinanceState = {
  name: string;
  transactions: Transaction[];
  bills: Bill[];
  goal: SavingsGoal;
};

const STORAGE_KEY = "finance-dashboard-v2";

const defaultState: FinanceState = {
  name: "",
  transactions: [],
  bills: [],
  goal: {
    label: "Reserva de emergência",
    target: 10000,
    current: 0,
  },
};

function load(): FinanceState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function save(state: FinanceState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function useFinance() {
  // Start with SSR-safe default; hydrate from localStorage after mount.
  const [state, setState] = React.useState<FinanceState>(defaultState);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated) save(state);
  }, [state, hydrated]);

  const api = React.useMemo(
    () => ({
      setName: (name: string) =>
        setState((s) => ({ ...s, name: name.slice(0, 40) })),

      addTransaction: (tx: Omit<Transaction, "id">) =>
        setState((s) => ({
          ...s,
          transactions: [
            { ...tx, id: crypto.randomUUID() },
            ...s.transactions,
          ],
        })),

      removeTransaction: (id: string) =>
        setState((s) => ({
          ...s,
          transactions: s.transactions.filter((t) => t.id !== id),
        })),

      addBill: (bill: Omit<Bill, "id">) =>
        setState((s) => ({
          ...s,
          bills: [...s.bills, { ...bill, id: crypto.randomUUID() }],
        })),

      updateBill: (bill: Bill) =>
        setState((s) => ({
          ...s,
          bills: s.bills.map((b) => (b.id === bill.id ? bill : b)),
        })),

      removeBill: (id: string) =>
        setState((s) => ({
          ...s,
          bills: s.bills.filter((b) => b.id !== id),
        })),

      toggleBillPaid: (id: string) =>
        setState((s) => ({
          ...s,
          bills: s.bills.map((b) =>
            b.id === id
              ? {
                  ...b,
                  paidDate: b.paidDate ? null : new Date().toISOString(),
                }
              : b,
          ),
        })),

      setGoal: (goal: SavingsGoal) => setState((s) => ({ ...s, goal })),

      deposit: (amount: number) =>
        setState((s) => ({
          ...s,
          goal: { ...s.goal, current: s.goal.current + amount },
        })),

      resetAll: () => setState(defaultState),
    }),
    [],
  );

  return { state, hydrated, ...api };
}

export const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
