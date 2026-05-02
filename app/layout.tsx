import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/layout/error-boundary"
import { ProjectsProvider } from "@/lib/projects-provider"

export const metadata: Metadata = {
  title: "Prompt Manager",
  description: "Manage your AI prompts",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="bg-obsidian-ground text-pure-white antialiased">
        <ErrorBoundary fallbackLabel="La aplicacion encontro un error inesperado">
          <ProjectsProvider>{children}</ProjectsProvider>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  )
}
