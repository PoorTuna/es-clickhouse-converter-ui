import { useState } from 'react';
import { AlertCircle, CheckCircle2, Plug, PlugZap } from 'lucide-react';
import { Button, Card, Hint, Input, Label } from '../ui';
import { useEsStore } from '@/store/esStore';

export function EsConnectForm() {
  const { status, error, cluster, sessionId, connect, disconnect } = useEsStore();
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tlsEnabled, setTlsEnabled] = useState(true);
  const [caCert, setCaCert] = useState('');

  const connecting = status === 'connecting';
  const isHttps = url.trim().toLowerCase().startsWith('https');

  const onConnect = () =>
    void connect({
      url: url.trim(),
      username,
      password,
      tls_enabled: tlsEnabled,
      ca_cert: caCert.trim() ? caCert : null,
    });

  if (sessionId && cluster) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-ch-suggestion">
            <CheckCircle2 size={16} /> Connected to <strong>{cluster.name}</strong> (ES{' '}
            {cluster.version})
          </span>
          <Button variant="outline" onClick={disconnect}>
            <PlugZap size={15} /> Disconnect
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label htmlFor="es-url">Cluster URL</Label>
        <Input
          id="es-url"
          placeholder="https://es.example.com:9200"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Hint>Connection is session-only and discarded when you leave.</Hint>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="es-user">Username</Label>
          <Input id="es-user" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="es-pass">Password</Label>
          <Input
            id="es-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ch-text">
        <input
          type="checkbox"
          checked={tlsEnabled}
          onChange={(e) => setTlsEnabled(e.target.checked)}
          className="h-4 w-4 accent-ch-yellow"
        />
        Verify TLS certificate
        {isHttps && !tlsEnabled && (
          <span className="text-xs text-ch-warning">— insecure: certificate not checked</span>
        )}
      </label>

      {tlsEnabled && (
        <div>
          <Label htmlFor="es-ca">CA certificate (PEM, optional)</Label>
          <textarea
            id="es-ca"
            rows={4}
            placeholder="-----BEGIN CERTIFICATE-----"
            value={caCert}
            onChange={(e) => setCaCert(e.target.value)}
            className="w-full rounded-md border border-ch-border bg-ch-bg px-3 py-2 font-mono text-xs text-ch-text placeholder:text-ch-muted focus:outline-none focus:ring-2 focus:ring-ch-yellow/50"
          />
          <Hint>Leave blank to use the system trust store.</Hint>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-ch-danger">
          <AlertCircle size={15} /> {error}
        </p>
      )}

      <Button variant="primary" onClick={onConnect} disabled={connecting || url.trim() === ''}>
        <Plug size={15} /> {connecting ? 'Connecting…' : 'Connect'}
      </Button>
    </Card>
  );
}
