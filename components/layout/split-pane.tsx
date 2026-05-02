"use client"

import type React from "react"
import { useEffect, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface SplitPaneProps {
  splitPosition: number
  leftVisible: boolean
  onChangeSplitPosition: (next: number) => void
  onSetLeftVisible: (visible: boolean) => void
  left: ReactNode
  right: ReactNode
}

export function SplitPane({
  splitPosition,
  leftVisible,
  onChangeSplitPosition,
  onSetLeftVisible,
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
      className="flex h-0 min-h-0 flex-1 overflow-hidden p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {leftVisible && (
        <div className="flex flex-col min-h-0 h-full overflow-hidden" style={{ width: `${splitPosition}%` }}>
          {left}
        </div>
      )}

      {leftVisible && (
        <div
          className="group mx-3 flex h-full w-2 cursor-col-resize items-center justify-center"
          onMouseDown={handleMouseDown}
        >
          <div className="h-full w-px bg-iron group-hover:bg-violet-pulse group-active:bg-electric-blue"></div>
        </div>
      )}

      {!leftVisible && (
        <div className="mb-2 ml-1 mr-3 flex items-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSetLeftVisible(true)}
            className="h-8 w-8 rounded-2xl text-silver hover:bg-graphite/70 hover:text-white"
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
