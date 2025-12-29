import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Janta Pharmacy',
  description: 'Modern pharmacy management platform',
};

/**
 * Root Layout
 * 
 * Provides global layout structure and context providers.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <AuthProvider>
          <Header />
          <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

