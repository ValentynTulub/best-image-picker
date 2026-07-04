export default function PhotoCard({ photo, label, onPick }) {
  if (!photo) {
    return (
      <div className="duel-side">
        <p className="text-secondary">Bye</p>
      </div>
    )
  }
  return (
    <div className="duel-side">
      <img className="duel-img" src={photo.url} alt={photo.name} />
      <div className="pick-btn">
        <button className="btn btn-overlay" onClick={onPick}>
          ✅ Choose {label}
        </button>
      </div>
    </div>
  )
}
