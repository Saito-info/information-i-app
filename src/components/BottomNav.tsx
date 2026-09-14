"use client";

import type { AppTab } from "@/lib/types";
import type { ReactNode } from "react";

type BottomNavProps = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

const TABS: {
  id: AppTab;
  label: string;
  subLabel: string;
  icon: ReactNode;
}[] = [
  {
    id: "study",
    label: "学習",
    subLabel: "Study",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: "review",
    label: "復習",
    subLabel: "Review",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
  },
  {
    id: "exam",
    label: "テスト",
    subLabel: "開発中",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: "terms",
    label: "用語",
    subLabel: "List",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
];

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-blue-100 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 max-w-lg">
        {TABS.map((tab) => (
          <NavButton
            key={tab.id}
            label={tab.label}
            subLabel={tab.subLabel}
            active={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            icon={tab.icon}
          />
        ))}
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
      <span className="text-[11px] font-semibold leading-none">{label}</span>
      <span className="text-[9px] leading-none opacity-70">{subLabel}</span>
    </button>
  );
}
