import WorkerTaskCard from "../components/WorkerTaskCard";

export default function WorkerPage({ workers, selectedWorker, onSelectedWorkerChange, workerTasks, onCompleteTask }) {
  const worker = workers.find((w) => w.id === selectedWorker);
  
  const pendingTasks = workerTasks.filter((t) => t.status === "pending");
  const completedTasks = workerTasks.filter((t) => t.status === "completed");
  
  // Calculate stats
  const stats = {
    pending: pendingTasks.length,
    completed: completedTasks.length,
    total: workerTasks.length,
  };

  return (
    <section className="max-w-4xl mx-auto space-y-5">
      {/* Worker Header */}
      <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg">
        <div>
          <p className="text-sm text-pink-100 font-medium">Welcome back,</p>
          <h1 className="text-3xl font-bold mt-1">{worker?.name || "Worker"}</h1>
        </div>
      </div>

      {/* Worker Selector */}
      <div className="bg-white border border-pink-100 rounded-2xl p-4 shadow-sm">
        <label className="text-sm font-semibold text-slate-600">Switch Worker</label>
        <select 
          className="w-full mt-2 border border-pink-200 rounded-xl p-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100" 
          value={selectedWorker} 
          onChange={(e) => onSelectedWorkerChange(e.target.value)}
        >
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-pink-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-amber-600 mb-2">Pending</p>
          <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
        </div>
        
        <div className="bg-white border border-pink-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-emerald-600 mb-2">Done</p>
          <p className="text-3xl font-bold text-slate-900">{stats.completed}</p>
        </div>
        
        <div className="bg-white border border-pink-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-pink-600 mb-2">Total</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
      </div>

      {/* Pending Tasks Section */}
      {pendingTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Pending Tasks</h2>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
              {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          {pendingTasks.map((task) => (
            <WorkerTaskCard key={task.id} task={task} onComplete={onCompleteTask} />
          ))}
        </div>
      )}

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Completed Tasks</h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
              {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          {completedTasks.map((task) => (
            <WorkerTaskCard key={task.id} task={task} onComplete={onCompleteTask} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {workerTasks.length === 0 && (
        <div className="bg-white border border-pink-100 rounded-3xl p-12 text-center shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-2">All caught up!</h3>
          <p className="text-slate-500">No tasks assigned at the moment.</p>
        </div>
      )}
    </section>
  );
}
