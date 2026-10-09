import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Gauge,
  KeyRound,
  LayoutDashboard,
  ListFilter,
  Network,
  Search,
  ShieldCheck,
  UserRoundCheck,
  Zap,
} from 'lucide-react'
import auditEvents from './data/audit-events.json'
import { scoringRules, summarizeEvents } from './lib/risk.js'

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'queue', label: 'Alert queue', icon: ListFilter },
  { id: 'method', label: 'Method', icon: CircleHelp },
]

const featureMeta = [
  { key: 'requestCount', label: 'Requests', icon: Activity },
  { key: 'namespaceCount', label: 'Namespaces', icon: Network },
  { key: 'resourceTypeCount', label: 'Resource types', icon: Boxes },
  { key: 'hasPrivilegedAction', label: 'Privileged action', icon: KeyRound },
  { key: 'averageGapSeconds', label: 'Average gap', icon: Gauge },
]

function formatDate(timestamp) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(timestamp))
}

function shortAccount(account) {
  return account.replace('system:serviceaccount:', '')
}

function SeverityBadge({ severity }) {
  return <span className={`badge severity-${severity.toLowerCase()}`}>{severity}</span>
}

function PageHeader({ title, description, actions }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions}
    </header>
  )
}

function Metric({ label, value, detail, icon: Icon, tone = 'default' }) {
  return (
    <article className={`metric metric-${tone}`}>
      <div className="metric-icon" aria-hidden="true"><Icon size={19} /></div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
  )
}

