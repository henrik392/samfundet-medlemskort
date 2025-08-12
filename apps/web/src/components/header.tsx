import Link from 'next/link';
import { ModeToggle } from './mode-toggle';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            className="font-semibold text-xl transition-colors hover:text-muted-foreground"
            href="/"
          >
            Samfundet Bilde
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
