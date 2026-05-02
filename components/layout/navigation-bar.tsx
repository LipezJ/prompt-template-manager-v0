"use client"
import Link from "next/link"
import { ChevronRight, TriangleIcon } from "lucide-react"
import type { Project } from "@/types/prompt"

interface NavigationBarProps {
  projects: Project[]
  currentProject?: Project
}

export function NavigationBar({ projects, currentProject }: NavigationBarProps) {
  void projects

  return (
    <div className="border-b border-iron/60 bg-deep-charcoal text-white">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center">
          <Link href="/" className="flex items-center">
            <TriangleIcon className="h-4 w-4 text-electric-blue" />
          </Link>

          {currentProject && (
            <>
              <ChevronRight className="mx-2 h-3 w-3 text-ash" />
              <Link
                href={`/projects/${currentProject.id}`}
                className="flex items-center text-silver transition-colors hover:text-white"
              >
                <span className="text-sm">{currentProject.name}</span>
                <span className="font-mono-tight ml-2 rounded-sm border border-iron bg-graphite px-1.5 py-0.5 text-[10px] text-electric-blue">Prompt</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
