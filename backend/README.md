# Dezai Backend

NestJS-based API server for the Dezai AI EdTech Platform.

## Structure

```
src/
├── modules/          # Feature modules (auth, users, programs, etc.)
├── common/           # Shared decorators, guards, interceptors, filters
├── config/           # Application configuration
├── database/         # Database connection and setup
├── jobs/             # Background jobs and scheduled tasks
└── main.ts           # Application entry point

prisma/
├── schema.prisma     # Database schema
├── migrations/       # Database migrations
└── seeders/          # Seed data scripts
```

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```
