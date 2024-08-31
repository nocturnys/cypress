'use client';

import { AnkiClone } from '@/components/anki-clone';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <section>
          <AnkiClone />
      </section>
    </main>
  );
}
