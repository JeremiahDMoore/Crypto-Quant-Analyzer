import axios from 'axios';
import type { CryptoData, NewsItem, MarketSignal, HistoricalData, TechnicalIndicators } from '../types';
import Groq from 'groq-sdk';
const groqClient = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });

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
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw new Error('Failed to fetch crypto data. Please try again later.');
  }
}

export async function getHistoricalData(symbol: string, days: number = 30): Promise<HistoricalData> {
  const coinId = symbolToId[symbol];
  if (!coinId) {
    throw new Error(`Unsupported symbol: ${symbol}`);
  }

  try {
    const response = await axios.get(`${COINGECKO_API}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
      },
    });

    const prices = response.data.prices.map(([timestamp, price]: [number, number]) => ({
      date: new Date(timestamp).toISOString(),
      price,
    }));
    
    return { prices };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw new Error('Failed to fetch historical data. Please try again.');
  }
}

export function calculateSMA(prices: number[], windowSize: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < windowSize - 1) {
      sma.push(NaN);
    } else {
      const windowPrices = prices.slice(i - windowSize + 1, i + 1);
      const avg = windowPrices.reduce((sum, price) => sum + price, 0) / windowSize;
      sma.push(avg);
    }
  }
  return sma;
}

export async function getTechnicalIndicators(symbol: string, days: number = 30, windowSize: number = 7): Promise<TechnicalIndicators> {
  const historicalData = await getHistoricalData(symbol, days);
  const prices = historicalData.prices.map(item => item.price);
  const sma = calculateSMA(prices, windowSize);
  return {
    sma,
  };
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
      summary: `${coin.item.name} is trending with market cap rank ${coin.item.market_cap_rank}. Price change in BTC: ${coin.item.price_btc.toFixed(8)}`
    }));
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw new Error('Failed to fetch market data. Please try again later.');
  }
}

export async function getMacroNews(): Promise<NewsItem[]> {
  try {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY;
    if (!apiKey) {
      throw new Error('News API key is not configured. Please add VITE_NEWS_API_KEY to your .env file.');
    }
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'business',
        country: 'us',
        apiKey,
        pageSize: 5
      }
    });
    return response.data.articles.slice(0, 5).map((article: any) => ({
      title: article.title,
      url: article.url,
      publishedAt: new Date(article.publishedAt).toISOString(),
      source: article.source.name,
      summary: article.description || ""
    }));
  } catch (error) {
    console.error('Error fetching macro news:', error);
    throw new Error('Failed to fetch macro news. Please try again later.');
  }
}

// New function: Get news based on crypto and economic keywords using /everything endpoint
export async function getKeywordNews(): Promise<NewsItem[]> {
  try {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY;
    if (!apiKey) {
      throw new Error('News API key is not configured. Please add VITE_NEWS_API_KEY to your .env file.');
    }
    // Query string with keywords: economics, federal reserve, bitcoin, solana, ethereum, cryptocurrency, microstrategy
    const query = 'economics OR "federal reserve" OR bitcoin OR solana OR ethereum OR cryptocurrency OR microstrategy';
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        sortBy: 'publishedAt',
        pageSize: 5,
        apiKey,
      }
    });
    return response.data.articles.slice(0, 5).map((article: any) => ({
      title: article.title,
      url: article.url,
      publishedAt: new Date(article.publishedAt).toISOString(),
      source: article.source.name,
      summary: article.description || ""
    }));
  } catch (error) {
    console.error('Error fetching keyword news:', error);
    throw new Error('Failed to fetch keyword news. Please try again later.');
  }
}

// New function: Get top 5 Business news using /top-headlines endpoint
export async function getBusinessNews(): Promise<NewsItem[]> {
  try {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY;
    if (!apiKey) {
      throw new Error('News API key is not configured. Please add VITE_NEWS_API_KEY to your .env file.');
    }
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'business',
        country: 'us',
        pageSize: 5,
        apiKey,
      }
    });
    return response.data.articles.slice(0, 5).map((article: any) => ({
      title: article.title,
      url: article.url,
      publishedAt: new Date(article.publishedAt).toISOString(),
      source: article.source.name,
      summary: article.description || ""
    }));
  } catch (error) {
    console.error('Error fetching business news:', error);
    throw new Error('Failed to fetch business news. Please try again later.');
  }
}

// New function: Get top 5 TechCrunch news using /top-headlines endpoint with TechCrunch as source
export async function getTechCrunchNews(): Promise<NewsItem[]> {
  try {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY;
    if (!apiKey) {
      throw new Error('News API key is not configured. Please add VITE_NEWS_API_KEY to your .env file.');
    }
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        sources: 'techcrunch',
        pageSize: 5,
        apiKey,
      }
    });
    return response.data.articles.slice(0, 5).map((article: any) => ({
      title: article.title,
      url: article.url,
      publishedAt: new Date(article.publishedAt).toISOString(),
      source: article.source.name,
      summary: article.description || ""
    }));
  } catch (error) {
    console.error('Error fetching TechCrunch news:', error);
    throw new Error('Failed to fetch TechCrunch news. Please try again later.');
  }
}

// New function: Get top 5 Wall Street news using /top-headlines endpoint with The Wall Street Journal as source
export async function getWallStreetNews(): Promise<NewsItem[]> {
  try {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY;
    if (!apiKey) {
      throw new Error('News API key is not configured. Please add VITE_NEWS_API_KEY to your .env file.');
    }
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        sources: 'the-wall-street-journal',
        pageSize: 5,
        apiKey,
      }
    });
    return response.data.articles.slice(0, 5).map((article: any) => ({
      title: article.title,
      url: article.url,
      publishedAt: new Date(article.publishedAt).toISOString(),
      source: article.source.name,
      summary: article.description || ""
    }));
  } catch (error) {
    console.error('Error fetching Wall Street news:', error);
    throw new Error('Failed to fetch Wall Street news. Please try again later.');
  }
}

// Optional: Combine all news sources into one function if desired
export async function getAllNews(): Promise<NewsItem[]> {
  const coingeckoNews = await getNews();
  const keywordNews = await getKeywordNews();
  const businessNews = await getBusinessNews();
  const techCrunchNews = await getTechCrunchNews();
  const wallStreetNews = await getWallStreetNews();
  const allNews = [...coingeckoNews, ...keywordNews, ...businessNews, ...techCrunchNews, ...wallStreetNews];
  allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return allNews;
}

export async function analyzeMarket(
  cryptoData: CryptoData,
  news: NewsItem[],
  macroNews: NewsItem[],
  technicalIndicators: TechnicalIndicators
): Promise<MarketSignal> {
  try {
    const prompt = `
Analyze the following market data for ${cryptoData.symbol}:
    
• Market Data:
   - Current Price: $${cryptoData.price}
   - 24h Change: ${cryptoData.change24h}%
   - 24h Volume: $${cryptoData.volume24h}
   - Market Cap: $${cryptoData.marketCap}
    
• Technical Indicators (Simple Moving Average):
   - Recent SMA Values: ${technicalIndicators.sma.slice(-5).join(', ')}
    
• Crypto News:
${news.map(item => `   - ${item.title}: ${item.summary}`).join('\n')}
    
• Macro Economic News:
${macroNews.map(item => `   - ${item.title}: ${item.summary}`).join('\n')}
    
IMPORTANT: DO NOT USE MARKDOWN Use expert trading instinct, technical analysis, market trends, and all data provided to provide a concise explanation of your analysis and decision. Use bullet points and line breaks to output everything in a clear and organized manner.
    
Please provide:
• Short-term trading signal (buy/sell/hold)
• Long-term trading signal (buy/sell/hold)
• Confidence level (0-100)
• A concise explanation of your analysis and decision.
    `;

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-r1-distill-qwen-32b",
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95,
      stream: true,
      stop: null
    });

    let analysis = '';
    for await (const chunk of chatCompletion) {
      analysis += chunk.choices[0]?.delta?.content || '';
    }
    
    const signals: MarketSignal = {
      symbol: cryptoData.symbol,
      shortTermSignal: 'hold',
      longTermSignal: 'hold',
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
