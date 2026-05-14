import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Image - Same size as navbar */}
      <div className="w-full h-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20">
          <img
            src="/header.jpg"
            alt="T.B. Lulla Charitable Foundation Header"
            className="w-full h-20 object-cover"
            style={{ objectPosition: 'center 30%' }}
            loading="eager"
          />
        </div>
      </div>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}