export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Interview Prep</h1>
      <a
        href="/plan"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Go to Study Plan
      </a>
    </main>
  );
}
