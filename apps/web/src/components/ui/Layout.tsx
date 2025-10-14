import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background-dark">
      <header className="bg-background-light shadow-sm border-b border-border-DEFAULT">
        <div className="container">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-h3 text-gradient">
              Diego's Portfolio
            </h1>
            <nav className="space-x-4">
              <a href="/" className="nav-link">
                Home
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="container section-sm">
        <Outlet />
      </main>
    </div>
  );
}
