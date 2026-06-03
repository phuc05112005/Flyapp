import { ClassType, Payment } from '@prisma/client';

export type FlightSearchParams = {
  from: string;
  to: string;
  date: string;
  adults: number;
  children: number;
  infants: number;
  classType: ClassType;
  airline?: string;
};

export type ProviderHoldResult = {
  pnrCode: string;
  expiresAt: Date;
};

export type ProviderTicketResult = {
  passengerIndex: number;
  ticketNumber: string;
  pnrCode: string;
};

export interface IAirlineProvider {
  searchFlights(params: FlightSearchParams): Promise<unknown[]>;
  holdSeats(flightId: string, passengerCount: number): Promise<ProviderHoldResult>;
  issueTicket(pnrCode: string, payment: Payment): Promise<ProviderTicketResult[]>;
  cancelBooking(pnrCode: string): Promise<void>;
}
