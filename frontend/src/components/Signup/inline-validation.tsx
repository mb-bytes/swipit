"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const INSTANT = { duration: 0 } as const;

const LINE = 16;

export type ValidationStatus = "idle" | "pending" | "valid" | "invalid";

export type Validator = (value: string) => string | null;

export type UseInlineValidationOptions = {
  value: string;
  validate?: Validator;
  debounce?: number;
};

export type UseInlineValidationReturn = {
  status: ValidationStatus;
  error: string | null;
  message: string;
  touched: boolean;
  commit: () => void;
  reset: () => void;
  fieldProps: {
    onBlur: () => void;
    "aria-invalid": boolean;
  };
};

type Settled = {
  status: ValidationStatus;
  error: string | null;
  message: string;
};

const CLEAN: Settled = { status: "idle", error: null, message: "" };

function useInlineValidation({
  value,
  validate,
  debounce = 400,
}: UseInlineValidationOptions): UseInlineValidationReturn {
  const [touched, setTouched] = useState(false);
  const [settled, setSettled] = useState<Settled>(CLEAN);

  const check = useRef<Validator | undefined>(validate);
  const latest = useRef(value);

  useEffect(() => {
    check.current = validate;
    latest.current = value;
  });

  useEffect(() => {
    if (!touched) return;

    if (!check.current) {
      const resolved: ValidationStatus = value.length > 0 ? "valid" : "idle";
      setSettled({ status: resolved, error: null, message: "" });
      return;
    }

    const next = check.current(value);
    const resolved: ValidationStatus = value.length > 0 ? "valid" : "idle";

    if (next === null) {
      setSettled((prev) =>
        prev.status === resolved && prev.error === null
          ? prev
          : { status: resolved, error: null, message: prev.message },
      );
      return;
    }

    setSettled((prev) =>
      prev.status === "invalid"
        ? prev
        : { status: "pending", error: null, message: prev.message },
    );

    const t = setTimeout(() => {
      setSettled((prev) =>
        prev.error === next ? prev : { status: "invalid", error: next, message: next },
      );
    }, debounce);

    return () => clearTimeout(t);
  }, [value, touched, debounce]);

  const commit = useCallback(() => {
    setTouched(true);
    const v = latest.current;
    if (!check.current) {
      setSettled({ status: v.length > 0 ? "valid" : "idle", error: null, message: "" });
      return;
    }
    const next = check.current(v);
    setSettled((prev) =>
      next === null
        ? { status: v.length > 0 ? "valid" : "idle", error: null, message: prev.message }
        : { status: "invalid", error: next, message: next },
    );
  }, []);

  const reset = useCallback(() => {
    setTouched(false);
    setSettled(CLEAN);
  }, []);

  return {
    status: settled.status,
    error: settled.error,
    message: settled.message,
    touched,
    commit,
    reset,
    fieldProps: { onBlur: commit, "aria-invalid": settled.status === "invalid" },
  };
}

export type InlineValidationProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  validate?: Validator;
  hint?: string;
  id?: string;
  name?: string;
  type?: "text" | "email" | "password" | "tel" | "url" | "search";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.ComponentProps<"input">["inputMode"];
  debounce?: number;
  reserveLines?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  variant?: "light" | "dark";
  rightElement?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
};

