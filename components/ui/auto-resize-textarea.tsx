"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
  maxRows?: number
}

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, minRows = 1, maxRows = 20, value, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const [textareaValue, setTextareaValue] = React.useState(value || "")

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto"

      // Calculate line height based on the font size
      const computedStyle = window.getComputedStyle(textarea)
      const lineHeight = Number.parseInt(computedStyle.lineHeight) || Number.parseInt(computedStyle.fontSize) * 1.2

      // Calculate min and max heights
      const minHeight = lineHeight * minRows
      const maxHeight = lineHeight * maxRows

      // Set the height based on scrollHeight, but constrained by min and max
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`

      // Add scrollbar if content exceeds maxHeight
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden"
    }, [minRows, maxRows])

    // Adjust height when value changes
    React.useEffect(() => {
      adjustHeight()
    }, [textareaValue, adjustHeight])

    // Handle initial value and window resize
    React.useEffect(() => {
      adjustHeight()
      window.addEventListener("resize", adjustHeight)
      return () => window.removeEventListener("resize", adjustHeight)
    }, [adjustHeight])

    // Update value when prop changes
    React.useEffect(() => {
      if (value !== undefined && value !== textareaValue) {
        setTextareaValue(value as string)
      }
    }, [value, textareaValue])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextareaValue(e.target.value)
      if (onChange) {
        onChange(e)
      }
    }

    return (
      <textarea
        ref={textareaRef}
        value={textareaValue}
        onChange={handleChange}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden",
          className,
        )}
        rows={minRows}
        {...props}
      />
    )
  },
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"

export { AutoResizeTextarea }
