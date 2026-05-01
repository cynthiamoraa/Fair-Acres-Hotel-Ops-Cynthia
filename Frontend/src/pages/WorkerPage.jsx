import WorkerTaskCard from "../components/WorkerTaskCard";

export default function WorkerPage({ workers, selectedWorker, onSelectedWorkerChange, workerTasks, onCompleteTask }) {
  return (
    <section className="max-w-xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 mb-4">
        <label className="text-sm text-slate-600">Select Worker</label>
        <select className="w-full mt-1 border rounded-2xl p-3" value={selectedWorker} onChange={(e) => onSelectedWorkerChange(e.target.value)}>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {workerTasks.map((task) => (
          <WorkerTaskCard key={task.id} task={task} onComplete={onCompleteTask} />
        ))}
        {!workerTasks.length && <p className="text-center text-slate-500">No tasks assigned.</p>}
      </div>
    </section>
  );
}
