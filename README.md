# arXiv Paper Finder

A specialized Next.js web application for searching, filtering, and downloading academic papers from arXiv with intelligent relevance scoring.


## Features

- **Advanced Search Options**: Search by title, author, abstract, or across all fields
- **Category Filtering**: Filter papers by specific academic categories
- **Topic Presets**: Quickly search for papers on specialized topics with intelligent relevance scoring
- **Relevance Scoring**: Papers are automatically scored based on their relevance to your search terms
- **PDF Download**: Direct links to download PDF versions of papers
- **Modern UI**: Clean, responsive interface with light/dark mode support

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technologies Used

- Next.js 15
- React 19
- Tailwind CSS 4
- arXiv API
- TypeScript

## Project Structure

- `app/`: Next.js app directory containing pages and API routes
- `components/`: React components for search form, results list, and paper cards
- `types/`: TypeScript type definitions
- `public/`: Static assets

## How It Works

The application connects to the arXiv API to fetch academic papers based on user searches. For topic presets, it uses intelligent relevance scoring algorithms to rank papers by their relevance to specific research areas.

## Notes

This project is for educational purposes. Please respect arXiv's API usage policies and rate limits.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
