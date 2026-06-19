import { useEffect } from 'react'
import Sticker from '../components/Sticker.jsx'
import { Screen } from '../components/ui'

export default function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <Screen variant="gradient" centered scroll={false} className="gap-md">
      <Sticker index={12} size={200} loop autoplay />
      <div className="text-display font-black text-wider">
        СВАЙПИК
      </div>
    </Screen>
  )
}
