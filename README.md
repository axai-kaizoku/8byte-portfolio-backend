# Portfolio Dashboard - Backend

RESTful API backend for the Portfolio Dashboard application, built with Node.js, Express, TypeScript, PostgreSQL, and Redis.

# Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Language: TypeScript
- Database: PostgreSQL with Drizzle ORM
- Cache: Redis 
- APIs: yahoo-finance2, AlphaVantage

# Installation

- clone the repo 
- copy env variables from .env.example to .env
- run migration `npm run db:generate`
- push schema to database `npm run db:push`
- seed database with `npm run db:seed`
- run `npm run dev` to start the server