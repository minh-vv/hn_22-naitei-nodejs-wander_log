import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query('query') query: string) {
    if (!query || query.trim().length === 0) {
      return {
        users: [],
        itineraries: [],
        locations: []
      };
    }

    return this.searchService.searchAll(query.trim());
  }
}
