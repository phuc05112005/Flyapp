import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

export const number = new Intl.NumberFormat('vi-VN');

export function formatPrice(value: number) {
  return number.format(value);
}

export function formatDate(value: string | Date) {
  return format(new Date(value), 'dd/MM/yyyy', { locale: vi });
}

export function formatTime(value: string | Date) {
  return format(new Date(value), 'HH:mm', { locale: vi });
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${rest}m`;
}

export function formatCountdown(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
