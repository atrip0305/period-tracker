import { useState } from 'react';
import { DailyLogPanel } from './features/daily-log/DailyLogPanel';

function App() {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ padding: 24 }}>
      <h1>Period Tracker</h1>

      <button onClick={() => setOpen(true)}>
        Open Daily Log
      </button>

      <DailyLogPanel
        date="2025-01-15"
        isOpen={open}
        isPastDate={true}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export default App;
