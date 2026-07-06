'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PropertiesPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/farms');
  }, [router]);

  return null;
}
