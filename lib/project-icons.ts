import {
  Bot,
  Boxes,
  Brain,
  BriefcaseBusiness,
  Code2,
  Database,
  FileCode2,
  FileText,
  FolderKanban,
  Gem,
  Globe2,
  Layers3,
  Lightbulb,
  type LucideIcon,
  MessageSquareText,
  Rocket,
  Settings2,
  Sparkles,
  Terminal,
  Wrench,
  Zap,
} from "lucide-react"

export type ProjectIconOption = {
  name: string
  label: string
  keywords: string
  icon: LucideIcon
}

export const PROJECT_ICON_OPTIONS: ProjectIconOption[] = [
  { name: "Sparkles", label: "Sparkles", keywords: "magic brillo ideas", icon: Sparkles },
  { name: "FileText", label: "Document", keywords: "document prompt file texto", icon: FileText },
  { name: "FolderKanban", label: "Project", keywords: "project folder kanban", icon: FolderKanban },
  { name: "Brain", label: "Brain", keywords: "ai inteligencia idea", icon: Brain },
  { name: "Bot", label: "Bot", keywords: "assistant chatbot robot", icon: Bot },
  { name: "MessageSquareText", label: "Chat", keywords: "chat message conversation", icon: MessageSquareText },
  { name: "Code2", label: "Code", keywords: "code dev engineer", icon: Code2 },
  { name: "FileCode2", label: "Code file", keywords: "file code template", icon: FileCode2 },
  { name: "Terminal", label: "Terminal", keywords: "cli command shell", icon: Terminal },
  { name: "Database", label: "Database", keywords: "data storage db", icon: Database },
  { name: "Layers3", label: "Layers", keywords: "layers stack sets", icon: Layers3 },
  { name: "Rocket", label: "Rocket", keywords: "launch product", icon: Rocket },
  { name: "Zap", label: "Zap", keywords: "fast automation", icon: Zap },
  { name: "Lightbulb", label: "Idea", keywords: "idea light insight", icon: Lightbulb },
  { name: "Gem", label: "Gem", keywords: "premium craft", icon: Gem },
  { name: "BriefcaseBusiness", label: "Business", keywords: "business client work", icon: BriefcaseBusiness },
  { name: "Globe2", label: "Web", keywords: "web global internet", icon: Globe2 },
  { name: "Settings2", label: "Settings", keywords: "settings tools config", icon: Settings2 },
  { name: "Wrench", label: "Tools", keywords: "tools repair utility", icon: Wrench },
  { name: "Boxes", label: "Boxes", keywords: "library boxes bundle", icon: Boxes },
]

const PROJECT_ICON_MAP = new Map(PROJECT_ICON_OPTIONS.map((option) => [option.name, option.icon]))

export function getProjectIcon(name?: string | null): LucideIcon {
  if (!name) return FolderKanban
  return PROJECT_ICON_MAP.get(name) ?? FolderKanban
}

export function getProjectIconByIndex(index: number): ProjectIconOption {
  return PROJECT_ICON_OPTIONS[index % PROJECT_ICON_OPTIONS.length]
}
