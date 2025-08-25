import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('query') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    if (!query || query.trim().length === 0) {
      return {
        users: { data: [], total: 0, page: 1, totalPages: 0 },
        itineraries: { data: [], total: 0, page: 1, totalPages: 0 },
        locations: { data: [], total: 0, page: 1, totalPages: 0 }
      };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit) || 10), 50);

    return this.searchService.searchAll(query.trim(), pageNum, limitNum);
  }
}
