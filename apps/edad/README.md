# eDad - The Dad You Never Had

An AI companion app that creates a personalized father figure for supportive conversations, advice, and dad jokes.

## Features

- **Personalized AI Dad**: Choose from 8 different dad personality types
- **Custom Nickname**: Your AI dad will address you however you prefer
- **Image Upload**: Optionally give your AI dad a face
- **ElizaOS Integration**: Powered by ElizaOS Cloud for intelligent conversations

## Dad Personality Types

| Vibe | Description |
|------|-------------|
| 🤗 Supportive | Always in your corner, celebrates your wins |
| 🧙 Wise | Life advice, deep wisdom, philosophical |
| 😄 Funny | Dad jokes on demand, playful banter |
| 📏 Strict | Tough love, keeps you accountable |
| 😎 Chill | Laid back, no judgment, easy going |
| 🎯 Mentor | Career guidance, goal-oriented coaching |
| 📖 Storyteller | Shares life experiences, lessons from the past |
| 🔧 Handy | Practical tips, DIY advice, problem solver |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Animations**: Motion (Framer Motion)
- **Image Storage**: Vercel Blob (production) / Local storage (development)
- **AI Backend**: ElizaOS Cloud

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:4001`.

### Environment Variables

Create a `.env.local` file:

```env
# ElizaOS Cloud Configuration
NEXT_PUBLIC_ELIZA_CLOUD_URL=http://localhost:3000
ELIZA_CLOUD_API_KEY=your-api-key-here

# Vercel Blob (optional - for production image storage)
BLOB_READ_WRITE_TOKEN=your-blob-token
```

## Project Structure

```
apps/edad/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── create-dad/    # Character creation
│   │   └── upload-images/ # Image upload
│   ├── connecting/        # Transition page
│   ├── globals.css        # Global styles (amber theme)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── edad/              # App-specific components
│   │   ├── build-your-dad-section.tsx
│   │   ├── footer.tsx
│   │   ├── hero.tsx
│   │   └── navbar.tsx
│   ├── contexts/          # React contexts
│   └── ui/                # Reusable UI components
├── config/                # Site configuration
├── lib/                   # Utilities
└── styles/                # Additional styles
```

## Theme

The app uses a warm amber/brown color palette:
- Primary: Amber (#f59e0b)
- Background: Warm dark brown (#0c0a09)
- Accents: Orange and gold tones

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Private - All rights reserved.
