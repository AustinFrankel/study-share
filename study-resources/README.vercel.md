This project is a monorepo root with the Next.js app in ./study-resources.

Vercel configuration is in the repository root. Build steps:
- installCommand: npm --prefix study-resources install --no-audit --no-fund
- buildCommand: npm run vercel-build
