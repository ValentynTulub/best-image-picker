import { HOW_IT_WORKS } from '../utils/content.js'

export default function Header({
  totalImages,
  totalRounds,
  stage,
  roundIndex,
  pairIdx,
  currentPairsLength,
  onChooseFolder,
  onRestart,
}) {
  const showRestart = stage === 'playing' || stage === 'finished'

  return (
    <header className="app-bar">
      <div className="toolbar">
        <div className="header-left">
          <h1 className="app-title">Photo Duel — Best Shot Picker</h1>
          <span className="info-icon" title={HOW_IT_WORKS} aria-label="How it works">
            ℹ️
          </span>
        </div>

        <div className="header-center">
          {stage === 'playing' ? (
            <span className="mono header-stat">
              Round {roundIndex}/{Math.max(1, totalRounds)} · Match {Math.min(pairIdx + 1, currentPairsLength)}/
              {currentPairsLength}
            </span>
          ) : (
            totalImages > 0 && (
              <span className="header-stat">
                Images: {totalImages} · Estimated rounds: {totalRounds}
              </span>
            )
          )}
        </div>

        <div className="header-right">
          {showRestart && (
            <button className="icon-btn" title="Restart with same images" onClick={onRestart}>
              🔁
            </button>
          )}
          <button className="icon-btn" title="Choose Folder" onClick={onChooseFolder}>
            📁
          </button>
        </div>
      </div>
    </header>
  )
}
