// Layout.jsx
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div>
        {/* <Navbar/> */}
        <Sidebar/>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
