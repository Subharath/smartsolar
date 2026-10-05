import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/backoffice/dashboard': 'Backoffice Dashboard',
  '/backoffice/users': 'User Management',
  '/backoffice/prosumers': 'Prosumer Management',
  '/backoffice/nodes': 'Microgrid Node Management',
  '/backoffice/reservations': 'Reservation Management',
  '/operator/dashboard': 'Operator Dashboard',
  '/operator/bookings': 'Booking Management',
  '/operator/nodes': 'Operational Node Information',
};

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Smart Solar Microgrid';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#F4F6F2' }}
    >
      {/* Sidebar – fixed 256px on desktop, drawer on mobile */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: '#F4F6F2', padding: '24px 24px 32px' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
