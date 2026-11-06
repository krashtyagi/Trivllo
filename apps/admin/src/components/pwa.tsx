"use client"
import { useEffect, useState } from "react"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Detect installed mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone
    ) {
      setIsInstalled(true)
    }

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) {
      alert("Install not available yet")
      return
    }

    deferredPrompt.prompt()

    const choice = await deferredPrompt.userChoice

    setDeferredPrompt(null)
  }

  if (isInstalled) return null

  return (
    <div>
      <h3>Install App</h3>

      {deferredPrompt ? (
        <button onClick={installApp}>
          Install Now
        </button>
      ) : (
        <p>Install option not available yet</p>
      )}
    </div>
  )
}