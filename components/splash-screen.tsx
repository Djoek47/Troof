"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function SplashScreen() {
  const [progress, setProgress] = useState(0)
  const [matrixText, setMatrixText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%"
    let interval: NodeJS.Timeout

    // Matrix text effect
    const matrixInterval = setInterval(() => {
      const randomText = Array(8)
        .fill(0)
        .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
        .join("")
      setMatrixText(randomText)
    }, 50)

    // Progress bar animation
    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          clearInterval(matrixInterval)
          setTimeout(() => setIsComplete(true), 500) // Delay before hiding splash screen
          return 100
        }
        return prev + 1
      })
    }, 30)

    // Ultra-aggressive iOS 26 Safari detection and viewport fix
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isIOS26 = /OS 26_/.test(navigator.userAgent) || /Version\/26/.test(navigator.userAgent)
    
    if (isSafari && isIOS) {
      // Force full screen coverage for Safari on iOS, especially iOS 26
      const setFullScreen = () => {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
        
        // Additional iOS 26 specific fixes
        if (isIOS26) {
          // Force viewport to exact screen dimensions
          const viewport = document.querySelector('meta[name="viewport"]')
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
          }
          
          // Force body and html to full screen
          document.documentElement.style.height = '100vh'
          document.documentElement.style.height = '100dvh'
          document.documentElement.style.height = '100svh'
          document.body.style.height = '100vh'
          document.body.style.height = '100dvh'
          document.body.style.height = '100svh'
          document.body.style.overflow = 'hidden'
          document.body.style.position = 'fixed'
          document.body.style.top = '0'
          document.body.style.left = '0'
          document.body.style.right = '0'
          document.body.style.bottom = '0'
        }
      }
      
      setFullScreen()
      window.addEventListener('resize', setFullScreen)
      window.addEventListener('orientationchange', setFullScreen)
      window.addEventListener('load', setFullScreen)
      
      // iOS 26 specific: Force full screen on every interaction
      if (isIOS26) {
        document.addEventListener('touchstart', setFullScreen, { passive: true })
        document.addEventListener('touchend', setFullScreen, { passive: true })
      }
      
      return () => {
        clearInterval(interval)
        clearInterval(matrixInterval)
        window.removeEventListener('resize', setFullScreen)
        window.removeEventListener('orientationchange', setFullScreen)
        window.removeEventListener('load', setFullScreen)
        if (isIOS26) {
          document.removeEventListener('touchstart', setFullScreen)
          document.removeEventListener('touchend', setFullScreen)
        }
      }
    }

    return () => {
      clearInterval(interval)
      clearInterval(matrixInterval)
    }
  }, [])

  return (
    <div
      className={cn(
        "ios-splash-fix flex flex-col items-center justify-center bg-white transition-opacity duration-500",
        isComplete ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      <div className="relative w-48 h-48 mb-8">
        <Image src="/logo.png" alt="Faberstore" fill className="object-contain" priority />
      </div>

      {/* Matrix-style loading text */}
      <div className="font-mono text-gray-900 mb-4 h-6">{`LOADING_FABERSTORE: ${matrixText}`}</div>

      {/* Progress bar container */}
      <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gray-900 transition-all duration-100 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Progress percentage */}
      <div className="mt-2 font-mono text-sm text-gray-900">{`${progress}%`}</div>

      {/* Visser Studios logo */}
      <Link
        href="https://www.faber.land/"
        className="absolute bottom-4 right-4 w-12 h-12 opacity-70 hover:opacity-100 transition-opacity"
      >
        <Image src="/v1-logo.png" alt="Visser Studios" fill className="object-contain" />
      </Link>
    </div>
  )
}

export function ProductSplashScreen() {
  const [progress, setProgress] = useState(0)
  const [matrixText, setMatrixText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%"
    let interval: NodeJS.Timeout

    // Matrix text effect
    const matrixInterval = setInterval(() => {
      const randomText = Array(8)
        .fill(0)
        .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
        .join("")
      setMatrixText(randomText)
    }, 50)

    // Progress bar animation
    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          clearInterval(matrixInterval)
          setTimeout(() => setIsComplete(true), 500) // Delay before hiding splash screen
          return 100
        }
        return prev + 1
      })
    }, 30)

    // Ultra-aggressive iOS 26 Safari detection and viewport fix
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isIOS26 = /OS 26_/.test(navigator.userAgent) || /Version\/26/.test(navigator.userAgent)
    
    if (isSafari && isIOS) {
      // Force full screen coverage for Safari on iOS, especially iOS 26
      const setFullScreen = () => {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
        
        // Additional iOS 26 specific fixes
        if (isIOS26) {
          // Force viewport to exact screen dimensions
          const viewport = document.querySelector('meta[name="viewport"]')
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
          }
          
          // Force body and html to full screen
          document.documentElement.style.height = '100vh'
          document.documentElement.style.height = '100dvh'
          document.documentElement.style.height = '100svh'
          document.body.style.height = '100vh'
          document.body.style.height = '100dvh'
          document.body.style.height = '100svh'
          document.body.style.overflow = 'hidden'
          document.body.style.position = 'fixed'
          document.body.style.top = '0'
          document.body.style.left = '0'
          document.body.style.right = '0'
          document.body.style.bottom = '0'
        }
      }
      
      setFullScreen()
      window.addEventListener('resize', setFullScreen)
      window.addEventListener('orientationchange', setFullScreen)
      window.addEventListener('load', setFullScreen)
      
      // iOS 26 specific: Force full screen on every interaction
      if (isIOS26) {
        document.addEventListener('touchstart', setFullScreen, { passive: true })
        document.addEventListener('touchend', setFullScreen, { passive: true })
      }
      
      return () => {
        clearInterval(interval)
        clearInterval(matrixInterval)
        window.removeEventListener('resize', setFullScreen)
        window.removeEventListener('orientationchange', setFullScreen)
        window.removeEventListener('load', setFullScreen)
        if (isIOS26) {
          document.removeEventListener('touchstart', setFullScreen)
          document.removeEventListener('touchend', setFullScreen)
        }
      }
    }

    return () => {
      clearInterval(interval)
      clearInterval(matrixInterval)
    }
  }, [])

  return (
    <div
      className={cn(
        "ios-splash-fix flex flex-col items-center justify-center bg-white transition-opacity duration-500",
        isComplete ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      <div className="relative w-48 h-48 mb-8">
        <Image src="/Minimal_-_Artboard_2-removebg-preview.png" alt="Proof of Concept" fill className="object-contain" priority />
      </div>

      {/* Matrix-style loading text */}
      <div className="font-mono text-gray-900 mb-4 h-6">{`LOADING_PROOF_OF_CONCEPT: ${matrixText}`}</div>

      {/* Progress bar container */}
      <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gray-900 transition-all duration-100 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Progress percentage */}
      <div className="mt-2 font-mono text-sm text-gray-900">{`${progress}%`}</div>

      {/* Visser Studios logo */}
      <Link
        href="https://www.faber.land/"
        className="absolute bottom-4 right-4 w-12 h-12 opacity-70 hover:opacity-100 transition-opacity"
      >
        <Image src="/v1-logo.png" alt="Visser Studios" fill className="object-contain" />
      </Link>
    </div>
  )
}