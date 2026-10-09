import test from 'node:test'
import assert from 'node:assert/strict'
import { scoreWindow, summarizeEvents } from '../src/lib/risk.js'
import auditEvents from '../src/data/audit-events.json' with { type: 'json' }
import { demoEvents } from '../src/data/demo-events.js'

test('scores all five rules and caps risk at 100', () => {
  const result = scoreWindow({
    requestCount: 12,
    namespaceCount: 5,
    resourceTypeCount: 6,
    hasPrivilegedAction: true,
    averageGapSeconds: 3,
  })

  assert.equal(result.score, 100)
  assert.equal(result.severity, 'High')
  assert.equal(result.confidence, 'High')
  assert.deepEqual(result.triggeredRules.map((rule) => rule.points), [30, 25, 20, 15, 10])
})

test('uses the requested severity boundaries', () => {
  assert.equal(scoreWindow({ requestCount: 0, namespaceCount: 0, resourceTypeCount: 0, hasPrivilegedAction: false, averageGapSeconds: null }).severity, 'Low')
  assert.equal(scoreWindow({ requestCount: 10, namespaceCount: 1, resourceTypeCount: 1, hasPrivilegedAction: true, averageGapSeconds: 30 }).severity, 'Medium')
  assert.equal(scoreWindow({ requestCount: 10, namespaceCount: 4, resourceTypeCount: 5, hasPrivilegedAction: true, averageGapSeconds: 30 }).severity, 'High')
})

test('marks two major rules as high confidence', () => {
  const result = scoreWindow({
    requestCount: 3,
    namespaceCount: 4,
    resourceTypeCount: 2,
    hasPrivilegedAction: true,
    averageGapSeconds: 30,
  })

  assert.equal(result.score, 50)
  assert.equal(result.confidence, 'High')
})

test('summarizes Kubernetes audit events into account windows', () => {
  const events = [
    { id: 'a', timestamp: '2026-10-09T08:00:00Z', account: 'deploy-bot', verb: 'get', namespace: 'apps', resource: 'pods', privileged: false },
    { id: 'b', timestamp: '2026-10-09T08:00:04Z', account: 'deploy-bot', verb: 'create', namespace: 'system', resource: 'clusterroles', privileged: true },
    { id: 'c', timestamp: '2026-10-09T08:12:00Z', account: 'deploy-bot', verb: 'get', namespace: 'apps', resource: 'pods', privileged: false },
  ]

  const windows = summarizeEvents(events)
  const firstWindow = windows.find((window) => window.windowStart === '2026-10-09T08:00:00.000Z')

  assert.equal(windows.length, 2)
  assert.equal(firstWindow.features.requestCount, 2)
  assert.equal(firstWindow.features.averageGapSeconds, 4)
  assert.equal(firstWindow.features.hasPrivilegedAction, true)
})

test('scores every supplied synthetic account window as documented', () => {
  const actual = Object.fromEntries(summarizeEvents(auditEvents).map((window) => [
    window.account,
    { score: window.score, severity: window.severity, confidence: window.confidence },
  ]))

  assert.deepEqual(actual, {
    'system:serviceaccount:platform:admin-temp': { score: 100, severity: 'High', confidence: 'High' },
    'system:serviceaccount:delivery:ci-runner': { score: 40, severity: 'Medium', confidence: 'Standard' },
    'system:serviceaccount:payments:ops': { score: 60, severity: 'Medium', confidence: 'High' },
    'system:serviceaccount:infra:backup-agent': { score: 40, severity: 'Medium', confidence: 'Standard' },
    'contractor.user@example.test': { score: 70, severity: 'High', confidence: 'High' },
    'system:serviceaccount:security:audit-reader': { score: 0, severity: 'Low', confidence: 'Standard' },
  })
})

test('returns an empty window list when no local events exist', () => {
  assert.deepEqual(summarizeEvents([]), [])
})

test('live demo crosses the documented review thresholds', () => {
  const scoreAt = (count) => summarizeEvents(demoEvents.slice(0, count))[0].score

  assert.equal(scoreAt(3), 0)
  assert.equal(scoreAt(4), 30)
  assert.equal(scoreAt(5), 45)
  assert.equal(scoreAt(6), 75)
  assert.equal(scoreAt(10), 100)
  assert.equal(summarizeEvents(demoEvents)[0].severity, 'High')
})
