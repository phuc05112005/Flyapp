import { Injectable } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { randomBytes } from 'crypto';
import { FlightSearchParams, IAirlineProvider, ProviderHoldResult, ProviderTicketResult } from './airline-provider.interface';

function randomCode(length = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(randomBytes(length), (byte) => alphabet[byte % alphabet.length]).join('');
}

@Injectable()
export class MockAirlineProvider implements IAirlineProvider {
  async searchFlights(_params: FlightSearchParams) {
    return [];
  }

  async holdSeats(_flightId: string, _passengerCount: number): Promise<ProviderHoldResult> {
    return {
      pnrCode: `PNR${randomCode()}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    };
  }

  async issueTicket(pnrCode: string, _payment: Payment): Promise<ProviderTicketResult[]> {
    return [
      {
        passengerIndex: 0,
        pnrCode,
        ticketNumber: `738${Date.now().toString().slice(-9)}`
      }
    ];
  }

  async cancelBooking(_pnrCode: string) {}
}
