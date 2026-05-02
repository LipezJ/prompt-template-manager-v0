interface ProjectInfoCardProps {
  name: string
  promptSetsCount: number
}

export function ProjectInfoCard({ name, promptSetsCount }: ProjectInfoCardProps) {
  return (
    <div className="mb-6 rounded-sm border border-iron bg-deep-charcoal p-4">
      <h2 className="mb-3 text-eyebrow">Información del Proyecto</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-ash">Nombre del Proyecto</p>
          <p className="text-sm text-white">{name}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-ash">Conjuntos de Prompts</p>
          <p className="font-mono-tight text-sm text-electric-blue">{promptSetsCount}</p>
        </div>
      </div>
    </div>
  )
}
