import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/layout/error-boundary"

export const metadata: Metadata = {
  title: "Prompt Manager",
  description: "Manage your AI prompts with a modern dashboard interface",
  generator: "v0.dev",
}

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body>
        <ErrorBoundary fallbackLabel="La aplicacion encontro un error inesperado">
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  )
}
