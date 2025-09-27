// Mocked travel-time estimation without external APIs
// Uses haversine distance when coordinates are available, otherwise
// derives a stable pseudo-distance from location names.

export type TravelMode = 'walk' | 'drive' | 'transit' | 'auto';

export interface LocationLike {
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface TravelSettings {
  walkingSpeedKmh: number; // default 4.5 km/h
  defaultBufferMin: number; // default 5 min
}

export interface TravelEstimate {
  distanceKm: number;
  durationMin: number; // pure travel time
  bufferMin: number;
  totalMin: number; // travel + buffer
  mode: TravelMode;
}

const DEFAULT_SETTINGS: TravelSettings = {
  walkingSpeedKmh: 4.5,
  defaultBufferMin: 5,
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

const haversineKm = (a: LocationLike, b: LocationLike): number | null => {
  if (
    a.latitude === undefined ||
    a.longitude === undefined ||
    b.latitude === undefined ||
    b.longitude === undefined
  ) {
    return null;
  }
  const R = 6371; // km
  const dLat = toRad((b.latitude as number) - (a.latitude as number));
  const dLon = toRad((b.longitude as number) - (a.longitude as number));
  const lat1 = toRad(a.latitude as number);
  const lat2 = toRad(b.latitude as number);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
};

// Stable pseudo distance for name-only locations (0.3km - 5.0km)
const pseudoDistanceKm = (fromName: string, toName: string): number => {
  if (fromName.trim().toLowerCase() === toName.trim().toLowerCase()) return 0.05; // same place ~50m
  const seed = simpleHash(fromName + '->' + toName);
  const min = 0.3;
  const max = 5.0;
  return min + (seed % 1000) / 1000 * (max - min);
};

const simpleHash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h);
};

export const estimateTravel = (
  from: LocationLike,
  to: LocationLike,
  mode: TravelMode,
  settings?: Partial<TravelSettings>
): TravelEstimate => {
  const cfg: TravelSettings = { ...DEFAULT_SETTINGS, ...(settings || {}) };

  const distanceKm =
    haversineKm(from, to) ?? pseudoDistanceKm(from.name || '', to.name || '');

  let durationMin: number;
  if (mode === 'walk') {
    durationMin = (distanceKm / cfg.walkingSpeedKmh) * 60;
  } else if (mode === 'drive') {
    // Average city speed ~ 28km/h + 4 min lights/parking overhead
    durationMin = (distanceKm / 28) * 60 + 4;
  } else if (mode === 'transit') {
    // Transit: ~ 22km/h + 6 min average wait/transfer
    durationMin = (distanceKm / 22) * 60 + 6;
  } else if (mode === 'auto') {
    // Auto mode: choose the fastest option
    const walkTime = (distanceKm / cfg.walkingSpeedKmh) * 60;
    const driveTime = (distanceKm / 28) * 60 + 4;
    const transitTime = (distanceKm / 22) * 60 + 6;
    durationMin = Math.min(walkTime, driveTime, transitTime);
  } else {
    // Default to walking
    durationMin = (distanceKm / cfg.walkingSpeedKmh) * 60;
  }

  // Clamp sensible bounds
  durationMin = Math.max(1, Math.min(durationMin, 120));

  const bufferMin = cfg.defaultBufferMin;
  const totalMin = durationMin + bufferMin;

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    durationMin: Math.round(durationMin),
    bufferMin,
    totalMin: Math.round(totalMin),
    mode,
  };
};

// Simple auto-mode selector based on distance
export const pickAutoMode = (distanceKm: number): TravelMode => {
  if (distanceKm < 1.5) return 'walk';
  if (distanceKm < 6) return 'transit';
  return 'drive';
};

export const estimateWithAutoMode = (
  from: LocationLike,
  to: LocationLike,
  settings?: Partial<TravelSettings>
): TravelEstimate => {
  const distanceKm = haversineKm(from, to) ?? pseudoDistanceKm(from.name || '', to.name || '');
  const mode = pickAutoMode(distanceKm);
  return estimateTravel(from, to, mode, settings);
};

export interface LeaveByResult extends TravelEstimate {
  leaveByISO: string; // when to depart to arrive on time
  status: 'on_time' | 'at_risk' | 'late';
}

// Compute leave-by for a pair of activities based on the next start time
export const computeLeaveBy = (
  currentStartISO: string,
  nextStartISO: string,
  from: LocationLike,
  to: LocationLike,
  mode: TravelMode,
  nowISO?: string,
  settings?: Partial<TravelSettings>
): LeaveByResult => {
  const est = estimateTravel(from, to, mode, settings);
  const nextStart = new Date(nextStartISO);
  const leaveBy = new Date(nextStart.getTime() - est.totalMin * 60 * 1000);
  const now = new Date(nowISO || new Date().toISOString());

  let status: 'on_time' | 'at_risk' | 'late' = 'on_time';
  if (now > leaveBy) status = now > nextStart ? 'late' : 'at_risk';

  return {
    ...est,
    leaveByISO: leaveBy.toISOString(),
    status,
  };
};


