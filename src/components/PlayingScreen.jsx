import ProgressBar from './ProgressBar.jsx'
import CurrentDuel from './CurrentDuel.jsx'

export default function PlayingScreen({ progress, layout, onToggleLayout, ...duelProps }) {
  return (
    <div className="duel-page">
      <ProgressBar value={progress} />
      <CurrentDuel layout={layout} onToggleLayout={onToggleLayout} {...duelProps} />
    </div>
  )
}
