"use client"

import { useMemo, useState } from "react"
import { Pin, PinOff, Search } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { PROJECT_ICON_OPTIONS } from "@/lib/project-icons"

export function ProjectPinToggle({
  pinned,
  onChange,
}: {
  pinned?: boolean
  onChange: (pinned: boolean) => void
}) {
  return (
    <DropdownMenuItem onClick={() => onChange(!pinned)} className="cursor-pointer">
      {pinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
      {pinned ? "Desfijar de arriba" : "Fijar arriba"}
    </DropdownMenuItem>
  )
}

export function ProjectIconPicker({
  selectedIconName,
  onSelect,
}: {
  selectedIconName: string
  onSelect: (iconName: string) => void
}) {
  const [query, setQuery] = useState("")
  const normalizedQuery = query.trim().toLowerCase()
  const filteredIcons = useMemo(
    () =>
      normalizedQuery
        ? PROJECT_ICON_OPTIONS.filter((option) =>
            `${option.name} ${option.label} ${option.keywords}`.toLowerCase().includes(normalizedQuery),
          )
        : PROJECT_ICON_OPTIONS,
    [normalizedQuery],
  )

  return (
    <div className="border-t border-iron/50 p-2">
      <div className="relative mb-2">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-silver" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar icono"
          className="h-9 rounded-xl pl-9"
        />
      </div>
      <div className="grid max-h-64 grid-cols-5 gap-1 overflow-y-auto pr-1 custom-scrollbar">
        {filteredIcons.map((option) => {
          const OptionIcon = option.icon
          return (
            <button
              key={option.name}
              type="button"
              className={cn(
                "app-focus flex h-9 w-9 items-center justify-center rounded-xl text-fog transition hover:bg-graphite/70 hover:text-white",
                selectedIconName === option.name && "bg-[rgba(107,87,255,0.4)] text-white",
              )}
              onClick={() => onSelect(option.name)}
              aria-label={`Usar icono ${option.label}`}
              title={option.label}
            >
              <OptionIcon aria-hidden="true" className="h-4 w-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
