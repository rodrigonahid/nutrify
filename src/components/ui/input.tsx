import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "h-11 w-full min-w-0 rounded-[10px] border-[1.5px] border-input bg-input-bg px-3 py-1 text-sm font-normal text-foreground",
        "transition-[color,border-color,background-color,box-shadow] outline-none",
        "hover:border-[#D1D5DB] hover:bg-[#F3F4F6]",
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 focus-visible:bg-white",
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
