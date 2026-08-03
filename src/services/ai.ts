import { supabase } from './supabase';
import type { AIAnalysis } from './types';

export interface ImageFeatures {
  avgBrightness: number;
  avgSaturation: number;
  dominantHue: number;
  greenRatio: number;
  blueRatio: number;
  brownRatio: number;
  grayRatio: number;
  redRatio: number;
  yellowRatio: number;
  darkSpotRatio: number;
  edgeDensity: number;
  scatterRatio: number;
  isNight: boolean;
}

export async function extractImageFeatures(file: File): Promise<ImageFeatures | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const SAMPLE = 64;
    const canvas = document.createElement('canvas');
    canvas.width = SAMPLE;
    canvas.height = SAMPLE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(bitmap, 0, 0, SAMPLE, SAMPLE);
    const imageData = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
    const data = imageData.data;

    let totalR = 0, totalG = 0, totalB = 0;
    let totalBrightness = 0, totalSaturation = 0;
    const colorCounts: Record<string, number> = {};
    let darkPixels = 0;
    const totalPixels = SAMPLE * SAMPLE;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      totalR += r; totalG += g; totalB += b;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lum = (max + min) / 2 / 255;
      const sat = max === min ? 0 : (max - min) / (max + min > 255 ? 510 - max - min : max + min);
      totalBrightness += lum;
      totalSaturation += sat;

      if (lum < 0.15) darkPixels++;

      const color = classifyColor(r, g, b, lum, sat);
      colorCounts[color] = (colorCounts[color] ?? 0) + 1;
    }

    // Edge density via simple horizontal/vertical difference
    let edgePixels = 0;
    for (let y = 1; y < SAMPLE; y++) {
      for (let x = 1; x < SAMPLE; x++) {
        const idx = (y * SAMPLE + x) * 4;
        const idxLeft = (y * SAMPLE + (x - 1)) * 4;
        const idxUp = ((y - 1) * SAMPLE + x) * 4;
        const dr = Math.abs(data[idx] - data[idxLeft]) + Math.abs(data[idx] - data[idxUp]);
        if (dr > 60) edgePixels++;
      }
    }
    const edgeDensity = edgePixels / totalPixels;

    // Scatter: measure color variance across quadrants
    const quadrantColors: string[] = [];
    const halfS = SAMPLE / 2;
    for (let qy = 0; qy < 2; qy++) {
      for (let qx = 0; qx < 2; qx++) {
        let qr = 0, qg = 0, qb = 0, count = 0;
        for (let y = qy * halfS; y < (qy + 1) * halfS; y++) {
          for (let x = qx * halfS; x < (qx + 1) * halfS; x++) {
            const idx = (y * SAMPLE + x) * 4;
            qr += data[idx]; qg += data[idx + 1]; qb += data[idx + 2];
            count++;
          }
        }
        quadrantColors.push(classifyColor(qr / count, qg / count, qb / count, 0.5, 0.3));
      }
    }
    const uniqueQuadrantColors = new Set(quadrantColors).size;
    const scatterRatio = uniqueQuadrantColors / 4;

    const avgBrightness = totalBrightness / totalPixels;
    const avgSaturation = totalSaturation / totalPixels;

    return {
      avgBrightness: Math.round(avgBrightness * 100) / 100,
      avgSaturation: Math.round(avgSaturation * 100) / 100,
      dominantHue: 0,
      greenRatio: Math.round((colorCounts.green ?? 0) / totalPixels * 100) / 100,
      blueRatio: Math.round((colorCounts.blue ?? 0) / totalPixels * 100) / 100,
      brownRatio: Math.round((colorCounts.brown ?? 0) / totalPixels * 100) / 100,
      grayRatio: Math.round((colorCounts.gray ?? 0) / totalPixels * 100) / 100,
      redRatio: Math.round((colorCounts.red ?? 0) / totalPixels * 100) / 100,
      yellowRatio: Math.round((colorCounts.yellow ?? 0) / totalPixels * 100) / 100,
      darkSpotRatio: Math.round(darkPixels / totalPixels * 100) / 100,
      edgeDensity: Math.round(edgeDensity * 100) / 100,
      scatterRatio: Math.round(scatterRatio * 100) / 100,
      isNight: avgBrightness < 0.3,
    };
  } catch (err) {
    console.error('[extractImageFeatures] failed', err);
    return null;
  }
}

function classifyColor(r: number, g: number, b: number, lum: number, sat: number): string {
  if (lum < 0.2) return 'dark';
  if (sat < 0.15 && lum > 0.3 && lum < 0.85) return 'gray';
  if (sat < 0.1) return lum > 0.85 ? 'white' : 'gray';

  let hue = 0;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === r) hue = ((g - b) / (max - min)) * 60;
  else if (max === g) hue = ((b - r) / (max - min)) * 60 + 120;
  else hue = ((r - g) / (max - min)) * 60 + 240;
  if (hue < 0) hue += 360;

  if (hue >= 85 && hue <= 170) return 'green';
  if (hue >= 170 && hue <= 260) return 'blue';
  if (hue >= 20 && hue <= 50) return lum < 0.4 ? 'brown' : 'yellow';
  if (hue < 20 || hue >= 340) return 'red';
  return 'other';
}

export async function analyzeComplaint(input: {
  note: string;
  address: string;
  ward: string;
  fileName: string;
  latitude?: number;
  longitude?: number;
  imageFeatures?: ImageFeatures | null;
}): Promise<AIAnalysis> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-complaint`;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[analyzeComplaint] edge function returned error', { status: res.status, body: text });
    throw new Error(`AI analysis failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  if (data.error) {
    console.error('[analyzeComplaint] edge function returned error field', data.error);
    throw new Error(data.error);
  }
  console.info('[analyzeComplaint] analysis result', data);
  return data as AIAnalysis;
}

export function generateTicketNumber(): string {
  const y = new Date().getFullYear();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  const ts = Date.now().toString().slice(-5);
  return `JS-${y}-${ts}${rnd}`;
}
