"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Expense } from "../types";
import DatePicker from "./DatePicker";

function pad(n: number) { return n < 10 ? `0${n}` : `${n}` }
function localISO(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` }

export default function ExpenseForm({
  onAdd,
  initial,
  onUpdate,
  onCancel,
}: {
  onAdd: (e: Expense) => void;
  initial?: Expense | null;
  onUpdate?: (e: Expense) => void;
  onCancel?: () => void;
}) {
  const [description, setDescription] = useState<string>(initial?.description || "");
  const [amount, setAmount] = useState<string>(initial ? String(initial.amount) : "");
  const [date, setDate] = useState<string>(() => (initial ? new Date(initial.date).toISOString().slice(0, 10) : localISO()));
  const [error, setError] = useState<string | null>(null);
  type Suggestion = { text: string; count: number; lastUsed: number };
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filtered, setFiltered] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selIndex, setSelIndex] = useState(-1);
  const descRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("expenses:v1");
      if (!raw) return;
      const items: Expense[] = JSON.parse(raw);
      // build stats: count & lastUsed timestamp per description
      const map = new Map<string, { count: number; lastUsed: number }>();
      for (const it of items) {
        const d = (it.description || "").trim();
        if (!d) continue;
        const when = new Date(it.date).getTime() || Date.now();
        const cur = map.get(d) || { count: 0, lastUsed: 0 };
        cur.count += 1;
        if (when > cur.lastUsed) cur.lastUsed = when;
        map.set(d, cur);
      }

      const arr: Suggestion[] = Array.from(map.entries())
        .map(([text, meta]) => ({ text, count: meta.count, lastUsed: meta.lastUsed }))
        .sort((a, b) => {
          // prefer more recent, then by frequency
          if (b.lastUsed !== a.lastUsed) return b.lastUsed - a.lastUsed;
          return b.count - a.count;
        });
      setSuggestions(arr.slice(0, 30));
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!description) {
      setFiltered(suggestions.slice(0, 8));
      setSelIndex(-1);
      return;
    }
    const q = description.trim().toLowerCase();
    const matches = suggestions
      .filter((s) => s.text.toLowerCase().includes(q))
      .slice(0, 8);
    setFiltered(matches);
    setSelIndex(matches.length ? 0 : -1);
  }, [description, suggestions]);

  // click outside to close suggestions
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (descRef.current && descRef.current.contains(e.target as Node)) return;
      setShowSuggestions(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (initial) {
      setDescription(initial.description || "");
      setAmount(String(initial.amount));
      setDate(new Date(initial.date).toISOString().slice(0, 10));
    }
  }, [initial]);

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

    const payload: Expense = {
      id: initial?.id || Date.now().toString(),
      description: description.trim(),
      amount: Math.round(value * 100) / 100,
      date: new Date(date).toISOString(),
    };

    if (initial && onUpdate) {
      onUpdate(payload);
    } else {
      onAdd(payload);
    }

    if (!initial) {
      setDescription("");
      setAmount("");
      setDate(localISO());
    }
  }

  function pickSuggestion(s: Suggestion) {
    setDescription(s.text);
    setShowSuggestions(false);
    setSelIndex(-1);
  }

  function onDescKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) setShowSuggestions(true);
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      if (selIndex >= 0 && filtered[selIndex]) {
        e.preventDefault();
        pickSuggestion(filtered[selIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full animate-entrance">
      <div className="grid grid-cols-2 gap-3 items-end  ">
        <div>
            <label htmlFor="desc" className="small muted mb-1 block">Description</label>
            <div className="relative">
              <input
                id="desc"
                ref={descRef}
                className="input highlight w-full text-sm"
                placeholder="e.g., Lunch, Taxi"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={onDescKey}
                aria-label="Description"
                autoComplete="off"
              />

              {showSuggestions && filtered.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-gray-900 border border-amber-800 rounded-md shadow-sm z-40">
                  <ul className="max-h-56 overflow-auto">
                    {filtered.map((s, i) => (
                      <li
                        key={s.text}
                        onMouseDown={(ev) => { ev.preventDefault(); pickSuggestion(s); }}
                        className={`px-3 py-2 text-sm cursor-pointer`}
                      >
                        <div className="flex justify-between">
                          <div className="truncate">{s.text}</div>
                          <div className="text-xs muted ml-2">{s.count}</div>
                        </div>
                        <div className="text-xs muted">{new Date(s.lastUsed).toLocaleDateString()}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
        </div>

        <div className="ml-3">
            <label htmlFor="amount" className="small muted mb-1 block">Price</label>
            <input
              id="amount"
              className="input highlight w-full text-sm text-right"
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

          <div className="col-span-1 flex items-end justify-end gap-2">
            {initial ? (
              <button
                type="button"
                onClick={() => onCancel && onCancel()}
                className="border rounded-full w-10 h-10 flex items-center justify-center tap"
                aria-label="Cancel edit"
              >
                ×
              </button>
            ) : null}
            <button
              type="submit"
              className="btn-accent small rounded-full w-10 h-10 flex items-center justify-center tap"
              aria-label={initial ? "Update expense" : "Add expense"}
            >
              {initial ? '✓' : '+'}
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
