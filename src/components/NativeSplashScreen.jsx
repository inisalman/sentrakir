import { useState, useEffect } from 'react'
import './NativeSplashScreen.css'

export default function NativeSplashScreen({ children }) {
  const [showSplash, setShowSplash] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Show splash for 2.5s then fade out (total 3s including fade)
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500)
    const hideTimer = setTimeout(() => setShowSplash(false), 3000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!showSplash) return children

  return (
    <div className={`native-splash ${fadeOut ? 'native-splash--fade-out' : ''}`}>
      <div className="native-splash__logo-container">
        <img
          src="/logo-sentra-kir.png"
          alt="Sentra KIR"
          className="native-splash__logo"
        />
        <h1 className="native-splash__title">Sentra Fleet</h1>
        <p className="native-splash__subtitle">Portal Kepatuhan Armada</p>
      </div>
      <div className="native-splash__loader">
        <div className="native-splash__loader-bar"></div>
      </div>
    </div>
  )
}
