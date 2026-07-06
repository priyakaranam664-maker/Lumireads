import { Component } from 'react';
import { Container } from 'react-bootstrap';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Container className="py-5 text-center">
                    <div style={{ padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h3 style={{ fontWeight: 800, color: 'var(--danger)' }}>Application Error</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Something went wrong while rendering this page.</p>
                        <pre style={{
                            textAlign: 'left',
                            background: 'var(--bg-secondary)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8rem',
                            overflowX: 'auto',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                        }}>
                            {this.state.error && this.state.error.toString()}
                            {"\n\nComponent Stack:\n"}
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                        <button
                            className="btn-primary-custom mt-3"
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                        >
                            Reset & Go Home
                        </button>
                    </div>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
