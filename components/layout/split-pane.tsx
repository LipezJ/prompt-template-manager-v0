"use client"

import type React from "react"
import { useEffect, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SplitPaneProps {
  splitPosition: number
  leftVisible: boolean
  onChangeSplitPosition: (next: number) => void
  onSetLeftVisible: (visible: boolean) => void
  leftHeader: ReactNode
  left: ReactNode
  right: ReactNode
}

export function SplitPane({
  splitPosition,
  leftVisible,
  onChangeSplitPosition,
  onSetLeftVisible,
  leftHeader,
  left,
  right,
}: SplitPaneProps) {
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!isDragging) return
    const handleUp = () => {
      setIsDragging(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    document.addEventListener("mouseup", handleUp)
    return () => document.removeEventListener("mouseup", handleUp)
  }, [isDragging])

  const handleMouseDown = () => {
    setIsDragging(true)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const container = e.currentTarget as HTMLElement
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const next = Math.min(Math.max((x / rect.width) * 100, 20), 80)
    onChangeSplitPosition(next)
  }

  return (
    <div
      className="flex-1 flex overflow-hidden h-0 min-h-0 p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {leftVisible && (
        <div className="flex flex-col min-h-0 h-full overflow-hidden" style={{ width: `${splitPosition}%` }}>
          <div className="flex justify-between items-center mb-2">
            {leftHeader}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSetLeftVisible(false)}
              className="h-6 w-6 hover:bg-zinc-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          {left}
        </div>
      )}

      {leftVisible && (
        <div
          className="w-2 h-full flex items-center justify-center cursor-col-resize mx-2 group"
          onMouseDown={handleMouseDown}
        >
          <div className="w-0.5 h-full bg-zinc-700 group-hover:bg-zinc-500 group-active:bg-zinc-400"></div>
        </div>
      )}

      {!leftVisible && (
        <div className="mb-2 ml-1 mr-3 flex items-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSetLeftVisible(true)}
            className="h-6 w-6 hover:bg-zinc-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        className="flex flex-col min-h-0 h-full overflow-hidden"
        style={{ width: leftVisible ? `${100 - splitPosition}%` : "100%" }}
      >
        {right}
      </div>
    </div>
  )
}
