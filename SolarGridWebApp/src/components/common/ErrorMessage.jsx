function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-4 flex items-start justify-between gap-3">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-medium text-red-700 underline shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
