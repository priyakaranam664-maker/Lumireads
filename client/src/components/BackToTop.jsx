import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiArrowUp } from 'react-icons/fi';

// Automatically scroll to top on route change
export const ScrollToTopOnNavigate = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

// Floating back-to-top button
const BackToTop = () => {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setVisible(scrollY > 400);
            setProgress(docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const circumference = 2 * Math.PI * 20;

    return (
        <>
            {/* Reading progress bar */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: `${progress}%`, height: '3px',
                background: 'linear-gradient(90deg, var(--primary), #8B5CF6)', zIndex: 9999,
                transition: 'width 0.1s ease-out', borderRadius: '0 2px 2px 0',
            }} />

            {/* Back to top button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Back to top"
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', width: 50, height: 50,
                    borderRadius: '50%', border: 'none', cursor: 'pointer', zIndex: 999,
                    background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
                    transform: visible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <svg width="50" height="50" viewBox="0 0 50 50" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                    <circle cx="25" cy="25" r="20" fill="none" stroke="var(--border-color)" strokeWidth="2.5" />
                    <circle cx="25" cy="25" r="20" fill="none" stroke="var(--primary)" strokeWidth="2.5"
                        strokeDasharray={circumference} strokeDashoffset={circumference - (progress / 100) * circumference}
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.1s ease-out' }} />
                </svg>
                <FiArrowUp size={18} style={{ color: 'var(--primary)', position: 'relative', zIndex: 1 }} />
            </button>
        </>
    );
};

export default BackToTop;
