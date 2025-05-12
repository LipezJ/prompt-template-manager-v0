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
            className={`h-7 w-7 flex-shrink-0 ${
              isCardView
                ? "bg-zinc-600 hover:bg-zinc-500 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
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
