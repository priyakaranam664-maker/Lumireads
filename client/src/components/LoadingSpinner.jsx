const LoadingSpinner = ({ message = 'Loading...' }) => (
    <div className="loading-state-card">
        <div className="loading-state-shimmer" />
        <div className="loading-state-shimmer short" />
        <div className="loading-state-shimmer short" />
        <p>{message}</p>
    </div>
);

export default LoadingSpinner;
