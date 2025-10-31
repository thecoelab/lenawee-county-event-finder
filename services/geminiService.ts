import { Event, GroundingSource } from '../types';

// Client-side shim: call the secure server-side endpoint
const fetchEventsFromGemini = async (): Promise<{ events: Event[]; sources: GroundingSource[] }> => {
  const res = await fetch('/api/events');
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Server error fetching events: ${res.status} ${text}`);
  }
  return res.json();
};

export { fetchEventsFromGemini };