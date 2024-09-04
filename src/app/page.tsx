'use client'

import { AnkiClone } from '@/components/cypress'
import Component from '@/components/globe'

export default function Page() {
  return (
    <main className="relative flex h-screen flex-col items-center justify-center bg-white dark:bg-customDark transition-colors duration-200 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Component />
      </div>
      <div className="relative z-90 w-full h-full">
        <AnkiClone />
      </div>
    </main>
  )
}
