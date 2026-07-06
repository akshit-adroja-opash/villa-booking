'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function PropertyDetailPageRedirect() {
  const router = useRouter();
  const { id } = useParams() || {};

  useEffect(() => {
    if (id) {
      router.replace(`/farms/${id}`);
    } else {
      router.replace('/farms');
    }
  }, [id, router]);

  return null;
}
