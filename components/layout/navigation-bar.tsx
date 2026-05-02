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
    <div className="border-b border-iron/45 bg-deep-charcoal text-white">
      <div className="container mx-auto px-4">
        {/* Simplified navigation in a single row */}
        <div className="flex items-center h-12">
          {/* Logo - always links to index */}
          <Link href="/" className="flex items-center">
            <TriangleIcon className="h-5 w-5 text-white" />
          </Link>

          {currentProject && (
            <>
            <ChevronRight className="h-3 w-3 mx-2 text-silver" />
              {/* Project name links to project overview */}
              <Link
                href={`/projects/${currentProject.id}`}
                className="flex items-center text-fog hover:text-white transition-colors"
              >
                <span className="text-sm font-medium">{`${currentProject.name}`}</span>
                <span className="ml-2 rounded-md bg-[rgba(107,87,255,0.48)] px-1.5 py-0.5 text-xs text-white">Prompt</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
