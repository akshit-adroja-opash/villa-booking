'use client';import AuthForm from '@/components/AuthForm';
import { Suspense } from 'react';

export default function RegisterPage() {
 return (
   <Suspense fallback={<div className="flex-grow flex items-center justify-center min-h-screen">Loading...</div>}>
     <AuthForm initialMode="signup"/>
   </Suspense>
 );
}
