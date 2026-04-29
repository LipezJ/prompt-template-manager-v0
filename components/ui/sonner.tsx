"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      position="bottom-right"
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "bg-zinc-800 border border-zinc-700 text-white",
        },
      }}
    />
  )
}
