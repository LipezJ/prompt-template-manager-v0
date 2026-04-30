"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProjectsContent } from "@/components/projects/projects-content"
import { useProjects } from "@/lib/hooks/use-projects"

export default function Home() {
  const { projects, isLoaded, addProject, deleteProject, importProject } = useProjects()

  return (
    <DashboardLayout
      projects={projects}
      isLoaded={isLoaded}
      onAddProject={addProject}
      onDeleteProject={deleteProject}
      onImportProject={importProject}
    >
      <ProjectsContent
        projects={projects}
        isLoaded={isLoaded}
        onAddProject={addProject}
      />
    </DashboardLayout>
  )
}
