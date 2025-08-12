'use client';

import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Repository configuration
const REPO_OWNER = 'henrikkvamme';
const REPO_NAME = 'samfundet-medlemskort';
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

export function GitHubButton() {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
          {
            next: { revalidate: 3600 }, // Cache for 1 hour
            headers: {
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStars(data.stargazers_count);
        }
      } catch {
        // Gracefully degrade to no star count
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
  }, []);

  const formatStars = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Button
      asChild
      className="gap-2 transition-colors hover:bg-muted/50"
      size="sm"
      variant="outline"
    >
      <a
        className="flex items-center gap-2"
        href={REPO_URL}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-current">
          <svg
            aria-hidden="true"
            className="h-3 w-3 fill-current"
            viewBox="0 0 16 16"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </div>
        <span className="hidden font-medium sm:inline-block">GitHub</span>
        {!loading && (
          <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
            <Star className="h-3 w-3 fill-current" />
            <span>{stars !== null ? formatStars(stars) : '—'}</span>
          </div>
        )}
      </a>
    </Button>
  );
}
