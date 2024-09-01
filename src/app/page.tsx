'use client';

import { AnkiClone } from '@/components/anki-clone';

export default function Page() {
  return (
<main className="flex h-screen flex-col items-center justify-center bg-white dark:bg-customDark transition-colors duration-200">
  <section className="w-full max-w-2xl">
      <AnkiClone />
  </section>
</main>
  );
}
