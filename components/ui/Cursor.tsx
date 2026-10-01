"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Desktop-only cursor: a small oxblood dot that opens into a labelled ring
 * over anything marked `data-cursor="View work"`. Critically damped — no wobble.
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hidden, setHidden] = useState(true);
  const [pressable, setPressable] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 520, damping: 48, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 520, damping: 48, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    const update = () => setEnabled(mq.matches && !reduce);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      const el = (e.target as Element | null)?.closest?.("[data-cursor], a, button, [role=slider], input, label, textarea");
      const l = el?.getAttribute("data-cursor") ?? null;
      setLabel(l);
      setPressable(Boolean(el) && !l);
    };
    const leave = () => setHidden(true);
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = label ? 104 : pressable ? 36 : 10;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200]"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        animate={{
          width: size,
          height: size,
          opacity: hidden ? 0 : 1,
          backgroundColor: label ? "rgba(122,31,43,0.92)" : pressable ? "rgba(122,31,43,0)" : "rgba(122,31,43,1)",
          borderColor: pressable ? "rgba(201,178,143,0.9)" : "rgba(201,178,143,0)",
        }}
        style={{ borderWidth: 1, borderStyle: "solid" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          className="label whitespace-nowrap text-[0.625rem] text-bone"
          animate={{ opacity: label ? 1 : 0 }}
          transition={{ duration: 0.25, delay: label ? 0.12 : 0 }}
        >
          {label}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
