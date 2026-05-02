import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-sm border text-sm font-medium tracking-tight transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electric-blue focus-visible:ring-offset-0 active:translate-y-px active:scale-[.99] active:[box-shadow:none] disabled:pointer-events-none disabled:opacity-50 disabled:[box-shadow:none] [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-electric-blue text-white [box-shadow:hsl(218,_93%,_30%)_0_-2px_0_0_inset,hsl(0,_0%,_0%,_0.4)_0_1px_3px_0] hover:bg-iris hover:[box-shadow:none]",
        destructive:
          "border-transparent bg-danger-red text-white [box-shadow:hsl(0,_60%,_30%)_0_-2px_0_0_inset,hsl(0,_0%,_0%,_0.4)_0_1px_3px_0] hover:bg-danger-red/90 hover:[box-shadow:none]",
        outline:
          "border-iron/60 bg-graphite/50 text-fog [box-shadow:hsl(218,_13%,_70%,_0.08)_0_-2px_0_0_inset] hover:bg-graphite hover:text-white hover:[box-shadow:none]",
        secondary:
          "border-electric-blue/20 bg-electric-blue/10 text-amethyst [box-shadow:hsl(218,_50%,_70%,_0.08)_0_-2px_0_0_inset] hover:bg-electric-blue/20 hover:[box-shadow:none]",
        ghost: "border-transparent text-silver hover:bg-graphite hover:text-white",
        link: "border-transparent text-electric-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3 py-1.5",
        sm: "h-8 px-2.5",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
