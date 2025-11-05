import { relations } from 'drizzle-orm';
import { decimal, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

const commonIdSchema = (columnName: string) => uuid(columnName).defaultRandom().primaryKey();

export const users = pgTable('users', {
  id: commonIdSchema('id'),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sectors = pgTable('sectors', {
  id: commonIdSchema('id'),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
});

export const stocks = pgTable('stocks', {
  id: commonIdSchema('id'),
  symbol: varchar('symbol', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  exchange: varchar('exchange', { length: 10 }).notNull(), // NSE/BSE
  sectorId: text('sector_id').references(() => sectors.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const holdings = pgTable('holdings', {
  id: commonIdSchema('id'),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  stockId: text('stock_id')
    .references(() => stocks.id)
    .notNull(),
  purchasePrice: decimal('purchase_price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  purchaseDate: timestamp('purchase_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const stockPrices = pgTable('stock_prices', {
  id: commonIdSchema('id'),
  stockId: text('stock_id')
    .references(() => stocks.id)
    .notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  peRatio: decimal('pe_ratio', { precision: 10, scale: 2 }),
  latestEarnings: decimal('latest_earnings', { precision: 15, scale: 2 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  holdings: many(holdings),
}));

export const sectorsRelations = relations(sectors, ({ many }) => ({
  stocks: many(stocks),
}));

export const stocksRelations = relations(stocks, ({ one, many }) => ({
  sector: one(sectors, {
    fields: [stocks.sectorId],
    references: [sectors.id],
  }),
  holdings: many(holdings),
  prices: many(stockPrices),
}));

export const holdingsRelations = relations(holdings, ({ one }) => ({
  user: one(users, {
    fields: [holdings.userId],
    references: [users.id],
  }),
  stock: one(stocks, {
    fields: [holdings.stockId],
    references: [stocks.id],
  }),
}));

export const stockPricesRelations = relations(stockPrices, ({ one }) => ({
  stock: one(stocks, {
    fields: [stockPrices.stockId],
    references: [stocks.id],
  }),
}));
