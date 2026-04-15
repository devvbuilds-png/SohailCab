"use client";

import { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="sheet-overlay fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div
        className="sheet-content relative z-10 w-full max-h-[92vh] overflow-y-auto rounded-t-[2rem] border border-white/50 bg-card px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_60px_rgba(17,17,17,0.18)] sm:mx-auto sm:max-w-md sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border" />
        {children}
      </div>
    </div>
  );
}
