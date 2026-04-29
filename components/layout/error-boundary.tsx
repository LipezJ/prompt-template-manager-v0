"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallbackLabel?: string
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="p-4 border border-red-900 bg-red-950/30 rounded-md text-sm text-red-200">
        <p className="font-medium mb-2">{this.props.fallbackLabel ?? "Algo falló al renderizar este panel"}</p>
        <p className="text-xs text-red-300/70 mb-3 font-mono break-all">{this.state.error.message}</p>
        <Button size="sm" variant="outline" onClick={this.reset} className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700">
          Reintentar
        </Button>
      </div>
    )
  }
}
