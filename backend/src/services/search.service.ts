import { prisma } from '../app';
import { Prisma } from '@prisma/client';

export interface SearchResult {
  id: string;
  date: string;
  type: 'diary' | 'trade';
  field: string;
  content: string;
  highlight: string;
  profitLossAmount: number | null;
}

export interface SearchResponse {
  list: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
}

export class SearchService {
  /**
   * Full-text search across diary and trade fields
   */
  static async search(
    userId: string,
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<SearchResponse> {
    if (!query || query.trim().length === 0) {
      return { list: [], total: 0, page, pageSize };
    }

    const searchTerm = query.trim();
    const offset = (page - 1) * pageSize;

    // Search in diary fields using raw SQL for better performance
    const diaryResults = await this.searchDiaries(userId, searchTerm);
    const tradeResults = await this.searchTrades(userId, searchTerm);

    // Combine and sort results by date descending
    const allResults = [...diaryResults, ...tradeResults].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const total = allResults.length;
    const paginatedResults = allResults.slice(offset, offset + pageSize);

    return {
      list: paginatedResults,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Search in diary fields: marketComment, reflectionGood, reflectionBad,
   * reflectionImprove, learningNote, riskNotes
   */
  private static async searchDiaries(
    userId: string,
    searchTerm: string
  ): Promise<SearchResult[]> {
    // Search diary fields
    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        OR: [
          { marketComment: { contains: searchTerm, mode: 'insensitive' } },
          { reflectionGood: { contains: searchTerm, mode: 'insensitive' } },
          { reflectionBad: { contains: searchTerm, mode: 'insensitive' } },
          { reflectionImprove: { contains: searchTerm, mode: 'insensitive' } },
          { learningNote: { contains: searchTerm, mode: 'insensitive' } },
          { riskNotes: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        date: true,
        marketComment: true,
        reflectionGood: true,
        reflectionBad: true,
        reflectionImprove: true,
        learningNote: true,
        riskNotes: true,
        profitLossAmount: true,
      },
      orderBy: { date: 'desc' },
    });

    const results: SearchResult[] = [];

    for (const diary of diaries) {
      const dateStr = diary.date.toISOString().split('T')[0];
      const profitLoss = diary.profitLossAmount
        ? Number(diary.profitLossAmount)
        : null;

      // Check each field and add matching results
      const fieldsToCheck: Array<{ field: string; value: string | null }> = [
        { field: 'marketComment', value: diary.marketComment },
        { field: 'reflectionGood', value: diary.reflectionGood },
        { field: 'reflectionBad', value: diary.reflectionBad },
        { field: 'reflectionImprove', value: diary.reflectionImprove },
        { field: 'learningNote', value: diary.learningNote },
        { field: 'riskNotes', value: diary.riskNotes },
      ];

      for (const { field, value } of fieldsToCheck) {
        if (value && value.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            id: diary.id,
            date: dateStr,
            type: 'diary',
            field,
            content: this.extractSnippet(value, searchTerm),
            highlight: this.highlightKeyword(
              this.extractSnippet(value, searchTerm),
              searchTerm
            ),
            profitLossAmount: profitLoss,
          });
        }
      }
    }

    return results;
  }

  /**
   * Search in trade reason field
   */
  private static async searchTrades(
    userId: string,
    searchTerm: string
  ): Promise<SearchResult[]> {
    // Get trades with matching reason through diary relation
    const trades = await prisma.trade.findMany({
      where: {
        diary: { userId },
        reason: { contains: searchTerm, mode: 'insensitive' },
      },
      select: {
        id: true,
        reason: true,
        diary: {
          select: {
            date: true,
            profitLossAmount: true,
          },
        },
      },
      orderBy: { diary: { date: 'desc' } },
    });

    return trades.map((trade) => {
      const dateStr = trade.diary.date.toISOString().split('T')[0];
      const profitLoss = trade.diary.profitLossAmount
        ? Number(trade.diary.profitLossAmount)
        : null;
      const reason = trade.reason || '';

      return {
        id: trade.id,
        date: dateStr,
        type: 'trade' as const,
        field: 'reason',
        content: this.extractSnippet(reason, searchTerm),
        highlight: this.highlightKeyword(
          this.extractSnippet(reason, searchTerm),
          searchTerm
        ),
        profitLossAmount: profitLoss,
      };
    });
  }

  /**
   * Extract a snippet of text around the matched keyword
   * Returns 50 characters before and after the match
   */
  private static extractSnippet(
    text: string,
    keyword: string,
    contextLength: number = 50
  ): string {
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerText.indexOf(lowerKeyword);

    if (index === -1) {
      // If not found, return the beginning of the text
      return text.length > contextLength * 2 + keyword.length
        ? text.substring(0, contextLength * 2 + keyword.length) + '...'
        : text;
    }

    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + keyword.length + contextLength);

    let snippet = text.substring(start, end);

    // Add ellipsis if truncated
    if (start > 0) {
      snippet = '...' + snippet;
    }
    if (end < text.length) {
      snippet = snippet + '...';
    }

    return snippet;
  }

  /**
   * Highlight the keyword in the text with HTML tags
   */
  private static highlightKeyword(text: string, keyword: string): string {
    const regex = new RegExp(`(${this.escapeRegExp(keyword)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Escape special regex characters
   */
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
