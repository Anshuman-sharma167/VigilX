export const demoEvents = [
  { id: 'demo-01', timestamp: '2026-10-10T10:00:00Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'get', resource: 'pods', namespace: 'apps', sourceIP: '10.42.7.19', statusCode: 200, privileged: false },
  { id: 'demo-02', timestamp: '2026-10-10T10:00:04Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'list', resource: 'deployments', namespace: 'apps', sourceIP: '10.42.7.19', statusCode: 200, privileged: false },
  { id: 'demo-03', timestamp: '2026-10-10T10:00:08Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'get', resource: 'configmaps', namespace: 'staging', sourceIP: '10.42.7.19', statusCode: 200, privileged: false },
  { id: 'demo-04', timestamp: '2026-10-10T10:00:12Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'get', resource: 'secrets', namespace: 'payments', sourceIP: '10.42.7.19', statusCode: 200, privileged: true },
  { id: 'demo-05', timestamp: '2026-10-10T10:00:16Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'exec', resource: 'pods', namespace: 'payments', sourceIP: '10.42.7.19', statusCode: 201, privileged: true },
  { id: 'demo-06', timestamp: '2026-10-10T10:00:20Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'create', resource: 'rolebindings', namespace: 'kube-system', sourceIP: '10.42.7.19', statusCode: 201, privileged: true },
  { id: 'demo-07', timestamp: '2026-10-10T10:00:24Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'list', resource: 'serviceaccounts', namespace: 'kube-system', sourceIP: '10.42.7.19', statusCode: 200, privileged: false },
  { id: 'demo-08', timestamp: '2026-10-10T10:00:28Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'get', resource: 'services', namespace: 'monitoring', sourceIP: '10.42.7.19', statusCode: 200, privileged: false },
  { id: 'demo-09', timestamp: '2026-10-10T10:00:32Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'list', resource: 'networkpolicies', namespace: 'monitoring', sourceIP: '10.42.7.19', statusCode: 200, privileged: false },
  { id: 'demo-10', timestamp: '2026-10-10T10:00:36Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'get', resource: 'nodes', namespace: 'default', sourceIP: '10.42.7.19', statusCode: 200, privileged: false },
  { id: 'demo-11', timestamp: '2026-10-10T10:00:40Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'list', resource: 'pods', namespace: 'security', sourceIP: '10.42.7.19', statusCode: 200, privileged: false },
  { id: 'demo-12', timestamp: '2026-10-10T10:00:44Z', account: 'system:serviceaccount:platform:demo-agent', verb: 'get', resource: 'secrets', namespace: 'security', sourceIP: '10.42.7.19', statusCode: 200, privileged: true },
]

