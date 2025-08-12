import Link from 'next/link';
import { GitHubButton } from './github-button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link
            className="font-bold text-xl tracking-tight transition-opacity hover:opacity-80"
            href="/"
          >
            Samfundet Bilde
          </Link>

          <div className="flex items-center gap-4">
            <GitHubButton />
          </div>
        </div>
      </div>
    </header>
  );
}
