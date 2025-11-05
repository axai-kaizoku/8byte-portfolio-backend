import db from '@/db';
import { holdings } from '@/db/schema';
import {
  type PortfolioHolding,
  type SectorSummary,
  getStockFundamentals,
  getStockPrice,
} from '@/services/portfolio.service';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const getPortflio: RequestHandler = async (_req, res) => {
  try {
    const userId = '3b8da38a1395fc054edc7309ed7b89bb';

    const userHoldings = await db.query.holdings.findMany({
      where: eq(holdings.userId, userId),
      with: {
        stock: {
          with: {
            sector: true,
          },
        },
      },
    });

    if (!userHoldings.length) {
      res.json({ sectors: [], totalInvestment: 0, totalPresentValue: 0, totalGainLoss: 0 });
      return;
    }

    const pricePromises = userHoldings.map((h) => getStockPrice(h.stock.symbol));
    const fundamentalPromises = userHoldings.map((h) => getStockFundamentals(h.stock.symbol));

    const [prices, fundamentals] = await Promise.all([Promise.all(pricePromises), Promise.all(fundamentalPromises)]);

    let totalInvestment = 0;
    const holdingsData: PortfolioHolding[] = userHoldings.map((holding, index) => {
      const purchasePrice = Number.parseFloat(holding.purchasePrice);
      const investment = purchasePrice * holding.quantity;
      totalInvestment += investment;

      const cmp = prices[index] || purchasePrice;
      const presentValue = cmp * holding.quantity;
      const gainLoss = presentValue - investment;
      const gainLossPercentage = (gainLoss / investment) * 100;

      return {
        id: holding.id,
        stockSymbol: holding.stock.symbol,
        stockName: holding.stock.name,
        exchange: holding.stock.exchange,
        sectorName: holding.stock.sector?.name || 'Unknown',
        purchasePrice,
        quantity: holding.quantity,
        investment,
        portfolioPercentage: 0,
        cmp,
        presentValue,
        gainLoss,
        gainLossPercentage,
        peRatio: fundamentals[index].peRatio,
        latestEarnings: fundamentals[index].latestEarnings,
      };
    });

    holdingsData.forEach((h) => {
      h.portfolioPercentage = Number.parseFloat(((h.investment / totalInvestment) * 100).toFixed(2));
    });

    const sectorMap = new Map<string, SectorSummary>();
    holdingsData.forEach((holding) => {
      if (!sectorMap.has(holding.sectorName)) {
        sectorMap.set(holding.sectorName, {
          sectorName: holding.sectorName,
          totalInvestment: 0,
          holdings: [],
        });
      }
      const sector = sectorMap.get(holding.sectorName)!;
      sector.holdings.push(holding);
      sector.totalInvestment += holding.investment;
    });

    const sectors: SectorSummary[] = Array.from(sectorMap.values()).map((sector) => ({
      ...sector,
    }));

    const totalPresentValue = holdingsData.reduce((sum, h) => sum + h.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;

    res.json({
      sectors,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercentage: (totalGainLoss / totalInvestment) * 100,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
};

export default { getPortflio };
