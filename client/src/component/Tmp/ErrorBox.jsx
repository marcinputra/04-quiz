function ErrorBox({ message, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 text-gray-800 p-6">
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Błąd</h1>
        <p className="mb-4 text-sm text-gray-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700"
          >
            Spróbuj ponownie
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorBox;