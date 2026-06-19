import Sticker from '../components/Sticker.jsx'
import { Screen } from '../components/ui'

export default function BannedScreen() {
  return (
    <Screen variant="gradient" centered scroll={false} style={{ padding: '0 50px' }}>
      <Sticker index={5} size={200} style={{ marginBottom: 8 }} />
      <h1 className="text-giant font-extra text-center">
        БАН!
      </h1>
      <p className="text-body text-center leading-relaxed" style={{ marginTop: 20, marginBottom: 48 }}>
        Модераторы тобой очень недовольны! Свайпик — не место для скама!
      </p>
      <button className="btn-dark">
        Произошла ошибка
      </button>
    </Screen>
  )
}
