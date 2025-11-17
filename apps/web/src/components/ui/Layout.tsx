import { Outlet } from 'react-router-dom';
import CustomCursor from './CustomCursor';

export default function Layout() {
  return (
    <div className="fixed inset-0 bg-background-dark text-white overflow-x-hidden overflow-y-scroll scrollbar-custom" style={{ cursor: 'none' }}>
      <CustomCursor />
      {/* Main content area without header */}
      <main className="w-full h-full relative">
        <Outlet />
      </main>
    </div>
  );
}
