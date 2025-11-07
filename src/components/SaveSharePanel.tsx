import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProjectStore } from '../state/projectStore';

async function fetchShareUrl(projectState: unknown): Promise<string> {
  // Placeholder API call to Cloudflare Worker endpoint
  await new Promise((resolve) => setTimeout(resolve, 400));
  const encodedState = encodeURIComponent(JSON.stringify(projectState));
  return `${window.location.origin}/share?state=${encodedState}`;
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

  const { data: shareUrl, refetch, isFetching } = useQuery({
    queryKey: ['share-url', weights, activeLayers],
    queryFn: () => fetchShareUrl({ projectName, weights, activeLayers }),
    enabled: false
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
          await refetch();
          setSharing(false);
        }}
        disabled={isFetching || isSharing}
      >
        {isFetching || isSharing ? 'Generating…' : 'Save & Share'}
      </button>
      {isDialogOpen && shareUrl && (
        <div
          className="panel"
          style={{ position: 'absolute', top: '72px', left: '16px', maxWidth: '320px', zIndex: 10 }}
        >
          <strong>Shareable link</strong>
          <code
            style={{
              background: '#0f172a',
              color: 'white',
              padding: '8px',
              borderRadius: '6px',
              wordBreak: 'break-all'
            }}
          >
            {shareUrl}
          </code>
          <button className="secondary" onClick={() => setDialogOpen(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
