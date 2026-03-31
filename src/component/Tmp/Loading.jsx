function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 text-gray-800 p-6">
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">Ładowanie pytań…</h1>
        <p className="text-sm text-gray-500">
          Proszę czekać, trwa wczytywanie pliku JSON.
        </p>
      </div>
    </div>
  );
}

export default Loading;