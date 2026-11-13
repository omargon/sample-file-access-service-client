import type { Metadata } from 'next';
import './globals.css';
import { AuthBoundary, AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'BioAccess - Sample & File Access Service POC',
  description: 'Modern Proof of Concept client for sample-file-access-service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <AuthBoundary>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
          </AuthBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
