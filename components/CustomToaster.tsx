'use client';

import { Toaster, ToastBar } from 'react-hot-toast';

export default function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: { marginTop: '60px' },
        duration: 3000
      }}
    >
      {(t) => (
        <div
          style={{
            opacity: t.visible ? 1 : 0,
            transform: t.visible
              ? 'translate(0, 0)'
              : t.position?.includes('bottom')
                ? 'translateY(200%)'
                : 'translateX(200%)',
            transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease',
          }}
        >
          <ToastBar
            toast={t}
            style={{
              ...t.style,
              animation: 'none', // completely disable default react-hot-toast scale/drop
            }}
          />
        </div>
      )}
    </Toaster>
  );
}
