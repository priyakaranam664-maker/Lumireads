const LoadingSpinner = ({ message = 'Loading...' }) => (
    <div className="loading-spinner">
        <div className="text-center">
            <div className="spinner mx-auto mb-3"></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{message}</p>
        </div>
    </div>
);
export default LoadingSpinner;
