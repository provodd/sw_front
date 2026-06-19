export default function BottomSheet({ onClose, children }) {
  return (
    <div className="row" style={{
      position: 'fixed', inset: 0, zIndex: 'var(--z-modal)',
      alignItems: 'flex-end',
    }}>
      <div onClick={onClose} className="absolute-fill" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div className="relative full-w overflow-hidden" style={{
        maxHeight: '90vh',
        background: [
          'linear-gradient(rgba(128,128,128,0.3), rgba(128,128,128,0.3)) padding-box',
          'linear-gradient(160deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 100%) border-box',
        ].join(', '),
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        border: '1.4px solid transparent',
        borderRadius: '40px 40px 0 0',
        padding: '12px 20px 40px',
        overflowY: 'auto',
      }}>
        <div className="mx-auto" style={{
          width: 63, height: 5, background: 'rgba(255,255,255,0.2)',
          borderRadius: 100, marginBottom: 20,
        }} />
        {children}
      </div>
    </div>
  )
}
