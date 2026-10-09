# VigilX Lite

VigilX Lite is a frontend-only React prototype for reviewing synthetic Kubernetes audit activity. It groups local JSON events into 10-minute account windows, derives five activity features, and applies an explainable rule-based risk score.

The prototype demonstrates:

- a dashboard with summary metrics, severity distribution, suspicious activity, and a compact risk timeline;
- a searchable, filterable alert queue;
- alert details with feature values, triggered rules, event history, and a session-only human-review status;
- a Method view that documents every rule, threshold, confidence condition, and limitation;
- responsive mobile alert cards plus clear empty-data and no-search-result states.

The data in `src/data/audit-events.json` is fictional. This project has no backend, database, authentication, live Kubernetes connection, or machine learning model. It is not a production detector.

## Setup

Requirements: a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

Open the local address printed by Vite.

## Checks

```bash
npm test
npm run build
```

The automated checks cover score boundaries, rule points, confidence logic, empty input, event window aggregation, and the expected score, severity, and confidence for every supplied account window. The production build is written to `dist/`.

## Demo scoring thresholds

| Rule | Threshold | Points |
| --- | --- | ---: |
| Privileged action | At least one flagged action | 30 |
| Unusually high request volume | 10 or more requests | 25 |
| Many namespaces | 4 or more namespaces | 20 |
| Very fast repeated requests | At least 5 requests with an average gap of 6 seconds or less | 15 |
| Many resource types | 5 or more resource types | 10 |

Scores are capped at 100. Low is 0 to 39, Medium is 40 to 69, and High is 70 to 100. Confidence is High when at least two major rules are triggered. In this prototype, privileged action, unusually high volume, and many namespaces are major rules.
