import { Moon, Sun } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function EdadNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="#hero"
          className="flex items-center gap-2 text-xl font-black text-white"
        >
          e<span className="text-amber-500">Dad</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/60 md:flex">
            <a href="#demo" className="transition-colors hover:text-white">
              How it works
            </a>
            <a href="#offer" className="transition-colors hover:text-white">
              What you get
            </a>
            <a href="#faq" className="transition-colors hover:text-white">
              FAQ
            </a>
          </nav>

          <Button
            size="icon"
            variant="ghost"
            className="size-9 text-white/60 hover:text-white"
          >
            <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>

          <Button size="sm" className="h-9 px-5 font-semibold" asChild>
            <a href="#build-your-dad">Meet Dad</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

