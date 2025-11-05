import db, { pool } from './index';
import * as schema from './schema';

async function seed() {
  console.log('Seeding database...');

  const [user] = await db
    .insert(schema.users)
    .values({
      name: 'Demo User',
      email: 'demo@portfolio.com',
      createdAt: new Date(),
    })
    .returning();
  console.log('Created user:', user);

  const sectorData = [
    { name: 'Technology', description: 'IT and Software companies' },
    { name: 'Financials', description: 'Banks and Financial Services' },
    { name: 'Energy', description: 'Oil, Gas and Energy companies' },
    { name: 'Healthcare', description: 'Pharmaceutical and Healthcare' },
    { name: 'Consumer', description: 'Consumer goods and services' },
  ];

  const insertedSectors = await db.insert(schema.sectors).values(sectorData).returning();
  console.log('Created sectors:', insertedSectors.length);

  const sectorMap = insertedSectors.reduce(
    (acc, sector) => {
      acc[sector.name] = sector.id;
      return acc;
    },
    {} as Record<string, string>,
  );

  const stockData = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE', sectorId: sectorMap['Energy'] },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', sectorId: sectorMap['Technology'] },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', exchange: 'NSE', sectorId: sectorMap['Financials'] },
    { symbol: 'INFY.NS', name: 'Infosys', exchange: 'NSE', sectorId: sectorMap['Technology'] },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', exchange: 'NSE', sectorId: sectorMap['Financials'] },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', exchange: 'NSE', sectorId: sectorMap['Consumer'] },
    { symbol: 'ITC.NS', name: 'ITC Limited', exchange: 'NSE', sectorId: sectorMap['Consumer'] },
    { symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', sectorId: sectorMap['Financials'] },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', exchange: 'NSE', sectorId: sectorMap['Technology'] },
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', exchange: 'NSE', sectorId: sectorMap['Healthcare'] },
  ];

  const insertedStocks = await db.insert(schema.stocks).values(stockData).returning();
  console.log('Created stocks:', insertedStocks.length);

  const holdingsData = [
    {
      userId: user.id,
      stockId: insertedStocks[0].id,
      purchasePrice: '2400.50',
      quantity: 10,
      purchaseDate: new Date('2024-01-15'),
    },
    {
      userId: user.id,
      stockId: insertedStocks[1].id,
      purchasePrice: '3500.00',
      quantity: 15,
      purchaseDate: new Date('2024-02-10'),
    },
    {
      userId: user.id,
      stockId: insertedStocks[2].id,
      purchasePrice: '1650.75',
      quantity: 20,
      purchaseDate: new Date('2024-01-20'),
    },
    {
      userId: user.id,
      stockId: insertedStocks[3].id,
      purchasePrice: '1450.00',
      quantity: 25,
      purchaseDate: new Date('2024-03-05'),
    },
    {
      userId: user.id,
      stockId: insertedStocks[4].id,
      purchasePrice: '950.25',
      quantity: 30,
      purchaseDate: new Date('2024-02-15'),
    },
    {
      userId: user.id,
      stockId: insertedStocks[5].id,
      purchasePrice: '2300.00',
      quantity: 12,
      purchaseDate: new Date('2024-01-25'),
    },
    {
      userId: user.id,
      stockId: insertedStocks[6].id,
      purchasePrice: '420.50',
      quantity: 50,
      purchaseDate: new Date('2024-03-01'),
    },
    {
      userId: user.id,
      stockId: insertedStocks[7].id,
      purchasePrice: '580.00',
      quantity: 40,
      purchaseDate: new Date('2024-02-20'),
    },
  ];

  const insertedHoldings = await db.insert(schema.holdings).values(holdingsData).returning();
  console.log('Created holdings:', insertedHoldings.length);

  console.log('Seeding completed successfully!');
  await pool.end();
}

seed();
