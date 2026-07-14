import { Outlet } from 'react-router-dom';
import PremiumNavbar from '../components/PremiumNavbar';
import Footer from '../components/Footer';

const MainLayout = () => (
    <div className="d-flex flex-column min-vh-100 app-shell">
        <PremiumNavbar />
        <main id="main-content" className="flex-grow-1" tabIndex="-1"><Outlet /></main>
        <Footer />
    </div>
);

export default MainLayout;