function Dashboard({ windows, onSelect }) {
  if (!windows.length) {
    return (
      <>
        <PageHeader title="Account activity overview" description="Synthetic Kubernetes audit activity grouped into 10-minute account windows." />
        <section className="panel empty-state" aria-labelledby="empty-data-heading">
          <Activity size={28} aria-hidden="true" />
          <h2 id="empty-data-heading">No audit events available</h2>
          <p>Add synthetic events to the local audit data file to populate the dashboard.</p>
        </section>
      </>
    )
  }

  const severityCounts = ['High', 'Medium', 'Low'].map((severity) => ({
    severity,
    count: windows.filter((window) => window.severity === severity).length,
  }))
  const suspicious = windows.filter((window) => window.score >= 40)
  const highConfidence = windows.filter((window) => window.confidence === 'High').length

  return (
    <>
      <PageHeader
        title="Account activity overview"
        description="Synthetic Kubernetes audit activity grouped into 10-minute account windows."
        actions={<span className="data-label"><Clock3 size={15} /> Latest window {formatDate(windows[0].windowStart)}</span>}
      />

      <section className="metrics-grid" aria-label="Activity summary">
        <Metric label="Windows analysed" value={windows.length} detail={`${auditEvents.length} audit events`} icon={Activity} />
        <Metric label="Alerts to review" value={suspicious.length} detail="Score of 40 or higher" icon={AlertTriangle} tone="amber" />
        <Metric label="High severity" value={severityCounts[0].count} detail="Score of 70 or higher" icon={ShieldCheck} tone="red" />
        <Metric label="High confidence" value={highConfidence} detail="At least two major rules" icon={CheckCircle2} tone="teal" />
      </section>

      <div className="dashboard-grid">
        <section className="panel severity-panel" aria-labelledby="severity-heading">
          <div className="section-heading">
            <div><h2 id="severity-heading">Severity distribution</h2><p>All analysed windows</p></div>
            <strong>{windows.length}</strong>
          </div>
          <div className="severity-bar" aria-label={severityCounts.map((item) => `${item.severity}: ${item.count}`).join(', ')}>
            {severityCounts.map((item) => (
              <span key={item.severity} className={`bar-${item.severity.toLowerCase()}`} style={{ width: `${(item.count / windows.length) * 100}%` }} />
            ))}
          </div>
          <div className="severity-legend">
            {severityCounts.map((item) => (
              <div key={item.severity}><span className={`legend-mark mark-${item.severity.toLowerCase()}`} /><span>{item.severity}</span><strong>{item.count}</strong></div>
            ))}
          </div>
        </section>

        <section className="panel timeline-panel" aria-labelledby="timeline-heading">
          <div className="section-heading"><div><h2 id="timeline-heading">Risk timeline</h2><p>Most recent six windows</p></div></div>
          <div className="mini-timeline">
            {windows.slice(0, 6).reverse().map((window) => (
              <button key={window.id} onClick={() => onSelect(window)} aria-label={`Open ${shortAccount(window.account)}, risk score ${window.score}`}>
                <span className="timeline-score">{window.score}</span>
                <span className={`timeline-bar severity-bg-${window.severity.toLowerCase()}`} style={{ height: `${Math.max(8, window.score)}%` }} />
                <span>{new Date(window.windowStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="panel activity-panel" aria-labelledby="recent-heading">
        <div className="section-heading">
          <div><h2 id="recent-heading">Recent suspicious activity</h2><p>Windows that reached Medium or High severity</p></div>
          <span>{suspicious.length} alerts</span>
        </div>
        <div className="activity-list">
          {suspicious.slice(0, 5).map((window) => (
            <button key={window.id} className="activity-row" onClick={() => onSelect(window)}>
              <span className={`risk-marker severity-bg-${window.severity.toLowerCase()}`} aria-hidden="true" />
              <span className="activity-account"><strong>{shortAccount(window.account)}</strong><small>{formatDate(window.windowStart)}</small></span>
              <span className="activity-rules">{window.triggeredRules.slice(0, 2).map((rule) => rule.label).join(' · ')}</span>
              <SeverityBadge severity={window.severity} />
              <strong className="score-cell">{window.score}</strong>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
    </>
  )
}

function AlertQueue({ windows, onSelect }) {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('All')
  const filtered = windows.filter((window) => {
    const matchesSearch = window.account.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (severity === 'All' || window.severity === severity)
  })

  return (
    <>
      <PageHeader title="Alert queue" description="Search and triage scored account windows from the synthetic dataset." />
      <section className="panel queue-panel" aria-labelledby="queue-heading">
        <div className="queue-toolbar">
          <div className="search-field">
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="alert-search">Search accounts</label>
            <input id="alert-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search account" />
          </div>
          <label className="filter-field">Severity
            <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
              <option>All</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
          </label>
          <span className="result-count" aria-live="polite">{filtered.length} results</span>
        </div>

        {filtered.length ? (
          <div className="table-wrap">
            <table>
              <caption className="sr-only">Alert queue with account, risk classification, confidence, timestamp, and triggered scoring rules</caption>
              <thead><tr><th scope="col">Account</th><th scope="col">Severity</th><th scope="col">Score</th><th scope="col">Confidence</th><th scope="col">Timestamp</th><th scope="col">Triggered rules</th><th scope="col"><span className="sr-only">Open</span></th></tr></thead>
              <tbody>
                {filtered.map((window) => (
                  <tr key={window.id}>
                    <td className="account-cell" data-label="Account"><button className="account-link" onClick={() => onSelect(window)}>{shortAccount(window.account)}</button></td>
                    <td className="severity-cell" data-label="Severity"><SeverityBadge severity={window.severity} /></td>
                    <td data-label="Score"><strong className="score-cell">{window.score}</strong></td>
                    <td data-label="Confidence">{window.confidence === 'High' ? <span className="confidence"><CheckCircle2 size={15} /> High</span> : 'Standard'}</td>
                    <td data-label="Timestamp">{formatDate(window.windowStart)}</td>
                    <td className="rules-cell" data-label="Triggered rules">{window.triggeredRules.length ? window.triggeredRules.map((rule) => rule.label).join(', ') : 'No rules triggered'}</td>
                    <td className="open-cell"><button className="icon-button" onClick={() => onSelect(window)} aria-label={`Open details for ${shortAccount(window.account)}`}><ChevronRight size={18} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Search size={26} />
            <h2>{windows.length ? 'No matching alerts' : 'No audit events available'}</h2>
            <p>{windows.length ? 'Clear the search or choose another severity.' : 'Add synthetic events to the local audit data file to populate the queue.'}</p>
          </div>
        )}
      </section>
    </>
  )
}

function AlertDetail({ window, reviewStatus, onStatusChange, onBack }) {
  const featureValue = (key, value) => {
    if (key === 'hasPrivilegedAction') return value ? 'Yes' : 'No'
    if (key === 'averageGapSeconds') return value === null ? 'N/A' : `${value}s`
    return value
  }

  return (
    <>
      <button className="back-button" onClick={onBack}><ArrowLeft size={17} /> Back to alert queue</button>
      <PageHeader
        title={shortAccount(window.account)}
        description={`10-minute window starting ${formatDate(window.windowStart)}`}
        actions={<div className="detail-score"><span>Risk score</span><strong>{window.score}</strong><SeverityBadge severity={window.severity} /></div>}
      />

      <div className="detail-layout">
        <div className="detail-main">
          <section className="feature-grid" aria-label="Window feature values">
            {featureMeta.map(({ key, label, icon: Icon }) => (
              <article className="feature" key={key}>
                <Icon size={18} aria-hidden="true" /><span>{label}</span><strong>{featureValue(key, window.features[key])}</strong>
              </article>
            ))}
          </section>

          <section className="panel" aria-labelledby="rules-heading">
            <div className="section-heading"><div><h2 id="rules-heading">Triggered rules</h2><p>Points added by the baseline scorer</p></div></div>
            {window.triggeredRules.length ? (
              <div className="trigger-list">
                {window.triggeredRules.map((rule) => (
                  <div key={rule.id}><span className="rule-icon"><Zap size={16} /></span><span><strong>{rule.label}</strong><small>{rule.major ? 'Major rule' : 'Supporting rule'}</small></span><b>+{rule.points}</b></div>
                ))}
              </div>
            ) : <p className="quiet-message">No scoring rules were triggered in this window.</p>}
          </section>

          <section className="panel" aria-labelledby="events-heading">
            <div className="section-heading"><div><h2 id="events-heading">Event timeline</h2><p>{window.events.length} synthetic audit events</p></div></div>
            <div className="event-list">
              {window.events.map((event) => (
                <div className="event-row" key={event.id}>
                  <time>{new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</time>
                  <span className="verb">{event.verb}</span>
                  <span><strong>{event.resource}</strong><small>{event.namespace}</small></span>
                  <span className="source-ip">{event.sourceIP}</span>
                  <span className={`status-code status-${Math.floor(event.statusCode / 100)}`}>{event.statusCode}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="detail-aside">
          <section className="panel review-panel" aria-labelledby="review-heading">
            <UserRoundCheck size={22} aria-hidden="true" />
            <h2 id="review-heading">Human review</h2>
            <p>Record the current triage state for this prototype session.</p>
            <label htmlFor="review-status">Review status</label>
            <select id="review-status" value={reviewStatus} onChange={(event) => onStatusChange(event.target.value)}>
              <option>Unreviewed</option><option>Investigating</option><option>Escalated</option><option>Benign</option><option>Resolved</option>
            </select>
            <p className="status-note" role="status">Current status: <strong>{reviewStatus}</strong></p>
          </section>
          <section className="panel context-panel">
            <h2>Window context</h2>
            <dl>
              <div><dt>Confidence</dt><dd>{window.confidence}</dd></div>
              <div><dt>Major rules</dt><dd>{window.majorRuleCount}</dd></div>
              <div><dt>Source IP</dt><dd>{window.events[0].sourceIP}</dd></div>
              <div><dt>Window length</dt><dd>10 minutes</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </>
  )
}

function Method() {
  return (
    <>
      <PageHeader title="Method" description="How VigilX Lite turns synthetic audit activity into explainable scores." />
      <div className="method-layout">
        <section className="panel method-copy">
          <ShieldCheck size={28} aria-hidden="true" />
          <h2>A transparent rule-based baseline</h2>
          <p>VigilX Lite groups synthetic Kubernetes-style audit events by account into fixed 10-minute windows. It derives five simple activity features and adds points when a threshold is crossed.</p>
          <p>This prototype is not a production detector, does not process live clusters, and does not use a trained machine learning model. The local data is fictional and exists only to demonstrate the review workflow.</p>
          <p>A later system could replace these fixed rules with a validated anomaly-detection or classification model while keeping the same analyst-facing evidence and human-review step.</p>
        </section>
        <section className="panel" aria-labelledby="scoring-heading">
          <div className="section-heading"><div><h2 id="scoring-heading">Scoring rules</h2><p>Thresholds used in this demo</p></div></div>
          <div className="method-rules">
            {scoringRules.map((rule) => (
              <div key={rule.id}><span><strong>{rule.label}</strong><small>{rule.major ? 'Counts as a major rule' : 'Supporting rule'}</small></span><b>+{rule.points}</b></div>
            ))}
          </div>
          <div className="thresholds">
            <p><strong>High volume:</strong> 10 or more requests</p>
            <p><strong>Many namespaces:</strong> 4 or more</p>
            <p><strong>Very fast:</strong> average gap of 6 seconds or less, with at least 5 requests</p>
            <p><strong>Many resource types:</strong> 5 or more</p>
          </div>
        </section>
      </div>
      <section className="classification-strip" aria-label="Score classification">
        <div><SeverityBadge severity="Low" /><strong>0 to 39</strong></div>
        <div><SeverityBadge severity="Medium" /><strong>40 to 69</strong></div>
        <div><SeverityBadge severity="High" /><strong>70 to 100</strong></div>
        <p><CheckCircle2 size={17} /> High confidence requires at least two major rules.</p>
      </section>
    </>
  )
}

export default function App() {
  const windows = useMemo(() => summarizeEvents(auditEvents), [])
  const [view, setView] = useState('dashboard')
  const [selected, setSelected] = useState(null)
  const [reviewStatuses, setReviewStatuses] = useState({})

  function openDetail(window) {
    setSelected(window)
    setView('detail')
  }

  function navigate(nextView) {
    setView(nextView)
    if (nextView !== 'detail') setSelected(null)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className="sidebar">
        <div className="brand"><span><ShieldCheck size={22} /></span><div><strong>VigilX</strong><small>Lite</small></div></div>
        <nav aria-label="Primary navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id ? 'active' : ''} aria-label={label} aria-current={view === id ? 'page' : undefined} onClick={() => navigate(id)}>
              <Icon size={19} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note"><span>Synthetic data</span><p>Local prototype only</p></div>
      </aside>
      <main id="main-content" className="content" tabIndex="-1">
        {view === 'dashboard' && <Dashboard windows={windows} onSelect={openDetail} />}
        {view === 'queue' && <AlertQueue windows={windows} onSelect={openDetail} />}
        {view === 'detail' && selected && (
          <AlertDetail
            window={selected}
            reviewStatus={reviewStatuses[selected.id] ?? 'Unreviewed'}
            onStatusChange={(status) => setReviewStatuses((current) => ({ ...current, [selected.id]: status }))}
            onBack={() => navigate('queue')}
          />
        )}
        {view === 'method' && <Method />}
      </main>
    </div>
  )
}
