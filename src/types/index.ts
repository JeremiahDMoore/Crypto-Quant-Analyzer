// types.ts
export interface CryptoData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  timestamp: string; // Add timestamp
}

export interface NewsItem {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  summary: string;
}

export interface MarketSignal {
  symbol: string;
  shortTermSignal: 'buy' | 'sell' | 'hold';
  longTermSignal: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  timestamp: string;
}

//Historical Data
export interface HistoricalData {
    prices: { date: string; price: number }[];
}

export interface TechnicalIndicators {
  sma: number[];
}
