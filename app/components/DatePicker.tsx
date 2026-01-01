"use client";

import React, { useEffect, useRef, useState } from "react";

function pad(n: number) { return n < 10 ? `0${n}` : `${n}` }

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

export default function DatePicker({ value, onChange, className }: {
  value?: string;
  onChange: (iso: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (value) setViewDate(new Date(value));
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0 Sun .. 6 Sat
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let cur = 1 - startDay;
  while (cur <= daysInMonth) {
    const week: (number | null)[] = [];
    for (let i=0;i<7;i++) {
      if (cur > 0 && cur <= daysInMonth) week.push(cur);
      else week.push(null);
      cur++;
    }
    weeks.push(week);
  }

  function selectDay(d: number) {
    const dt = new Date(year, month, d);
    const iso = toISODate(dt);
    onChange(iso);
    setOpen(false);
  }

  function prevMonth() { setViewDate(new Date(year, month-1, 1)); }
  function nextMonth() { setViewDate(new Date(year, month+1, 1)); }

  const selected = value ? new Date(value) : null;

  return (
    <div className={`relative inline-block ${className || ""}`} ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="input flex items-center justify-between w-36">
        <span className="text-sm">{value ? value : toISODate(new Date())}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 7h8M8 11h8M8 15h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-72 rounded-lg border bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={prevMonth} className="px-2 py-1 text-sm">◀</button>
            <div className="text-sm font-medium">{viewDate.toLocaleString(undefined,{month: 'long', year: 'numeric'})}</div>
            <button type="button" onClick={nextMonth} className="px-2 py-1 text-sm">▶</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs text-center muted">
            {['S','M','T','W','T','F','S'].map((d) => <div key={d} className="small">{d}</div>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
            {weeks.map((week, i) => (
              <React.Fragment key={i}>
                {week.map((d, j) => (
                  <div key={j}>
                    {d ? (
                      <button
                        type="button"
                        onClick={() => selectDay(d)}
                        className={`w-8 h-8 rounded-full ${selected && selected.getFullYear()===year && selected.getMonth()===month && selected.getDate()===d ? 'bg-amber-600 text-white' : 'hover:bg-gray-100'}`}
                      >
                        {d}
                      </button>
                    ) : <div className="w-8 h-8" />}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
