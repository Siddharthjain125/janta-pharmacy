import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Header } from '@/components/Header';
import { LoginPrompt } from '@/components/LoginPrompt';

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
      <body>
        <AuthProvider>
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
          <LoginPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}

