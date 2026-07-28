import { supabase } from './supabase';
import type { AIAnalysis } from './types';

export async function analyzeComplaint(input: {
  note: string;
  address: string;
  ward: string;
  fileName: string;
  latitude?: number;
  longitude?: number;
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
    throw new Error(`AI analysis failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as AIAnalysis;
}

export function generateTicketNumber(): string {
  const y = new Date().getFullYear();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  const ts = Date.now().toString().slice(-5);
  return `JS-${y}-${ts}${rnd}`;
}
