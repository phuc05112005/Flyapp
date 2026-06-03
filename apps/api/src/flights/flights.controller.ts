import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { FlightsService } from './flights.service';

@ApiTags('flights')
@Controller()
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('flights/search')
  search(@Query() query: SearchFlightsDto) {
    return this.flightsService.search(query);
  }

  @Get('flights/:id')
  detail(@Param('id') id: string) {
    return this.flightsService.findById(id);
  }

  @Get('flights/:id/seats')
  seats(@Param('id') id: string) {
    return this.flightsService.getSeats(id);
  }

  @Get('airports')
  airports() {
    return this.flightsService.listAirports();
  }

  @Get('airlines')
  airlines() {
    return this.flightsService.listAirlines();
  }
}
