import { Check, MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";

import type { SurfacePhase } from "./HeroSurface";

interface Props {
  phase: SurfacePhase;
  reduced: boolean;
}

export function HeroFeesPanel({ phase, reduced }: Props) {
  const showReceived = reduced || phase === "fees-1" || phase === "fees-2";
  const showReconciled = reduced || phase === "fees-2";
  const showSms = reduced || phase === "fees-2";

  return (
    <div>
      <p className="text-[10px] text-n-400 tracking-wider mb-3 font-mono">
        FEE LEDGER — INCOMING PAYMENT
      </p>

      <div className="border border-white/10 rounded-lg overflow-hidden mb-3">
        <div className="flex items-start justify-between gap-4 px-3 py-3 bg-white/[0.04]">
          <div>
            <p className="text-paper/90 text-[11px] font-medium">Adaeze Okonkwo</p>
            <p className="text-n-400 text-[10px] mt-0.5 font-mono">Third Term · 2024/25 · SS2</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-paper font-bold text-sm">₦45,000</p>
            <span
              className={cn(
                "inline-block text-[9px] font-bold tracking-widest px-2 py-0.5 rounded mt-1 font-mono transition-all",
                showReceived
                  ? "bg-grass/20 text-grass border border-grass/40"
                  : "bg-amber/20 text-amber border border-amber/40",
              )}
            >
              {showReceived ? "RECEIVED" : "PENDING"}
            </span>
          </div>
        </div>

        {showReconciled && (
          <div className="flex items-center gap-2 px-3 py-2 border-t border-white/[0.06] bg-white/[0.02]">
            <Check className="w-3 h-3 text-grass shrink-0" />
            <span className="text-n-300 text-[10px] font-mono">Auto-reconciled · ledger updated · balance ₦0</span>
          </div>
        )}
      </div>

      {showSms && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-brand/20 border border-brand/30">
          <MessageSquare className="w-3.5 h-3.5 text-grass mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] text-grass font-bold tracking-wide font-mono">
              SMS → 0803••••2210
            </p>
            <p className="text-[10px] text-n-300 mt-0.5 font-mono">
              &quot;₦45,000 received for Adaeze. Balance: ₦0.&quot;
            </p>
            <p className="text-[9px] text-n-500 mt-1 flex items-center gap-1 font-mono">
              <Check className="w-2.5 h-2.5 text-grass" />
              Delivered · 14:23
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
