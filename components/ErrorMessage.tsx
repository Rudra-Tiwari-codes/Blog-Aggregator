interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="message error">
      <h3>Unable to load posts</h3>
      <p>{message}</p>
      <button onClick={handleRefresh} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
        refresh page
      </button>
    </div>
  );
}
