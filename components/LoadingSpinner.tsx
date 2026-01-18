export default function LoadingSpinner() {
    return (
        <div className="loading-screen" role="status" aria-live="polite">
            <div className="spinner"></div>
            <p className="loading-text">loading posts...</p>
        </div>
    );
}
