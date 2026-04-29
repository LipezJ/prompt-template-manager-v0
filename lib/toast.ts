import { toast } from "sonner"

export async function copyToClipboard(text: string, successLabel: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(successLabel)
  } catch (err) {
    console.error("[clipboard] write failed", err)
    toast.error("No se pudo copiar al portapapeles")
  }
}

export const showError = (message: string) => toast.error(message)
export const showSuccess = (message: string) => toast.success(message)
