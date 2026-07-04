import { useState, useMemo, useEffect, useRef } from 'react'
import Header from './components/Header.jsx'
import IdleScreen from './components/IdleScreen.jsx'
import ReadyScreen from './components/ReadyScreen.jsx'
import PlayingScreen from './components/PlayingScreen.jsx'
import FinishedScreen from './components/FinishedScreen.jsx'
import Toast from './components/Toast.jsx'
import { isImageFile, estimateRounds, loadImageMeta, makeRound } from './utils/imageUtils.js'

export default function App() {
  const [photos, setPhotos] = useState([]) // [{id,name,path,url,width,height,wins}]
  const [stage, setStage] = useState('idle') // idle | ready | playing | finished
  const [roundIndex, setRoundIndex] = useState(0)
  const [currentPairs, setCurrentPairs] = useState([]) // [[idA,idB], ...] for active round
  const [pairIdx, setPairIdx] = useState(0)
  const [toast, setToast] = useState(null)
  const [duelLayout, setDuelLayout] = useState('row') // row | column
  const folderInputRef = useRef(null)
  const nextRoundRef = useRef([]) // winners accumulating for the next round

  // Track latest photos for safe unmount cleanup only (no mid-game revokes)
  const photosRef = useRef([])
  useEffect(() => {
    photosRef.current = photos
  }, [photos])
  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => {
        try {
          URL.revokeObjectURL(p.url)
        } catch (_) {}
      })
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const totalImages = photos.length
  const totalRounds = useMemo(() => estimateRounds(totalImages), [totalImages])
  const progress = useMemo(() => {
    if (stage !== 'playing') return 0
    const pairsCount = currentPairs.length || 1
    const step = pairIdx / pairsCount
    return Math.round((roundIndex / Math.max(1, totalRounds) + step / Math.max(1, totalRounds)) * 100)
  }, [stage, pairIdx, currentPairs.length, roundIndex, totalRounds])

  /** Keyboard shortcuts */
  useEffect(() => {
    function onKey(e) {
      if (stage !== 'playing') return
      if (e.key === 'ArrowLeft') chooseWinner(0)
      if (e.key === 'ArrowRight') chooseWinner(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, pairIdx, currentPairs])

  /** Folder selection (webkitdirectory) */
  async function onFolderChange(e) {
    const list = Array.from(e.target.files || []).filter(isImageFile)
    await ingestFiles(list)
    e.target.value = '' // allow re-pick of same folder
  }

  /** Ingest list of File objects into photos with metadata */
  async function ingestFiles(list) {
    if (!list.length) {
      setToast({ sev: 'info', msg: 'No images found in the selected folder.' })
      return
    }
    // Release previous URLs only because we're about to replace the whole set
    photosRef.current.forEach((p) => {
      try {
        URL.revokeObjectURL(p.url)
      } catch (_) {}
    })

    const uniqueByName = new Map()
    list.forEach((f) => uniqueByName.set(`${f.name}-${f.size}-${f.lastModified}`, f))
    const filesArr = Array.from(uniqueByName.values())

    const metas = await Promise.all(
      filesArr.map(async (f, idx) => {
        const url = URL.createObjectURL(f)
        const meta = await loadImageMeta(url)
        return {
          id: idx.toString(),
          name: f.name,
          path: f.webkitRelativePath || f.name,
          url,
          width: meta.width,
          height: meta.height,
          wins: 0,
        }
      }),
    )
    setPhotos(metas)
    setStage('ready')
    setRoundIndex(0)
    setPairIdx(0)
    setToast({ sev: 'success', msg: `Loaded ${metas.length} images. Estimated ${estimateRounds(metas.length)} rounds.` })
  }

  /** Prepare knockout bracket from current photos (no padding with nulls) */
  function startTournament() {
    if (photos.length < 2) {
      setToast({ sev: 'warning', msg: 'Need at least 2 images to start.' })
      return
    }
    const ids = photos.map((p) => p.id)
    const { pairs, carry } = makeRound(ids)

    setCurrentPairs(pairs)
    setStage('playing')
    setRoundIndex(1)
    setPairIdx(0)
    nextRoundRef.current = carry.slice() // pre-seed auto-advancers
  }

  function advancePair(winnerId) {
    nextRoundRef.current.push(winnerId)
    if (pairIdx + 1 < currentPairs.length) {
      setPairIdx(pairIdx + 1)
    } else {
      // Round finished -> build next round
      const advancing = nextRoundRef.current.slice()
      const realAdvancing = advancing.filter((id) => id !== null && id !== undefined)

      if (realAdvancing.length <= 1) {
        setStage('finished')
        setToast({ sev: 'success', msg: 'Tournament finished!' })
        return
      }

      const { pairs, carry } = makeRound(realAdvancing)
      setCurrentPairs(pairs)
      setRoundIndex((r) => r + 1)
      setPairIdx(0)
      nextRoundRef.current = carry.slice() // seed next round with auto-advancers
    }
  }

  /** Handle a user choice in current pair: idx 0|1 */
  function chooseWinner(idx) {
    const pair = currentPairs[pairIdx]
    if (!pair) return
    const [aId, bId] = pair

    let winnerId = idx === 0 ? aId : bId
    const loserId = idx === 0 ? bId : aId

    // handle byes (kept for safety, but pairs no longer contain nulls)
    if (aId === null && bId === null) winnerId = null
    else if (aId === null) winnerId = bId
    else if (bId === null) winnerId = aId

    if (winnerId !== null && loserId !== null) {
      setPhotos((prev) => prev.map((p) => (p.id === winnerId ? { ...p, wins: p.wins + 1 } : p)))
    }
    advancePair(winnerId)
  }

  /** Compute Top-3 by wins (ties: total pixels, then name) */
  const top3 = useMemo(() => {
    if (!photos.length) return []
    const sorted = photos.slice().sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      const aPx = a.width * a.height
      const bPx = b.width * b.height
      if (bPx !== aPx) return bPx - aPx
      return a.name.localeCompare(b.name)
    })
    return sorted.slice(0, 3)
  }, [photos])

  function restart() {
    setStage('ready')
    setRoundIndex(0)
    setPairIdx(0)
    setPhotos((prev) => prev.map((p) => ({ ...p, wins: 0 })))
    nextRoundRef.current = []
  }

  function clearAll() {
    photosRef.current.forEach((p) => {
      try {
        URL.revokeObjectURL(p.url)
      } catch (_) {}
    })
    setPhotos([])
    setStage('idle')
    setRoundIndex(0)
    setPairIdx(0)
    nextRoundRef.current = []
  }

  const chooseFolder = () => folderInputRef.current?.click()
  const toggleDuelLayout = () => setDuelLayout((l) => (l === 'row' ? 'column' : 'row'))

  return (
    <div className="app-shell">
      <Header
        totalImages={totalImages}
        totalRounds={totalRounds}
        stage={stage}
        roundIndex={roundIndex}
        pairIdx={pairIdx}
        currentPairsLength={currentPairs.length}
        onChooseFolder={chooseFolder}
        onRestart={restart}
      />
      <div className={`app-main${stage === 'playing' ? ' fit' : ''}`}>
        {/* Hidden folder input */}
        <input
          type="file"
          ref={folderInputRef}
          style={{ display: 'none' }}
          webkitdirectory="true"
          multiple
          accept="image/*"
          onChange={onFolderChange}
        />

        <div className={`panel main${stage === 'playing' ? ' panel-fit' : ''}`}>
          {stage === 'idle' && <IdleScreen onChooseFolder={chooseFolder} />}

          {stage === 'ready' && (
            <ReadyScreen
              totalImages={totalImages}
              totalRounds={totalRounds}
              onStart={startTournament}
              onClear={clearAll}
            />
          )}

          {stage === 'playing' && (
            <PlayingScreen
              progress={progress}
              photos={photos}
              currentPairs={currentPairs}
              pairIdx={pairIdx}
              layout={duelLayout}
              onToggleLayout={toggleDuelLayout}
              onChoose={chooseWinner}
            />
          )}

          {stage === 'finished' && <FinishedScreen top3={top3} />}
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  )
}
