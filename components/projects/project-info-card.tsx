interface ProjectInfoCardProps {
  name: string
  promptSetsCount: number
}

export function ProjectInfoCard({ name, promptSetsCount }: ProjectInfoCardProps) {
  return (
    <div className="app-card-subtle mb-6 p-5">
      <h2 className="text-lg font-semibold mb-3">Información del Proyecto</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-fog">Nombre del Proyecto</p>
          <p className="text-base">{name}</p>
        </div>
        <div>
          <p className="text-sm text-fog">Conjuntos de Prompts</p>
          <p className="text-base">{promptSetsCount}</p>
        </div>
      </div>
    </div>
  )
}
