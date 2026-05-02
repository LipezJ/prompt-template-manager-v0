"use client"

import { Button } from "@/components/ui/button"
import { MoveIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EditModeToggleProps {
  isEditMode: boolean
  onToggle: () => void
}

export function EditModeToggle({ isEditMode, onToggle }: EditModeToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggle}
            aria-label={isEditMode ? "Finalizar reordenamiento" : "Reordenar elementos"}
            aria-pressed={isEditMode}
            className={`h-8 w-8 ${
              isEditMode
                ? "border-electric-blue bg-graphite text-white"
                : ""
            }`}
          >
            <MoveIcon aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isEditMode ? "Finalizar reordenamiento" : "Reordenar elementos"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
