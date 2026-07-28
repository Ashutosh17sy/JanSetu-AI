import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { STATUS_META } from '@/services/constants';
import type { Complaint } from '@/services/types';

// Fix default marker icons for bundlers
const pinIcon = L.divIcon({
  className: '',
  html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.8.2.1.5.2.7.2.2 0 .5-.1.7-.2C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8z" fill="#2563eb"/><circle cx="12" cy="10" r="3" fill="white"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

interface ComplaintMapProps {
  complaints: Complaint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onSelect?: (c: Complaint) => void;
  showHeat?: boolean;
}

export function ComplaintMap({
  complaints,
  center = [28.6139, 77.209],
  zoom = 12,
  height = '400px',
  onSelect,
  showHeat,
}: ComplaintMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center, zoom, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();

    complaints.forEach((c) => {
      if (c.latitude == null || c.longitude == null) return;
      const meta = STATUS_META[c.status as keyof typeof STATUS_META] ?? STATUS_META.submitted;
      const color =
        c.status === 'resolved' ? '#10b981' :
        c.status === 'in_progress' ? '#f59e0b' :
        c.status === 'assigned' ? '#3b82f6' :
        c.status === 'rejected' ? '#f43f5e' : '#64748b';

      const icon = L.divIcon({
        className: '',
        html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.8.2.1.5.2.7.2.2 0 .5-.1.7-.2C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8z" fill="${color}"/><circle cx="12" cy="10" r="3" fill="white"/></svg></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -26],
      });

      const marker = L.marker([c.latitude, c.longitude], { icon });
      const popup = `
        <div style="min-width:180px;font-family:Inter,sans-serif">
          <div style="font-weight:600;font-size:13px;color:#0f172a;margin-bottom:4px">${c.ticket_number}</div>
          <div style="font-size:12px;color:#475569;margin-bottom:6px">${c.title}</div>
          <div style="display:inline-block;padding:2px 8px;border-radius:9999px;background:${meta.bg.includes('emerald') ? '#dcfce7' : meta.bg.includes('amber') ? '#fef3c7' : meta.bg.includes('blue') ? '#dbeafe' : '#f1f5f9'};color:${color};font-size:11px;font-weight:600">${meta.label}</div>
        </div>`;
      marker.bindPopup(popup);
      if (onSelect) marker.on('click', () => onSelect(c));
      layer.addLayer(marker);

      if (showHeat && c.status !== 'resolved' && c.status !== 'rejected') {
        const heat = L.circle([c.latitude, c.longitude], {
          radius: 300,
          color: color,
          fillColor: color,
          fillOpacity: 0.12,
          stroke: false,
        });
        layer.addLayer(heat);
      }
    });
  }, [complaints, onSelect, showHeat]);

  return <div ref={containerRef} style={{ height, width: '100%' }} className="overflow-hidden rounded-xl" />;
}

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (v: { lat: number; lng: number; address?: string }) => void;
  height?: string;
}

export function LocationPicker({ value, onChange, height = '300px' }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const initial: [number, number] = value ? [value.lat, value.lng] : [28.6139, 77.209];
    const map = L.map(containerRef.current, { center: initial, zoom: 13 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    if (value) {
      markerRef.current = L.marker([value.lat, value.lng], { icon: pinIcon }).addTo(map);
    }
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      }
      onChange({ lat, lng });
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. GPS button)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;
    map.setView([value.lat, value.lng], 15);
    if (markerRef.current) {
      markerRef.current.setLatLng([value.lat, value.lng]);
    } else {
      markerRef.current = L.marker([value.lat, value.lng], { icon: pinIcon }).addTo(map);
    }
  }, [value]);

  return <div ref={containerRef} style={{ height, width: '100%' }} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800" />;
}

interface WorkerMapProps {
  complaints: Complaint[];
  workerCenter?: [number, number];
  height?: string;
  onSelect?: (c: Complaint) => void;
}

export function WorkerMap({ complaints, workerCenter, height = '400px', onSelect }: WorkerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const center = workerCenter ?? [28.6139, 77.209];
    const map = L.map(containerRef.current, { center, zoom: 12 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    if (workerCenter) {
      const workerIcon = L.divIcon({
        className: '',
        html: `<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))"><svg width="30" height="30" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#0d9488"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      L.marker(workerCenter, { icon: workerIcon }).addTo(map);
    }
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    complaints.forEach((c) => {
      if (c.latitude == null || c.longitude == null) return;
      const icon = L.divIcon({
        className: '',
        html: `<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.8.2.1.5.2.7.2.2 0 .5-.1.7-.2C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8z" fill="#2563eb"/><circle cx="12" cy="10" r="3" fill="white"/></svg></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -26],
      });
      const m = L.marker([c.latitude, c.longitude], { icon });
      m.bindPopup(`<div style="font-family:Inter,sans-serif"><b>${c.ticket_number}</b><br/><span style="font-size:12px;color:#475569">${c.title}</span></div>`);
      if (onSelect) m.on('click', () => onSelect(c));
      layer.addLayer(m);
    });
  }, [complaints, onSelect]);

  return <div ref={containerRef} style={{ height, width: '100%' }} className="overflow-hidden rounded-xl" />;
}
