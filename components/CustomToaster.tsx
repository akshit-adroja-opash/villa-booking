'use client';

import { Toaster, ToastBar } from 'react-hot-toast';

export default function CustomToaster() {
  return (
    <Toaster 
      position="bottom-center" 
      toastOptions={{ 
        style: { marginBottom: '10px' },
        duration: 3000
      }}
    >
      {(t) => (
        <ToastBar 
          toast={t} 
          style={{
            ...t.style,
            animation: t.visible 
              ? 'slideInUpCustom 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
              : 'slideOutDownCustom 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        />
      )}
    </Toaster>
  );
}
