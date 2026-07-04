import { HOW_IT_WORKS_POINTS } from '../utils/content.js'

export default function IdleScreen({ onChooseFolder }) {
  return (
    <div className="idle-screen">
      <h2>Choose a folder of photos</h2>
      <div className="btn-row center">
        <button className="btn btn-contained" onClick={onChooseFolder}>
          📁 Choose Folder
        </button>
      </div>
      <p className="text-secondary" style={{ marginTop: 16 }}>
        We only read files locally in your browser. Nothing is uploaded.
      </p>
      <div className="how-it-works">
        <p className="caption" style={{ fontWeight: 600, marginBottom: 4 }}>
          How it works
        </p>
        {HOW_IT_WORKS_POINTS.map((point) => (
          <p key={point} className="text-secondary caption" style={{ margin: 0 }}>
            {point}
          </p>
        ))}
      </div>
    </div>
  )
}
