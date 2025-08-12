import Image from 'next/image';
import Link from 'next/link';
import { GitHubButton } from './github-button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            href="/"
          >
            <Image
              alt="Samfundet logo"
              className="object-contain"
              height={30}
              src="/images/logo_samf.png"
              width={30}
            />
            <span className="font-bold text-xl tracking-tight">Medlemskort</span>
          </Link>

          <div className="flex items-center gap-4">
            <GitHubButton />
          </div>
        </div>
      </div>
    </header>
  );
}
