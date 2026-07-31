async function getHealth() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
    cache: 'no-store',
  });
  return res.json();
}

export default async function Home() {
  const data = await getHealth();
  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">School Management System</h1>
      <p className="mt-2">
        Backend status: <strong>{data.status}</strong> — DB:{' '}
        <strong>{data.db}</strong>
      </p>
    </main>
  );
}