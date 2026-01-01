"use client";

import React, { useState, useEffect } from "react";
import type { Expense } from "../types";
import DatePicker from "./DatePicker";

function pad(n: number) { return n < 10 ? `0${n}` : `${n}` }
function localISO(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` }

export default function ExpenseForm({
  onAdd,
}: {
  onAdd: (e: Expense) => void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => localISO());
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("expenses:v1");
      if (!raw) return;
      const items: Expense[] = JSON.parse(raw);
      const seen = new Set<string>();
      const list: string[] = [];
      // collect recent descriptions preserving order (most recent first)
      items
        .slice()
        .reverse()
        .forEach((it) => {
          const d = (it.description || "").trim();
          if (!d) return;
          if (!seen.has(d)) {
            seen.add(d);
            list.push(d);
          }
        });
      setSuggestions(list.slice(0, 8));
    } catch (e) {
      /* ignore */
    }
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = (amount || "").toString().replace(",", ".");
    const value = parseFloat(normalized || "0");

    if (!description.trim()) {
      setError("Please enter a description");
      setTimeout(() => setError(null), 2000);
      return;
    }

    if (!isFinite(value) || value <= 0) {
      setError("Enter a valid amount > 0");
      setTimeout(() => setError(null), 2000);
      return;
    }

    onAdd({
      id: Date.now().toString(),
      description: description.trim(),
      amount: Math.round(value * 100) / 100,
      date: new Date(date).toISOString(),
    });

    setDescription("");
    setAmount("");
    setDate(localISO());
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <label htmlFor="desc" className="small muted mb-1 block">Description</label>
          <input
            id="desc"
            className="input highlight w-full text-sm"
            placeholder="e.g., Lunch, Taxi"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            list="desc-suggestions"
            aria-label="Description"
          />
          <datalist id="desc-suggestions">
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="amount" className="small muted mb-1 block">Price</label>
          <input
            id="amount"
            className="input highlight w-28 text-sm text-right"
            placeholder="0.00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Amount"
          />
        </div>

        <div>
          <label className="small muted mb-1 block">Date</label>
          <DatePicker value={date} onChange={(iso) => setDate(iso)} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-accent small rounded-full w-10 h-10 flex items-center justify-center"
            aria-label="Add expense"
          >
            +
          </button>
        </div>
      </div>
      {error ? (
        <div role="status" aria-live="polite" className="mt-2 text-sm text-rose-500">
          {error}
        </div>
      ) : null}
    </form>
  );
}
