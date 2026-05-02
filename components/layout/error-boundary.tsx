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
      <div className="rounded-2xl border border-danger-red/70 bg-danger-red/10 p-4 text-sm text-white">
        <p className="font-medium mb-2">{this.props.fallbackLabel ?? "Algo falló al renderizar este panel"}</p>
        <p className="mb-3 break-all font-mono text-xs text-fog">{this.state.error.message}</p>
        <Button size="sm" variant="outline" onClick={this.reset}>
          Reintentar
        </Button>
      </div>
    )
  }
}
