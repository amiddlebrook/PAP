import { useState } from 'react';

const tools = [
  { id: 'lasso', label: 'Lasso' },
  { id: 'rectangle', label: 'Box' },
  { id: 'point', label: 'Point' }
] as const;

type ToolId = (typeof tools)[number]['id'];

export function SelectionToolbar() {
  const [activeTool, setActiveTool] = useState<ToolId>('rectangle');

  return (
    <div className="selection-toolbar">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={activeTool === tool.id ? '' : 'secondary'}
          onClick={() => setActiveTool(tool.id)}
        >
          {tool.label}
        </button>
      ))}
      <button className="secondary">Export</button>
    </div>
  );
}
