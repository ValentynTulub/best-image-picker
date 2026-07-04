export default function ProgressBar({ value }) {
  return (
    <div className="progress-track">
      <div className="progress-bar" style={{ width: `${value}%` }} />
    </div>
  )
}
