interface ProjectInfoCardProps {
  name: string
  promptSetsCount: number
}

export function ProjectInfoCard({ name, promptSetsCount }: ProjectInfoCardProps) {
  return (
    <div className="bg-zinc-800 rounded-lg p-5 mb-6">
      <h2 className="text-lg font-semibold mb-3">Información del Proyecto</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-zinc-400 text-sm">Nombre del Proyecto</p>
          <p className="text-base">{name}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-sm">Conjuntos de Prompts</p>
          <p className="text-base">{promptSetsCount}</p>
        </div>
      </div>
    </div>
  )
}