export function InlineValidation({
  label,
  value,
  onChange,
  validate,
  hint,
  id,
  name,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  debounce = 400,
  reserveLines = 1,
  disabled = false,
  required = false,
  className = "",
  inputClassName = "",
  labelClassName = "",
  variant = "light",
  rightElement,
  onFocus,
  onBlur,
}: InlineValidationProps) {
  const reduced = useReducedMotion();
  const fade = reduced ? INSTANT : CROSSFADE;

  const auto = useId();
  const fieldId = id ?? `${auto}-field`;
  const hintId = `${auto}-hint`;
  const errorId = `${auto}-error`;

  const { status, error, message, fieldProps } = useInlineValidation({
    value,
    validate,
    debounce,
  });

  const isDark = variant === "dark";
  const invalid = status === "invalid";
  const valid = status === "valid";

  const described = [hint ? hintId : null, invalid ? errorId : null]
    .filter(Boolean)
    .join(" ");

  const clamp = {
    display: "-webkit-box" as const,
    WebkitBoxOrient: "vertical" as const,
    WebkitLineClamp: reserveLines,
    overflow: "hidden" as const,
  };

  const defaultLabelClass = isDark
    ? "mb-1 block text-[9px] font-mono uppercase tracking-widest text-neutral-400"
    : "mb-1 block text-xs font-medium text-neutral-700";

  const defaultInputBase = isDark
    ? "w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-sm font-mono tracking-wide text-white placeholder:text-neutral-500 outline-none transition duration-150 shadow-inner"
    : "w-full rounded-xl border bg-[#faf8f3]/80 px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition duration-150 ring-neutral-900/10 focus:ring-3 focus:bg-white disabled:opacity-50";

  const stateClass = isDark
    ? invalid
      ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-400"
      : "border-white/12 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 focus:bg-black/60"
    : invalid
      ? "border-red-500 ring-red-500/10 focus:border-red-500 focus:ring-red-500/20"
      : "border-neutral-300/80 focus:border-neutral-900";

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className={`${defaultLabelClass} ${labelClassName}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          aria-describedby={described || undefined}
          onFocus={onFocus}
          onBlur={(e) => {
            fieldProps.onBlur();
            onBlur?.();
          }}
          onChange={(e) => {
            if (typeof onChange === "function") {
              onChange(e.target.value);
            }
          }}
          aria-invalid={fieldProps["aria-invalid"]}
          className={`${defaultInputBase} ${
            rightElement ? "pr-16" : "pr-9"
          } ${stateClass} ${inputClassName}`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {rightElement}
          <span
            className="pointer-events-none grid size-4 place-items-center"
            aria-hidden
          >
            <motion.svg
              viewBox="0 0 12 12"
              width="14"
              height="14"
              fill="none"
              className={`col-start-1 row-start-1 ${isDark ? "text-amber-400" : "text-emerald-600"}`}
              initial={false}
              animate={{ opacity: valid ? 1 : 0, scale: valid ? 1 : 0.7 }}
              transition={fade}
            >
              <path
                d="M2 6.3 4.7 9 10 3.2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
            <motion.svg
              viewBox="0 0 12 12"
              width="14"
              height="14"
              fill="none"
              className={`col-start-1 row-start-1 ${isDark ? "text-red-400" : "text-red-500"}`}
              initial={false}
              animate={{ opacity: invalid ? 1 : 0, scale: invalid ? 1 : 0.7 }}
              transition={fade}
            >
              <path d="M6 2v4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="5.1" y="8.4" width="1.8" height="1.8" rx="0.5" fill="currentColor" />
            </motion.svg>
          </span>
        </div>
      </div>

      <div className="relative mt-1 grid min-h-4" style={{ height: reserveLines * LINE }}>
        {hint ? (
          <motion.p
            aria-hidden
            style={clamp}
            className={`col-start-1 row-start-1 text-xs ${isDark ? "text-neutral-400 font-mono" : "text-neutral-500"}`}
            initial={false}
            animate={{ opacity: invalid ? 0 : 1, y: invalid ? 3 : 0 }}
            transition={fade}
          >
            {hint}
          </motion.p>
        ) : null}

        <motion.p
          aria-hidden
          style={clamp}
          className={`col-start-1 row-start-1 text-xs ${isDark ? "text-red-400 font-mono text-[11px]" : "text-red-600"}`}
          initial={false}
          animate={{ opacity: invalid ? 1 : 0, y: invalid ? 0 : -3 }}
          transition={fade}
        >
          {error ?? message}
        </motion.p>

        {hint ? (
          <span id={hintId} className="sr-only">
            {hint}
          </span>
        ) : null}

        <span
          id={errorId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {error ?? ""}
        </span>
      </div>
    </div>
  );
}