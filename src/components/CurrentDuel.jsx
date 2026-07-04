import PhotoCard from './PhotoCard.jsx'

export default function CurrentDuel({ photos, currentPairs, pairIdx, onChoose, layout, onToggleLayout }) {
  const pair = currentPairs[pairIdx] || []
  const a = photos.find((p) => p.id === pair[0])
  const b = photos.find((p) => p.id === pair[1])

  return (
    <div className="duel-stage">
      <div className="duel-toolbar">
        <button className="btn btn-outlined btn-small" onClick={onToggleLayout} title="Switch layout">
          {layout === 'column' ? '⬌ Side by side' : '⬍ Stack'}
        </button>
      </div>
      <div className={`duel-row ${layout === 'column' ? 'duel-row-column' : ''}`}>
        <PhotoCard photo={a} label="Left (←)" onPick={() => onChoose(0)} />
        <PhotoCard photo={b} label="Right (→)" onPick={() => onChoose(1)} />
      </div>
    </div>
  )
}
