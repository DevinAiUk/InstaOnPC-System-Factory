import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Drizzle commands expect DATABASE_URL to be supplied by the shell or host.
    // Avoid importing dotenv here: Next.js type-checks this file during builds,
    // and production must not depend on an undeclared development-only loader.
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
