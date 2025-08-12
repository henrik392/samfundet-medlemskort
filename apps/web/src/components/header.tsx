import Link from 'next/link';
import { ModeToggle } from './mode-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link
            className="font-bold text-xl tracking-tight transition-opacity hover:opacity-80"
            href="/"
          >
            Samfundet Bilde
          </Link>

          <nav className="hidden items-center space-x-8 md:flex">
            <Link
              className="font-medium text-sm transition-colors hover:text-primary"
              href="#features"
            >
              Features
            </Link>
            <Link
              className="font-medium text-sm transition-colors hover:text-primary"
              href="#docs"
            >
              Docs
            </Link>
            <Link
              className="font-medium text-sm transition-colors hover:text-primary"
              href="#pricing"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="hidden items-center gap-3 md:flex">
              <Link
                className="font-medium text-sm transition-colors hover:text-primary"
                href="#login"
              >
                Log in
              </Link>
              <Link
                className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
                href="#signup"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
