import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { DocumentsProvider } from '@/contexts/DocumentsContext';
import AuthProvider from '@/components/auth/AuthProvider';
import { AutoLogoutProvider } from '@/components/settings/AutoLogoutProvider';
import Navigation from '@/components/ui/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mind Mate - AI-помічник для Google Workspace',
  description: 'Розумна система для викладачів та працівників університету',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            <DocumentsProvider>
              <AutoLogoutProvider>
                <div className="min-h-screen bg-gray-50">
                  <nav className="bg-white border-b border-gray-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold text-gray-900">Mind Mate</h1>
                      </div>
                      <Navigation />
                    </div>
                  </nav>
                  <main className="flex-1">
                    {children}
                  </main>
                </div>
              </AutoLogoutProvider>
            </DocumentsProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
