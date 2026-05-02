"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, LayoutList } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ViewToggleProps {
  isCardView: boolean
  onToggle: () => void
}

export function ViewToggle({ isCardView, onToggle }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggle}
            className={`h-8 w-8 shrink-0 rounded-2xl ${
              isCardView
                ? "border-violet-pulse bg-[rgba(107,87,255,0.3)] text-white hover:bg-[rgba(107,87,255,0.4)]"
                : "border-iron bg-deep-charcoal text-fog hover:bg-graphite hover:text-white"
            }`}
          >
            {isCardView ? <LayoutGrid className="h-3.5 w-3.5" /> : <LayoutList className="h-3.5 w-3.5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCardView ? "Vista de tarjetas" : "Vista detallada"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
