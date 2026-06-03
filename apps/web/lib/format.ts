import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

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
