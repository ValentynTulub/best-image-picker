export default function FinishedScreen({ top3 }) {
  return (
    <div>
      <h2>Results</h2>
      <p style={{ marginBottom: 16 }}>Winner and Top-3 ranked by most wins.</p>
      <div className="results-list">
        {top3.map((p, i) => (
          <div className="card" key={p.id}>
            <a href={p.url} target="_blank" rel="noopener noreferrer" title="Open full-size image in a new tab">
              <img className="card-media" src={p.url} alt={p.name} />
            </a>
            <div className="card-content">
              <div className="chip-row">
                <span className={`chip ${i === 0 ? 'chip-primary' : ''}`}>
                  {i === 0 ? '🏆 1st' : i === 1 ? '🥈 2nd' : '🥉 3rd'}
                </span>
                <span className="mono">
                  {p.wins} win{p.wins !== 1 ? 's' : ''}
                </span>
              </div>
              <a
                className="text-secondary caption file-link"
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${p.path}`}
              >
                {p.path}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
