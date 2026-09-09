"use client";

import type { AppTab } from "@/lib/types";
import type { ReactNode } from "react";

type BottomNavProps = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-blue-100 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 max-w-lg">
        <NavButton
          label="学習"
          subLabel="Study"
          active={activeTab === "study"}
          onClick={() => onChange("study")}
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
        />
        <NavButton
          label="復習"
          subLabel="Review"
          active={activeTab === "review"}
          onClick={() => onChange("review")}
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          }
        />
      </div>
    </nav>
  );
}

function NavButton({
  label,
  subLabel,
  active,
  onClick,
  icon,
}: {
  label: string;
  subLabel: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
        active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span className="text-xs font-semibold leading-none">{label}</span>
      <span className="text-[10px] leading-none opacity-70">{subLabel}</span>
    </button>
  );
}
