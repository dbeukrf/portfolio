import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="fixed inset-0 bg-background-dark text-white overflow-x-hidden overflow-y-scroll scrollbar-custom">
      {/* Main content area without header */}
      <main className="w-full h-full">
        <Outlet />
      </main>
    </div>
  );
}
