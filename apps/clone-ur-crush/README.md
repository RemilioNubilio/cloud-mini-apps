# CloneUrCrush - Landing Page

A high-conversion landing page for CloneUrCrush, an AI girlfriend platform that allows users to create AI clones of their crushes. Built with Next.js, Tailwind CSS, and shadcn/ui.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-blue)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## 🚀 Quick Start

1. **Install dependencies:**

```bash
npm install
```

2. **Start the development server:**

```bash
npm run dev
```

3. **Open [http://localhost:3000](http://localhost:3000)** to view the landing page

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Main landing page
│   └── globals.css        # Global styles
├── components/
│   ├── cloneurcrush/      # Custom landing page components
│   │   ├── hero.tsx       # Hero section with video demo
│   │   ├── emotional-hook.tsx  # Mood cards gallery
│   │   ├── social-proof.tsx    # Customer reviews
│   │   ├── demo-flow.tsx       # How it works section
│   │   ├── comparison.tsx      # Feature comparison
│   │   ├── offer-stack.tsx     # Pricing tiers
│   │   ├── faq.tsx             # FAQ section
│   │   └── cta-section.tsx     # Call to action
│   └── ui/                # Reusable UI components (shadcn/ui)
├── public/
│   ├── images/            # Static images (mood cards, avatars, etc.)
│   └── videos/            # Demo videos
└── IMAGE-GENERATION-PROMPTS.md  # AI image generation prompts
```

## ✨ Features

- 🎨 **Modern Design**: Built with shadcn/ui and Tailwind CSS
- 📱 **Fully Responsive**: Optimized for all devices
- ⚡ **Performance Optimized**: Fast loading with Next.js 15
- 🌗 **Dark Mode**: Sleek dark theme throughout
- 🎥 **Video Integration**: Interactive demo videos in hero and gallery sections
- 🖼️ **Mood Cards Gallery**: 6 unique AI girlfriend aesthetic themes
- 💬 **Social Proof**: Customer reviews and testimonials
- 🎯 **Conversion Optimized**: Strategic CTAs and persuasive copywriting

## 🎨 Customization

### Adding New Mood Cards

Edit `components/cloneurcrush/emotional-hook.tsx` and add to the `MOOD_CARDS` array:

```typescript
{
  title: "Your Mood Name",
  description: "Your description here",
  image: "/images/mood-your-name.png",
}
```

Then generate the image using prompts from `IMAGE-GENERATION-PROMPTS.md`.

### Updating Copy

All text content is directly in the component files under `components/cloneurcrush/`. Edit the JSX to update copy.

### Styling

- Global styles: `app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Color scheme uses pink (`#EC4899`) and purple (`#A855F7`) as primary colors

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Animations**: CSS transitions and transforms

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

This project is optimized for [Vercel](https://vercel.com) deployment:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy automatically with zero configuration

### Environment Variables

No environment variables are currently required for the landing page.

## 📝 Image Assets

All images should be placed in `public/images/`:

- Hero background: `hero-bg.png`
- Mood cards: `mood-*.png` (6 cards)
- Demo previews: `demo-preview-1.png`, `demo-preview-2.png`
- Chat avatar: `chat-ava.png`

See `IMAGE-GENERATION-PROMPTS.md` for AI image generation prompts.

## 🎥 Video Assets

Place demo videos in `public/videos/`:

- `video-1.mp4` - Main hero demo
- `video-2.mp4` - Mood showcase
- `video-3.mp4` - Additional demos

## 📄 License

MIT License - feel free to use this for your own projects.

---

Built with 💖 using [Launch UI](https://launchuicomponents.com)
