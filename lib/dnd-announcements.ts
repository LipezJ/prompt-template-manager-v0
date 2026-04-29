import type { Announcements } from "@dnd-kit/core"

export const dndAnnouncements: Announcements = {
  onDragStart({ active }) {
    return `Tomado el elemento ${active.id}`
  },
  onDragOver({ active, over }) {
    if (over) return `Elemento ${active.id} encima de ${over.id}`
    return `Elemento ${active.id} fuera de zona soltable`
  },
  onDragEnd({ active, over }) {
    if (over) return `Elemento ${active.id} soltado sobre ${over.id}`
    return `Movimiento de ${active.id} cancelado`
  },
  onDragCancel({ active }) {
    return `Movimiento de ${active.id} cancelado`
  },
}
