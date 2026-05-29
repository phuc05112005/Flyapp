function getApiUrl() {
  if (typeof window === 'undefined') {
    return process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  }

  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
}

export type FlightResult = {
  id: string;
  flightNumber: string;
  airline: { code: string; name: string; logo?: string };
  route: {
    departure: { code: string; city: string; name: string };
    arrival: { code: string; city: string; name: string };
  };
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  aircraft?: string;
  classType: string;
  availableSeats: number;
  baggageKg: number;
  basePriceVND: number;
  markupVND: number;
  displayPriceVND: number;
};

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Không thể tải dữ liệu từ hệ thống.');
  return response.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? 'Yêu cầu không thành công.');
  }
  return response.json();
}
