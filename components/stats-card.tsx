const StatsCard = ({ event }: { event: PHEvent }) => (
  <div
    className={`flex flex-col items-center gap-8 border-solid border-4 border-amber-400 dark:border-amber-500 rounded p-8 text-center ${
      event.stat1Data || event.stat2Data || event.stat3Data ? '' : 'hidden'
    }`}
  >
    {event.stat1Data && (
      <div className="flex flex-col items-center hover:text-amber-400 dark:hover:text-amber-500 hover:scale-105 transition ease-in-out transition-150">
        <h1 className="text-3xl sm:text-4xl font-bold">{event.stat1Data}</h1>
        <p>{event.stat1Label}</p>
      </div>
    )}
    {event.stat2Data && (
      <div className="flex flex-col items-center hover:text-amber-400 dark:hover:text-amber-500 hover:scale-105 transition ease-in-out transition-150">
        <h1 className="text-3xl sm:text-4xl font-bold">{event.stat2Data}</h1>
        <p>{event.stat2Label}</p>
      </div>
    )}
    {event.stat3Data && (
      <div className="flex flex-col items-center hover:text-amber-400 dark:hover:text-amber-500 hover:scale-105 transition ease-in-out transition-150">
        <h1 className="text-3xl sm:text-4xl font-bold">{event.stat3Data}</h1>
        <p>{event.stat3Label}</p>
      </div>
    )}
  </div>
)

export default StatsCard
