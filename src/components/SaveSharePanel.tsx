import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useProjectStore } from '../state/projectStore';
import { API_BASE_URL } from '../config';

async function requestShareUrl(projectState: unknown): Promise<string> {
  const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/share` : '/api/share';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ state: projectState })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to create share link');
  }

  const payload = (await response.json()) as { sharePath?: string };
  if (!payload.sharePath) {
    throw new Error('Share endpoint returned an invalid payload');
  }

  return `${window.location.origin}${payload.sharePath}`;
}

export function SaveSharePanel() {
  const { projectName, setProjectName, weights, activeLayers, setSharing, isSharing } =
    useProjectStore((state) => ({
      projectName: state.projectName,
      setProjectName: state.setProjectName,
      weights: state.weights,
      activeLayers: state.activeLayers,
      setSharing: state.setSharing,
      isSharing: state.isSharing
    }));

  const [isDialogOpen, setDialogOpen] = useState(false);

  const activeLayerIds = useMemo(
    () =>
      Object.entries(activeLayers)
        .filter(([, enabled]) => enabled)
        .map(([layerId]) => layerId),
    [activeLayers]
  );

  const shareMutation = useMutation({
    mutationFn: () => requestShareUrl({ projectName, weights, layers: activeLayerIds })
  });

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <input
        style={{
          borderRadius: '8px',
          border: '1px solid #cbd5f5',
          padding: '8px 12px',
          fontSize: '0.9rem'
        }}
        value={projectName}
        onChange={(event) => setProjectName(event.target.value)}
      />
      <button
        onClick={async () => {
          setSharing(true);
          setDialogOpen(true);
          try {
            await shareMutation.mutateAsync();
          } catch (error) {
            console.error('Failed to generate share link', error);
          } finally {
            setSharing(false);
          }
        }}
        disabled={shareMutation.isPending || isSharing}
      >
        {shareMutation.isPending || isSharing ? 'Generating…' : 'Save & Share'}
      </button>
      {isDialogOpen && (
        <div
          className="panel"
          style={{ position: 'absolute', top: '72px', left: '16px', maxWidth: '320px', zIndex: 10 }}
        >
          <strong>Shareable link</strong>
          {shareMutation.data ? (
            <code
              style={{
                background: '#0f172a',
                color: 'white',
                padding: '8px',
                borderRadius: '6px',
                wordBreak: 'break-all'
              }}
            >
              {shareMutation.data}
            </code>
          ) : (
            <p style={{ color: '#475569', fontSize: '0.85rem' }}>
              {shareMutation.isPending ? 'Preparing link…' : 'No link generated yet.'}
            </p>
          )}
          {shareMutation.isError && (
            <p style={{ color: '#dc2626', fontSize: '0.8rem' }}>
              {(shareMutation.error as Error).message}
            </p>
          )}
          <button className="secondary" onClick={() => setDialogOpen(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
