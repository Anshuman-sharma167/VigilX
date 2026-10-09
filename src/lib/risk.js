const RULES = [
  { id: 'privileged', label: 'Privileged action', points: 30, major: true, test: (f) => f.hasPrivilegedAction },
  { id: 'volume', label: 'Unusually high request volume', points: 25, major: true, test: (f) => f.requestCount >= 10 },
  { id: 'namespaces', label: 'Many namespaces accessed', points: 20, major: true, test: (f) => f.namespaceCount >= 4 },
  { id: 'speed', label: 'Very fast repeated requests', points: 15, major: false, test: (f) => f.requestCount >= 5 && f.averageGapSeconds <= 6 },
  { id: 'resources', label: 'Many resource types accessed', points: 10, major: false, test: (f) => f.resourceTypeCount >= 5 },
]

export function scoreWindow(features) {
  const triggeredRules = RULES.filter((rule) => rule.test(features)).map(({ test, ...rule }) => rule)
  const score = Math.min(100, triggeredRules.reduce((total, rule) => total + rule.points, 0))
  const severity = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low'
  const majorRuleCount = triggeredRules.filter((rule) => rule.major).length

  return {
    score,
    severity,
    confidence: majorRuleCount >= 2 ? 'High' : 'Standard',
    majorRuleCount,
    triggeredRules,
  }
}

function tenMinuteStart(timestamp) {
  const date = new Date(timestamp)
  date.setUTCMinutes(Math.floor(date.getUTCMinutes() / 10) * 10, 0, 0)
  return date.toISOString()
}

export function summarizeEvents(events) {
  const grouped = new Map()

  for (const event of events) {
    const windowStart = tenMinuteStart(event.timestamp)
    const key = `${event.account}|${windowStart}`
    const group = grouped.get(key) ?? { id: key, account: event.account, windowStart, events: [] }
    group.events.push(event)
    grouped.set(key, group)
  }

  return [...grouped.values()]
    .map((group) => {
      group.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      const gaps = group.events.slice(1).map((event, index) => (
        new Date(event.timestamp) - new Date(group.events[index].timestamp)
      ) / 1000)
      const features = {
        requestCount: group.events.length,
        namespaceCount: new Set(group.events.map((event) => event.namespace)).size,
        resourceTypeCount: new Set(group.events.map((event) => event.resource)).size,
        hasPrivilegedAction: group.events.some((event) => event.privileged),
        averageGapSeconds: gaps.length ? Number((gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length).toFixed(1)) : null,
      }

      return { ...group, features, ...scoreWindow(features) }
    })
    .sort((a, b) => new Date(b.windowStart) - new Date(a.windowStart))
}

export const scoringRules = RULES.map(({ test, ...rule }) => rule)
