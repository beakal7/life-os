"use client";

import { useRef } from "react";
import type { LifeOSData, Stock } from "@/types";
import { StatGrid }   from "@/components/ui/StatGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { money, uid, todayKey } from "@/lib/storage";

interface FinanceTabProps {
  data: LifeOSData;
  onAddItem:          (key: "stocks" | "budget", item: Record<string, unknown>) => void;
  onRemoveItem:       (key: "stocks" | "budget", id: string) => void;
  onUpdateStockPrice: (id: string, price: number) => void;
  onToast:            (msg: string) => void;
}

export function FinanceTab({ data, onAddItem, onRemoveItem, onUpdateStockPrice, onToast }: FinanceTabProps) {
  const tickerRef = useRef<HTMLInputElement>(null);
  const sharesRef = useRef<HTMLInputElement>(null);
  const costRef   = useRef<HTMLInputElement>(null);
  const priceRef  = useRef<HTMLInputElement>(null);
  const expNameRef   = useRef<HTMLInputElement>(null);
  const expAmountRef = useRef<HTMLInputElement>(null);

  const invested = data.stocks.reduce((s, x) => s + x.shares * x.cost, 0);
  const currentValue = data.stocks.reduce((s, x) => s + x.shares * x.price, 0);
  const pnl = currentValue - invested;
  const spent = data.budget.reduce((s, x) => s + (Number(x.amount) || 0), 0);

  const addStock = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = tickerRef.current?.value.trim();
    const shares = Number(sharesRef.current?.value);
    const cost   = Number(costRef.current?.value);
    const price  = Number(priceRef.current?.value);
    if (!ticker || !Number.isFinite(shares) || !Number.isFinite(cost) || !Number.isFinite(price) || shares < 0 || cost < 0 || price < 0) {
      onToast("Enter valid non-negative prices and shares"); return;
    }
    onAddItem("stocks", { id: uid(), ticker: ticker.toUpperCase(), shares, cost, price, date: todayKey() });
    [tickerRef, sharesRef, costRef, priceRef].forEach(r => { if (r.current) r.current.value = ""; });
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const name   = expNameRef.current?.value.trim();
    const amount = Number(expAmountRef.current?.value);
    if (!name || !Number.isFinite(amount)) { onToast("Please fill in all fields"); return; }
    onAddItem("budget", { id: uid(), name, amount, date: todayKey() });
    if (expNameRef.current) expNameRef.current.value = "";
    if (expAmountRef.current) expAmountRef.current.value = "";
  };

  const editPrice = (stock: Stock) => {
    const v = window.prompt(`Enter the latest manual price for ${stock.ticker}`, String(stock.price));
    if (v === null) return;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) { onToast("Invalid price"); return; }
    onUpdateStockPrice(stock.id, n);
  };

  return (
    <>
      <div className="card" style={{ borderColor: "#2a4c62", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
          <span className="tag">MANUAL PRICE TRACKING</span>
          <span style={{ fontSize: 12, color: "#9c92a9" }}>No brokerage connection or live market feed. Enter prices yourself.</span>
        </div>
      </div>

      <StatGrid stats={[
        { label: "Portfolio value",  value: money(currentValue), note: "Based on entered prices" },
        { label: "Unrealized P/L",   value: money(pnl), note: invested ? ((pnl / invested) * 100).toFixed(1) + "%" : "No positions" },
        { label: "Total cost basis", value: money(invested),     note: "Shares × avg cost" },
        { label: "Expenses logged",  value: money(spent),        note: "Manual entries" },
      ]} />

      <section className="card" style={{ marginBottom: 14 }}>
        <h2>Stock & ETF watchlist / positions</h2>
        <p style={{ fontSize: 12, marginBottom: 12 }}>Add your positions to calculate portfolio value and unrealized gains.</p>
        <form onSubmit={addStock} style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <input ref={tickerRef} className="life-input" placeholder="Ticker, e.g. VOO"   aria-label="Ticker"           required style={{ flex: 1, minWidth: 80 }} />
          <input ref={sharesRef} className="life-input" placeholder="Shares"              aria-label="Shares"           type="number" min="0" step="any" required style={{ flex: 1, minWidth: 80 }} />
          <input ref={costRef}   className="life-input" placeholder="Avg cost / share"    aria-label="Average cost"     type="number" min="0" step="any" required style={{ flex: 1, minWidth: 80 }} />
          <input ref={priceRef}  className="life-input" placeholder="Current price"       aria-label="Current price"    type="number" min="0" step="any" required style={{ flex: 1, minWidth: 80 }} />
          <button className="btn-action" type="submit">Add stock</button>
        </form>
        <div style={{ overflowX: "auto" }}>
          <table className="life-table">
            <thead><tr><th>Ticker</th><th>Shares</th><th>Cost basis</th><th>Market value*</th><th>Unrealized P/L</th><th></th></tr></thead>
            <tbody>
              {data.stocks.length > 0 ? data.stocks.map(s => {
                const gain = s.shares * (s.price - s.cost);
                return (
                  <tr key={s.id}>
                    <td><strong>{s.ticker.toUpperCase()}</strong></td>
                    <td>{s.shares}</td>
                    <td>{money(s.shares * s.cost)}</td>
                    <td>{money(s.shares * s.price)}</td>
                    <td className={gain >= 0 ? "text-positive" : "text-negative"}>{money(gain)}</td>
                    <td>
                      <button className="btn-ghost" style={{ marginRight: 4, padding: "4px 8px", fontSize: 11 }} onClick={() => editPrice(s)}>Price</button>
                      <button className="btn-ghost" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => onRemoveItem("stocks", s.id)}>×</button>
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan={6} style={{ color: "#9c92a9" }}>No stocks added yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: "#9c92a9" }}>*Manual share-price entries; no real-time data.</p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <section className="card">
          <h2>Expense log</h2>
          <form onSubmit={addExpense} style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
            <input ref={expNameRef}   className="life-input" placeholder="Expense name / category" aria-label="Expense name"   required style={{ flex: 1, minWidth: 120 }} />
            <input ref={expAmountRef} className="life-input" placeholder="Amount ($)"               aria-label="Expense amount" type="number" min="0" step="any" required style={{ flex: 1, minWidth: 80 }} />
            <button className="btn-action" type="submit">Add</button>
          </form>
          <div style={{ display: "grid", gap: 8 }}>
            {data.budget.length > 0 ? data.budget.map(b => (
              <div key={b.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: 11, border: "1px solid #382b40", borderRadius: 11, background: "#16101d" }}>
                <label style={{ flex: 1 }}>{b.name} <span style={{ fontSize: 12, color: "#9c92a9" }}>{b.date}</span></label>
                <strong>{money(b.amount)}</strong>
                <button onClick={() => onRemoveItem("budget", b.id)} style={{ background: "none", border: 0, color: "#a48caf", fontSize: 18 }}>×</button>
              </div>
            )) : <EmptyState message="No expenses logged." />}
          </div>
        </section>
        <section className="card">
          <h2>Next financial features</h2>
          <p>Budget categories, monthly cash-flow charts, savings milestones, dividends, and optional read-only market data and brokerage connections.</p>
          <div className="meter"><div className="meter-fill" style={{ width: "30%" }} /></div>
          <p style={{ fontSize: 12 }}>Start by tracking your holdings and spending manually.</p>
        </section>
      </div>
    </>
  );
}
