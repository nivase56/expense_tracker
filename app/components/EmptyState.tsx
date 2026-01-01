"use client";

import React from "react";
import { GiWallet } from "react-icons/gi";

export default function EmptyState({
  title = "No expenses",
  subtitle = "Add your first expense using the form above",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="w-full py-12 text-center muted">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-glass">
        <GiWallet className="text-amber-600" size={26} />
      </div>
      <div className="text-lg font-medium">{title}</div>
      <div className="mt-1 text-sm">{subtitle}</div>
    </div>
  );
}
