"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const DISMISS_DISTANCE_RATIO = 0.4;
const DISMISS_VELOCITY = 0.6;
const CLOSE_DURATION_MS = 280;
const OPEN_DURATION_MS = 260;

export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ y: number; t: number } | null>(null);
  const lastMoveRef = useRef<{ y: number; t: number } | null>(null);
  const shouldNotifyCloseRef = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMounted(true);
      setClosing(false);
      setEntered(false);
      setDragOffset(0);
    } else if (mounted && !closing) {
      setClosing(true);
      setIsDragging(false);
    }
  }

  useEffect(() => {
    if (!mounted || closing || entered) return;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(raf);
  }, [mounted, closing, entered]);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
      setEntered(false);
      setDragOffset(0);
      if (shouldNotifyCloseRef.current) {
        shouldNotifyCloseRef.current = false;
        onCloseRef.current();
      }
    }, CLOSE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  const triggerClose = useCallback(() => {
    if (closing) return;
    shouldNotifyCloseRef.current = true;
    dragStartRef.current = null;
    lastMoveRef.current = null;
    setIsDragging(false);
    setClosing(true);
  }, [closing]);

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (closing) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const t = performance.now();
    dragStartRef.current = { y: e.clientY, t };
    lastMoveRef.current = { y: e.clientY, t };
    setSheetHeight(sheetRef.current?.offsetHeight ?? 0);
    setIsDragging(true);
  };

  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const dy = Math.max(0, e.clientY - dragStartRef.current.y);
    setDragOffset(dy);
    lastMoveRef.current = { y: e.clientY, t: performance.now() };
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const height = sheetRef.current?.offsetHeight ?? window.innerHeight;
    const dy = Math.max(0, e.clientY - dragStartRef.current.y);
    const last = lastMoveRef.current ?? dragStartRef.current;
    const dt = Math.max(1, last.t - dragStartRef.current.t);
    const velocity = (last.y - dragStartRef.current.y) / dt;
    dragStartRef.current = null;
    lastMoveRef.current = null;
    setIsDragging(false);
    if (dy > height * DISMISS_DISTANCE_RATIO || velocity > DISMISS_VELOCITY) {
      triggerClose();
    } else {
      setDragOffset(0);
    }
  };

  if (!mounted) return null;

  const sheetTransform =
    closing || !entered
      ? "translateY(100%)"
      : dragOffset > 0
      ? `translateY(${dragOffset}px)`
      : "translateY(0)";

  const sheetTransition = isDragging
    ? "none"
    : closing
    ? `transform ${CLOSE_DURATION_MS}ms ease-in`
    : `transform ${OPEN_DURATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`;

  const overlayOpacity = closing ? 0 : entered ? 1 : 0;
  const overlayTransition = `opacity ${closing ? CLOSE_DURATION_MS : OPEN_DURATION_MS}ms ${closing ? "ease-in" : "ease-out"}`;

  const dragProgress =
    sheetHeight > 0
      ? Math.min(1, dragOffset / (sheetHeight * DISMISS_DISTANCE_RATIO))
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ pointerEvents: closing || !entered ? "none" : "auto" }}
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        style={{ opacity: overlayOpacity, transition: overlayTransition }}
        onClick={triggerClose}
      />
      <div
        ref={sheetRef}
        className="relative z-10 mt-[max(8vh,3.5rem)] w-full max-h-[88vh] overflow-y-auto rounded-t-[2rem] border border-white/50 bg-card px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-20px_60px_rgba(17,17,17,0.18)] sm:mx-auto sm:max-w-md sm:rounded-[2rem]"
        style={{
          transform: sheetTransform,
          transition: sheetTransition,
          willChange: "transform",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="-mx-5 flex select-none items-center justify-center py-3 cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            className="h-1.5 rounded-full"
            style={{
              width: `${3 - dragProgress * 0.5}rem`,
              backgroundColor:
                dragProgress > 0
                  ? `color-mix(in srgb, var(--secondary) ${40 + dragProgress * 60}%, var(--border))`
                  : "var(--border)",
              opacity: 0.55 + dragProgress * 0.45,
              transition: isDragging ? "none" : "all 180ms ease-out",
            }}
          />
        </div>
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}
