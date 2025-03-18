import axios from 'axios';
import type { CryptoData, NewsItem, MarketSignal } from '../types';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Use CoinGecko's public API endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const symbolToId: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana', // Added SOL mapping
};

export async function getCryptoData(symbol: string): Promise<CryptoData> {
  try {
    const coinId = symbolToId[symbol];
    if (!coinId) {
      throw new Error(`Unsupported symbol: ${symbol}`);
    }

    // Use the coins/markets endpoint for more comprehensive data
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: coinId,
      }
    });
    
    const data = response.data[0];
    if (!data) {
      throw new Error(`No data found for ${coinId}.`);
    }
    
    return {
      symbol,
      price: data.current_price ?? 0,
      change24h: data.price_change_percentage_24h ?? 0,
      volume24h: data.total_volume ?? 0,
      marketCap: data.market_cap ?? 0,
    };
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw new Error('Failed to fetch crypto data. Please try again later.');
  }
}

export async function getNews(): Promise<NewsItem[]> {
  try {
    // Use the trending endpoint which doesn't require authentication
    const response = await axios.get(`${COINGECKO_API}/search/trending`);
    const trending = response.data.coins;

    // Create news-like items from trending data
    return trending.slice(0, 5).map((coin: any) => ({
      title: `${coin.item.name} (${coin.item.symbol.toUpperCase()}) is trending`,
      url: `https://www.coingecko.com/en/coins/${coin.item.id}`,
      publishedAt: new Date().toISOString(),
      source: 'CoinGecko Trends',
      summary: `${coin.item.name} is currently trending with a market cap rank of ${coin.item.market_cap_rank}. Price change in BTC: ${coin.item.price_btc.toFixed(8)}`
    }));
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw new Error('Failed to fetch market data. Please try again later.');
  }
}

export async function analyzeMarket(
  cryptoData: CryptoData,
  news: NewsItem[]
): Promise<MarketSignal> {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    const prompt = `
      Analyze the following crypto market data and trends for the selected cryptocurrency (${cryptoData.symbol}):
      
      Market Data:
      - Current Price: $${cryptoData.price}
      - 24h Change: ${cryptoData.change24h}%
      - 24h Volume: $${cryptoData.volume24h}
      - Market Cap: $${cryptoData.marketCap}
      
      Market Trends:
      ${news.map(item => `- ${item.title}\n  ${item.summary}`).join('\n')}
      
      Based on this information, provide:
      1. A short-term trading signal (buy/sell/hold) for ${cryptoData.symbol}
      2. A long-term trading signal (buy/sell/hold)
      3. A confidence level (0-100)
      4. A brief explanation of your decision
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const analysis = completion.choices[0].message.content;
    
    // Parse the AI response (simplified for example)
    const signals = {
      symbol: cryptoData.symbol,
      shortTermSignal: 'hold' as const,
      longTermSignal: 'hold' as const,
      confidence: 70,
      reasoning: analysis || "Analysis not available",
      timestamp: new Date().toISOString()
    };

    return signals;
  } catch (error) {
    console.error('Error analyzing market:', error);
    throw new Error('Failed to analyze market data. Please try again later.');
  }
}