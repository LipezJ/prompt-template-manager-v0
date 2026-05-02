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
            className={`h-8 w-8 shrink-0 ${
              isCardView
                ? "border-electric-blue bg-graphite text-white"
                : ""
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
