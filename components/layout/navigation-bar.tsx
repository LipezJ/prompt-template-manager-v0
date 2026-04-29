"use client"
import Link from "next/link"
import { ChevronRight, TriangleIcon } from "lucide-react"
import type { Project } from "@/types/prompt"

interface NavigationBarProps {
  projects: Project[]
  currentProject?: Project
}

export function NavigationBar({ projects, currentProject }: NavigationBarProps) {
  return (
    <div className="border-b border-zinc-800 bg-zinc-900 text-white">
      <div className="container mx-auto px-4">
        {/* Simplified navigation in a single row */}
        <div className="flex items-center h-12">
          {/* Logo - always links to index */}
          <Link href="/" className="flex items-center">
            <TriangleIcon className="h-5 w-5 text-white" />
          </Link>

          {currentProject && (
            <>
              <ChevronRight className="h-3 w-3 mx-2 text-zinc-500" />
              {/* Project name links to project overview */}
              <Link
                href={`/projects/${currentProject.id}`}
                className="flex items-center text-zinc-300 hover:text-white transition-colors"
              >
                <span className="text-sm font-medium">{`${currentProject.name}`}</span>
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-300">Prompt</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
