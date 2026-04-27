export default function HomePage() {
  return (
    <main className="min-h-screen p-6 space-y-6">
      <h1 className="text-4xl font-bold">FlockPulse</h1>
      <p>Church attendance, member tracking, and engagement made simple.</p>

      <div className="grid gap-4 max-w-md">
        <a className="border rounded-xl p-4" href="/login">Login</a>
        <a className="border rounded-xl p-4" href="/dashboard">Dashboard</a>
        <a className="border rounded-xl p-4" href="/members">Add Member</a>
        <a className="border rounded-xl p-4" href="/checkin">Check In</a>
        <a className="border rounded-xl p-4" href="/directory">Directory</a>
        <a className="border rounded-xl p-4" href="/scan">Scan QR</a>
        <a className="border rounded-xl p-4" href="/live">Live Attendance</a>
        <a className="border rounded-xl p-4" href="/follow-ups">Follow-Ups</a>
      </div>
    </main>
  )
}