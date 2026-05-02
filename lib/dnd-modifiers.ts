import type { Modifier } from "@dnd-kit/core"

export const restrictToHorizontalAxis: Modifier = ({ transform }) => ({ ...transform, y: 0 })

export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 })

export const restrictToParentElement: Modifier = ({ containerNodeRect, draggingNodeRect, transform }) => {
  if (!draggingNodeRect || !containerNodeRect) return transform
  const next = { ...transform }
  if (draggingNodeRect.left + transform.x <= containerNodeRect.left) {
    next.x = containerNodeRect.left - draggingNodeRect.left
  } else if (draggingNodeRect.right + transform.x >= containerNodeRect.left + containerNodeRect.width) {
    next.x = containerNodeRect.left + containerNodeRect.width - draggingNodeRect.right
  }
  if (draggingNodeRect.top + transform.y <= containerNodeRect.top) {
    next.y = containerNodeRect.top - draggingNodeRect.top
  } else if (draggingNodeRect.bottom + transform.y >= containerNodeRect.top + containerNodeRect.height) {
    next.y = containerNodeRect.top + containerNodeRect.height - draggingNodeRect.bottom
  }
  return next
}
