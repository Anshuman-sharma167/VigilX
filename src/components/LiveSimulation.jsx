import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ShieldAlert,
  SkipForward,
} from 'lucide-react'
import { demoEvents } from '../data/demo-events.js'
import { scoreWindow, summarizeEvents } from '../lib/risk.js'

const emptyFeatures = {
  requestCount: 0,
  namespaceCount: 0,
  resourceTypeCount: 0,
  hasPrivilegedAction: false,
  averageGapSeconds: null,
}

function formatClock(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

function SignalState({ score, severity }) {
  const Icon = score >= 70 ? ShieldAlert : score >= 40 ? AlertTriangle : CheckCircle2
  const label = score >= 70 ? 'High-priority alert' : score >= 40 ? 'Review threshold crossed' : 'Monitoring activity'

  return (
    <div className={`simulation-state simulation-state-${severity.toLowerCase()}`} role="status" aria-live="polite">
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export default function LiveSimulation({ onOpenAlert }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [playing, setPlaying] = useState(() => new URLSearchParams(window.location.search).get('autoplay') === '1')
  const visibleEvents = demoEvents.slice(0, visibleCount)
  const completed = visibleCount === demoEvents.length
  const generatedWindow = useMemo(
    () => visibleEvents.length ? summarizeEvents(visibleEvents)[0] : null,
    [visibleEvents],
  )
  const features = generatedWindow?.features ?? emptyFeatures
  const risk = generatedWindow ?? scoreWindow(features)

  useEffect(() => {
    if (!playing) return undefined
    if (completed) {
      setPlaying(false)
      return undefined
    }

    const timer = window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + 1, demoEvents.length))
    }, 850)

    return () => window.clearTimeout(timer)
  }, [completed, playing, visibleCount])

  function start() {
    if (completed) setVisibleCount(0)
    setPlaying(true)
  }

  function reset() {
    setPlaying(false)
    setVisibleCount(0)
  }

  function step() {
    setPlaying(false)
    setVisibleCount((count) => Math.min(count + 1, demoEvents.length))
  }

  return (
    <>
      <header className="page-header simulation-header">
        <div>
          <h1>Live detection simulation</h1>
          <p>Replay a synthetic account sequence and watch each audit event change the review score.</p>
        </div>
        <span className="data-label"><Radio size={15} /> Synthetic replay</span>
      </header>

      <div className="simulation-toolbar" aria-label="Simulation controls">
        <button className="primary-action" onClick={playing ? () => setPlaying(false) : start}>
          {playing ? <Pause size={17} /> : <Play size={17} />}
          {playing ? 'Pause' : completed ? 'Replay simulation' : 'Run simulation'}
        </button>
        <button className="secondary-action" onClick={step} disabled={completed || playing}>
          <SkipForward size={17} /> Next event
        </button>
        <button className="secondary-action" onClick={reset} disabled={!visibleCount}>
          <RotateCcw size={17} /> Reset
        </button>
        <span className="simulation-progress" aria-live="polite">Event {visibleCount} of {demoEvents.length}</span>
      </div>

      <div className="simulation-layout">
        <section className="panel simulation-stream" aria-labelledby="stream-heading">
          <div className="section-heading">
            <div><h2 id="stream-heading">Incoming audit events</h2><p>Account: platform:demo-agent</p></div>
            <span className={playing ? 'live-indicator active' : 'live-indicator'}><i />{playing ? 'Receiving' : completed ? 'Complete' : 'Ready'}</span>
          </div>

          <div className="simulation-events" aria-live="polite" aria-relevant="additions">
            {visibleEvents.length ? visibleEvents.map((event, index) => (
              <div className="simulation-event" key={event.id}>
                <span className="event-number">{String(index + 1).padStart(2, '0')}</span>
                <time>{formatClock(event.timestamp)}</time>
                <span className="verb">{event.verb}</span>
                <span className="simulation-resource"><strong>{event.resource}</strong><small>{event.namespace}</small></span>
                {event.privileged && <span className="privileged-flag">Privileged</span>}
              </div>
            )) : (
              <div className="simulation-empty">
                <Radio size={24} aria-hidden="true" />
                <strong>Simulation ready</strong>
                <p>Run the replay or advance one event at a time.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="simulation-analysis">
          <section className="panel live-risk" aria-labelledby="live-score-heading">
            <span id="live-score-heading">Current risk score</span>
            <strong>{risk.score}</strong>
            <SignalState score={risk.score} severity={risk.severity} />
            <div className="risk-meter" aria-label={`Risk score ${risk.score} out of 100`}>
              <span className={`severity-bg-${risk.severity.toLowerCase()}`} style={{ width: `${risk.score}%` }} />
            </div>
            <div className="risk-scale"><span>0</span><span>40 review</span><span>70 high</span><span>100</span></div>
          </section>

          <section className="panel live-features" aria-labelledby="live-features-heading">
            <div className="section-heading"><div><h2 id="live-features-heading">Window evidence</h2><p>Recalculated after every event</p></div></div>
            <dl>
              <div><dt>Requests</dt><dd>{features.requestCount}</dd></div>
              <div><dt>Namespaces</dt><dd>{features.namespaceCount}</dd></div>
              <div><dt>Resource types</dt><dd>{features.resourceTypeCount}</dd></div>
              <div><dt>Average gap</dt><dd>{features.averageGapSeconds === null ? 'N/A' : `${features.averageGapSeconds}s`}</dd></div>
              <div><dt>Privileged action</dt><dd>{features.hasPrivilegedAction ? 'Yes' : 'No'}</dd></div>
            </dl>
          </section>

          <section className="panel live-rules" aria-labelledby="live-rules-heading">
            <div className="section-heading"><div><h2 id="live-rules-heading">Rules triggered</h2><p>{risk.triggeredRules.length} of 5</p></div></div>
            <div className="live-rule-list">
              {risk.triggeredRules.length ? risk.triggeredRules.map((rule) => (
                <div key={rule.id}><span>{rule.label}</span><strong>+{rule.points}</strong></div>
              )) : <p>No rule has crossed its threshold.</p>}
            </div>
          </section>

          <button
            className="open-generated-alert"
            disabled={!generatedWindow || generatedWindow.score < 40}
            onClick={() => onOpenAlert(generatedWindow)}
          >
            <ShieldAlert size={18} /> Open generated alert
          </button>
        </aside>
      </div>
    </>
  )
}

