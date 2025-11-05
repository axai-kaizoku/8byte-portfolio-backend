import { redis } from '@/config/redis';
import { yahooFinance } from '@/config/yahoo';
import axios from 'axios';

export interface PortfolioHolding {
  id: string;
  stockSymbol: string;
  stockName: string;
  exchange: string;
  sectorName: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage: number;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  peRatio: number | null;
  latestEarnings: number | null;
}

export interface SectorSummary {
  sectorName: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  holdings: PortfolioHolding[];
}

async function getStockPrice(symbol: string): Promise<number | null> {
  const cacheKey = `price:${symbol}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return Number.parseFloat(cached);
  }

  try {
    const quote = await yahooFinance.quote(symbol);
    const price = quote.regularMarketPrice;

    if (price) {
      await redis.setex(cacheKey, 60, price.toString());
      return price;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

async function getStockFundamentals(
  symbol: string,
): Promise<{ peRatio: number | null; latestEarnings: number | null }> {
  const cacheKey = `fundamentals:${symbol}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) {
    console.log('AlphaVantage API key not found');
    return { peRatio: null, latestEarnings: null };
  }

  try {
    const cleanSymbol = symbol.replace(/\.(NS|BO)$/, '');

    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${cleanSymbol}&apikey=${apiKey}`;
    const response = await axios.get(overviewUrl);
    const data = response.data;

    const result = {
      peRatio: data.PERatio ? Number.parseFloat(data.PERatio) : null,
      latestEarnings: data.RevenueTTM ? Number.parseFloat(data.RevenueTTM) : null,
    };

    await redis.setex(cacheKey, 3600, JSON.stringify(result));
    return result;
  } catch (error) {
    console.log(`Error fetching fundamentals for ${symbol}:`, error);
    return { peRatio: null, latestEarnings: null };
  }
}

export { getStockPrice, getStockFundamentals };
