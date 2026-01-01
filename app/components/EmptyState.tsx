"use client";

import React from "react";

export default function EmptyState({
  title = "No expenses yet",
  subtitle = "Add your first expense using the form above",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="w-full py-12 text-center muted">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-glass">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="text-lg font-medium">{title}</div>
      <div className="mt-1 text-sm">{subtitle}</div>
    </div>
  );
}
