import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Drizzle commands expect DATABASE_URL to be supplied by the shell or host.
    // Avoid importing dotenv here: Next.js type-checks this file during builds,
    // and production must not depend on an undeclared development-only loader.
    // Schema changes need a direct connection; normal application traffic uses
    // the pooled DATABASE_URL through @neondatabase/serverless.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
