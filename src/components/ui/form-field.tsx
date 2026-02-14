"use client";

import * as React from "react";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { Label } from "./label";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { DeltaIndicator } from "../delta-indicator";

interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  hint?: string;
  previousValue?: string | null;
  currentValue?: string | number | null;
  unit?: string;
}

export function FormField({
  label,
  registration,
  error,
  hint,
  previousValue,
  currentValue,
  unit = "",
  className,
  ...props
}: FormFieldProps) {
  const id = registration.name;

  // Extract numeric value from previousValue if it exists
  const previousNumeric = previousValue ? parseFloat(previousValue.toString().replace(/[^\d.-]/g, '')) : null;
  const currentNumeric = currentValue ? parseFloat(currentValue.toString()) : null;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={
          error ? `${id}-error` : previousValue ? `${id}-previous` : hint ? `${id}-hint` : undefined
        }
        className={className}
        {...registration}
        {...props}
      />
      {previousValue && !error && (
        <div id={`${id}-previous`} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Last: {previousValue}</span>
          {currentNumeric && previousNumeric && (
            <DeltaIndicator
              current={currentNumeric.toString()}
              previous={previousNumeric.toString()}
              unit={unit}
            />
          )}
        </div>
      )}
      {!previousValue && hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}

interface FormTextAreaProps extends React.ComponentProps<"textarea"> {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  hint?: string;
}

export function FormTextArea({
  label,
  registration,
  error,
  hint,
  className,
  ...props
}: FormTextAreaProps) {
  const id = registration.name;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        data-slot="textarea"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={cn(
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-20 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...registration}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
