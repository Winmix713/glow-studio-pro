// ─── ComponentSynth Toggle ───

import React from "react";
import type { LucideIcon } from "lucide-react";

interface CsToggleProps {
  label: string;
  icon?: LucideIcon;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const CsToggle = React.memo<CsToggleProps>(({ label, icon: Icon, checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className="flex items-center justify-between py-1.5 text-muted-foreground hover:text-foreground transition-colors group w-full focus-ring rounded-lg px-1"
  >
    <div className="flex items-center gap-2.5">
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${checked ? "bg-primary/20" : "bg-cs-fill"}`}>
      <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 ${checked ? "right-0.5 bg-primary" : "left-0.5 bg-muted-foreground"}`} />
    </div>
  </button>
));

CsToggle.displayName = "CsToggle";
