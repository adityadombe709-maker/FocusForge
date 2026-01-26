import { useState, useEffect } from "react";

export function Timer() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins} : ${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setIsRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isRunning]);

  return (
    <>
      <h2>Let's Focus</h2>
      <div>{formatTime(seconds)}</div>
      <div>
        <button
          onClick={() => {
            setIsRunning(true);
          }}
        >
          Start
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
          }}
        >
          Pause
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setSeconds(25 * 60);
          }}
        >
          Reset
        </button>
      </div>
    </>
  );
}
