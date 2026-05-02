import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-sm border border-iron bg-graphite px-2.5 py-2 text-sm text-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white placeholder:text-ash focus-visible:outline-none focus-visible:border-electric-blue/70 focus-visible:ring-1 focus-visible:ring-electric-blue/40 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
