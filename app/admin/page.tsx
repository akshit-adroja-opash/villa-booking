'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#fdfbf7]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00a877] border-t-transparent"></div>
    </div>
  );
}