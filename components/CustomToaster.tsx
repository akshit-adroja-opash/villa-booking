'use client';

import { Toaster, ToastBar } from 'react-hot-toast';

export default function CustomToaster() {
  return (
    <Toaster position="top-right" toastOptions={{ style: { marginTop: '60px' } }}>
      {(t) => (
        <div
          style={{
            opacity: t.visible ? 1 : 0,
            transform: t.visible ? 'translateX(0)' : 'translateX(120%)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <ToastBar toast={t} />
        </div>
      )}
    </Toaster>
  );
}
