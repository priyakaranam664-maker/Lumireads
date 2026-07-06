import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SocialAuthHandler = () => {
    const { socialSignIn, user: currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const handledRef = useRef(false);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            // Only run when insforge_code is in the URL (i.e., returning from Google)
            const searchParams = new URLSearchParams(location.search);
            if (!searchParams.has('insforge_code') || handledRef.current || currentUser) return;

            handledRef.current = true;

            try {
                // Dynamically import insforge only when needed
                const { default: insforge } = await import('../lib/insforge');
                const { data, error } = await insforge.auth.getCurrentUser();

                if (error || !data?.user) {
                    console.warn('InsForge OAuth callback: no user found');
                    return;
                }

                await socialSignIn({
                    email: data.user.email,
                    fullName: data.user.profile?.name,
                    avatar_url: data.user.profile?.avatar_url,
                    provider: data.user.providers?.[0] || 'google',
                });

                // Clear URL params
                navigate('/', { replace: true });
            } catch (err) {
                console.error('Social auth sync failed:', err);
                toast.error('Google sign-in failed. Please try again.');
            }
        };

        handleOAuthCallback();
    }, [location.search, currentUser, socialSignIn, navigate]);

    return null;
};

export default SocialAuthHandler;
