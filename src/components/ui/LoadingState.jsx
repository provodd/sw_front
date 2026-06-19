/**
 * Full-screen centered loader.
 * Replaces the 6+ inline duplicates of:
 *   <div style={{ position: 'absolute', inset: 0, ...center }}>
 *     <div style={{ fontSize: 48 }}>🍒</div>
 *   </div>
 */
export default function LoadingState({ emoji = '🍒', background = 'transparent' }) {
  return (
    <div
      className="absolute-fill center"
      style={{ background }}
    >
      <div className="emoji-lg">{emoji}</div>
    </div>
  )
}
