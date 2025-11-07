import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useProjectStore } from '../state/projectStore';
import { layerCatalog } from '../types/layers';
import { SelectionToolbar } from './SelectionToolbar';

type ActiveLayerState = ReturnType<typeof useProjectStore.getState>['activeLayers'];

const INITIAL_VIEW_STATE = {
  center: [133.7751, -25.2744],
  zoom: 3,
  pitch: 0,
  bearing: 0
};

export function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const activeLayers = useProjectStore((state) => state.activeLayers);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: INITIAL_VIEW_STATE.center,
      zoom: INITIAL_VIEW_STATE.zoom,
      pitch: INITIAL_VIEW_STATE.pitch,
      bearing: INITIAL_VIEW_STATE.bearing
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.isStyleLoaded()) {
      map.once('load', () => synchronizeLayers(map, activeLayers));
    } else {
      synchronizeLayers(map, activeLayers);
    }
  }, [activeLayers]);

  return (
    <div className="map-container">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <SelectionToolbar />
    </div>
  );
}

function synchronizeLayers(map: maplibregl.Map, activeLayers: ActiveLayerState) {
  layerCatalog.forEach((layer) => {
    const sourceId = `pap-${layer.id}`;
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: layer.source.endsWith('.pmtiles') ? 'vector' : 'raster',
        url: layer.source.endsWith('.pmtiles') ? `pmtiles://${layer.source}` : undefined,
        tiles: layer.source.endsWith('.pmtiles') ? undefined : [`https://example.com/${layer.source}`],
        tileSize: layer.source.endsWith('.pmtiles') ? 512 : 256
      } as maplibregl.VectorSourceSpecification | maplibregl.RasterSourceSpecification);

      if (layer.source.endsWith('.pmtiles')) {
        map.addLayer({
          id: sourceId,
          type: 'fill',
          source: sourceId,
          'source-layer': 'default',
          paint: {
            'fill-color': ['case', ['boolean', ['feature-state', 'highlight'], false], '#f97316', '#1e3a8a'],
            'fill-opacity': 0.3
          }
        });
      } else {
        map.addLayer({
          id: sourceId,
          type: 'raster',
          source: sourceId,
          paint: {
            'raster-opacity': 0.65
          }
        });
      }
    }

    const layerInstance = map.getLayer(sourceId);
    if (layerInstance) {
      map.setLayoutProperty(sourceId, 'visibility', activeLayers[layer.id] ? 'visible' : 'none');
    }
  });
}
