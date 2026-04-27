return (
  <RequireAuth>
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Attendance</h1>
          <p className="text-sm opacity-70">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {!selectedChurchId && (
        <p className="text-sm font-medium">
          Please select a church from the top dropdown.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-xl p-6">
          <p className="text-sm">Total Check-Ins</p>
          <h2 className="text-3xl font-bold">{checkIns.length}</h2>
        </div>

        <div className="border rounded-xl p-6">
          <p className="text-sm">Members</p>
          <h2 className="text-3xl font-bold">{members}</h2>
        </div>

        <div className="border rounded-xl p-6">
          <p className="text-sm">Visitors</p>
          <h2 className="text-3xl font-bold">{visitors}</h2>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-3">Recent Check-Ins</h2>

        <div className="space-y-3">
          {checkIns.slice(0, 10).map((checkIn) => (
            <div
              key={checkIn.id}
              className="border rounded-xl p-4 flex justify-between"
            >
              <span>{checkIn.members?.full_name || "Unknown"}</span>
              <span className="opacity-60">{checkIn.service_type}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  </RequireAuth>
)