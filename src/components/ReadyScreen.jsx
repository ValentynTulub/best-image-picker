export default function ReadyScreen({ totalImages, totalRounds, onStart, onClear }) {
  return (
    <div>
      <h2>Ready to start</h2>
      <p style={{ marginBottom: 8 }}>
        Found <b>{totalImages}</b> images. Estimated <b>{totalRounds}</b> round{totalRounds !== 1 ? 's' : ''}.
      </p>
      <div className="chip-row">
        <span className="chip">Pairs randomized each round 🎲</span>
        <span className="chip">Both images always fit the screen</span>
        <span className="chip">Keyboard: ← / →</span>
      </div>
      <hr className="divider" />
      <div className="btn-row">
        <button className="btn btn-contained" onClick={onStart}>
          ▶️ Start
        </button>
        <button className="btn btn-text" onClick={onClear}>
          🗑️ Clear
        </button>
      </div>
    </div>
  )
}
