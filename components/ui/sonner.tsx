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
          toast: "bg-deep-charcoal border border-iron text-white rounded-2xl",
        },
      }}
    />
  )
}
