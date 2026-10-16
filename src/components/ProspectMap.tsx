import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { RankedObservation } from '../engine';

type Props = {
  points: RankedObservation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  dataKey: string;
};

function toGeoJSON(points: RankedObservation[], selectedId: string | null) {
  return {
    type: 'FeatureCollection' as const,
    features: points.map((point) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: point.coordinates },
      properties: { id: point.id, name: point.name, score: point.score, selected: point.id === selectedId ? 1 : 0 }
    }))
  };
}

export function ProspectMap({ points, selectedId, onSelect, dataKey }: Props) {
  const element = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const selectHandler = useRef(onSelect);
  const pointsRef = useRef(points);
  const selectedRef = useRef(selectedId);
  const [mapError, setMapError] = useState(false);
  selectHandler.current = onSelect;
  pointsRef.current = points;
  selectedRef.current = selectedId;

  useEffect(() => {
    if (!element.current) return;
    const map = new maplibregl.Map({
      container: element.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-113.6, 39.6],
      zoom: 4.5,
      attributionControl: true
    });
    mapInstance.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    const initialize = () => {
      if (map.getSource('pap-sites')) return;
      map.addSource('pap-sites', { type: 'geojson', data: toGeoJSON(pointsRef.current, selectedRef.current) });
      map.addLayer({
        id: 'pap-halo', type: 'circle', source: 'pap-sites',
        paint: {
          'circle-radius': ['case', ['==', ['get', 'selected'], 1], 22, 13],
          'circle-color': ['case', ['==', ['get', 'selected'], 1], '#84cc16', '#f59e0b'],
          'circle-opacity': 0.15, 'circle-blur': 0.4
        }
      });
      map.addLayer({
        id: 'pap-sites-layer', type: 'circle', source: 'pap-sites',
        paint: {
          'circle-radius': ['case', ['==', ['get', 'selected'], 1], 10, 7],
          'circle-color': ['interpolate', ['linear'], ['get', 'score'], 0, '#64748b', 45, '#60a5fa', 65, '#fbbf24', 85, '#f97316'],
          'circle-stroke-color': ['case', ['==', ['get', 'selected'], 1], '#f8fafc', '#111827'],
          'circle-stroke-width': ['case', ['==', ['get', 'selected'], 1], 3, 1.5]
        }
      });
      map.on('click', 'pap-sites-layer', (event) => {
        const id = event.features?.[0]?.properties?.id;
        if (typeof id === 'string') selectHandler.current(id);
      });
      map.on('mouseenter', 'pap-sites-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'pap-sites-layer', () => { map.getCanvas().style.cursor = ''; });
    };
    map.on('load', initialize);
    map.on('error', () => setMapError(true));
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  useEffect(() => {
    const source = mapInstance.current?.getSource('pap-sites') as maplibregl.GeoJSONSource | undefined;
    if (source) source.setData(toGeoJSON(points, selectedId));
  }, [points, selectedId]);

  useEffect(() => {
    const map = mapInstance.current;
    const selected = points.find((point) => point.id === selectedId);
    if (map && selected) map.flyTo({ center: selected.coordinates, zoom: Math.max(map.getZoom(), 7), speed: 1.2, essential: true });
  }, [selectedId]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || points.length === 0 || !map.loaded()) return;
    const bounds = new maplibregl.LngLatBounds();
    points.forEach((point) => bounds.extend(point.coordinates));
    if (points.length === 1) map.flyTo({ center: points[0].coordinates, zoom: 8 });
    else map.fitBounds(bounds, { padding: 75, maxZoom: 8, duration: 650 });
  }, [dataKey]);

  return (
    <div className="map-view">
      <div ref={element} className="map-canvas" aria-label="Interactive prospect observations map" />
      <div className="map-top-note"><span className="live-dot" /> GEO-SPATIAL VIEW <span className="muted">·</span> {points.length} plotted locations</div>
      {mapError && <div className="map-warning">Basemap connection unavailable. Imported targets and score lists remain usable.</div>}
      <div className="map-bottom-note">Map tiles © OpenFreeMap / OpenStreetMap · Scores are model outputs, not mineral reserves</div>
    </div>
  );
}
