// services/api.ts
import axios from 'axios';
import type { CryptoData, NewsItem, MarketSignal, HistoricalData } from '../types'; // Import HistoricalData
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const symbolToId: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
};

export async function getCryptoData(symbol: string): Promise<CryptoData> {
  try {
    const coinId = symbolToId[symbol];
    if (!coinId) {
      throw new Error(`Unsupported symbol: ${symbol}`);
    }

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
      timestamp: new Date().toISOString(), // Add timestamp
    };
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw new Error('Failed to fetch crypto data. Please try again later.');
  }
}
//New historical data function.
export async function getHistoricalData(symbol: string): Promise<HistoricalData> {
    const coinId = symbolToId[symbol];
    if (!coinId) {
        throw new Error(`Unsupported symbol: ${symbol}`);
    }

    try {
        const response = await axios.get(`${COINGECKO_API}/coins/${coinId}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: 0.09375, // 135 minutes total timeline (10 data points at 15-minute intervals)
            },
        });

      const pricesRaw = response.data.prices.map(([timestamp, price]: [number, number]) => ({
        date: new Date(timestamp).toISOString(),
        price,
      }));
      let prices = pricesRaw;
      if (pricesRaw.length > 10) {
        const step = Math.floor(pricesRaw.length / 10);
        prices = pricesRaw.filter((item: { date: string; price: number }, i: number) => i % step === 0).slice(0, 10);
      }
      
      return { prices };


    } catch (error) {
        console.error('Error fetching historical data:', error);
        throw new Error('Failed to fetch historical data. Please try again.');
    }
}

export async function getNews(): Promise<NewsItem[]> {
  try {
    const response = await axios.get(`${COINGECKO_API}/search/trending`);
    const trending = response.data.coins;

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
      model: "gpt-4o",
    });

    const analysis = completion.choices[0].message.content;
    
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