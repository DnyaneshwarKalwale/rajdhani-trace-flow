import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Simple toast implementation to replace sonner
interface ToastProps {
  children?: React.ReactNode
  className?: string
  theme?: "light" | "dark" | "system"
}

const Toaster = ({ className, theme, ...props }: ToastProps) => {
  const { theme: currentTheme = "system" } = useTheme()

  return (
    <div 
      className={cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)}
      {...props}
    />
  )
}

// Simple toast function
const toast = (message: string, options?: { 
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  description?: string
}) => {
  // For now, just use console.log - you can enhance this later
  console.log(`Toast: ${message}`, options)
  
  // Create a simple DOM toast if needed
  const toastElement = document.createElement('div')
  toastElement.className = 'fixed top-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg z-50 max-w-sm'
  toastElement.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="flex-1">
        <div class="font-medium">${message}</div>
        ${options?.description ? `<div class="text-sm text-muted-foreground">${options.description}</div>` : ''}
      </div>
    </div>
  `
  
  document.body.appendChild(toastElement)
  
  // Remove after specified duration or default 3 seconds
  const duration = options?.duration || 3000
  setTimeout(() => {
    if (toastElement.parentNode) {
      toastElement.parentNode.removeChild(toastElement)
    }
  }, duration)
}

export { Toaster, toast }