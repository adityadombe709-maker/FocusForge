import { useState, useEffect, useRef } from "react";
import { formatTime } from "../helpers/formatTime";
import { startPauseLabel } from "../helpers/startPauseLabel";

export function Timer({ sessions, setSessions }) {
  const [seconds, setSeconds] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(25);
  const [inputSeconds, setInputSeconds] = useState(0);
  // const [sessions, setSessions] = useState([]);
  // const [startSession, setStartSession] = useState(null);
  const startSessionRef = useRef(null);

  const handleSetTime = () => {
    const totalSeconds = inputMinutes * 60 + inputSeconds;
    if (totalSeconds > 0) {
      setSeconds(totalSeconds);
      setShowTimeInput(false);
      setIsRunning(false);
    }
  };

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      startSessionRef.current = new Date();
    }
  };

  const handleEnd = () => {
    if (!startSessionRef.current || !isRunning) {
      return;
    }
    setIsRunning(false);
    const duration = Math.round(
      (new Date().getTime() - startSessionRef.current.getTime()) / 1000,
    );
    const session = {
      startTime: startSessionRef.current,
      endTime: new Date(),
      duration: duration,
      formattedDuration: formatTime(duration),
    };
    setSessions((prev) => {
      return [...prev, session];
    });
    startSessionRef.current = null;
  };

  const handleStartEnd = () => {
    if (!isRunning) {
      handleStart();
    } else {
      handleEnd();
    }
  };

  useEffect(() => {
    console.log(sessions);
  }, [sessions]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setIsRunning(false);
          if (startSessionRef.current) {
            const duration = Math.round(
              (new Date().getTime() - startSessionRef.current.getTime()) / 1000,
            );
            const session = {
              startTime: startSessionRef.current,
              endTime: new Date(),
              duration: duration,
              formattedDuration: formatTime(duration),
            };
            setSessions((prev) => {
              return [...prev, session];
            });
          }
          startSessionRef.current = null;
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
      <div
        className="countDown"
        onClick={() => {
          if (!isRunning) {
            setShowTimeInput(true);
          }
        }}
        style={{ cursor: !isRunning ? "pointer" : "default" }}
      >
        {formatTime(seconds)}
      </div>
      <div className="controls-container">
        <button onClick={handleStartEnd}>{startPauseLabel(isRunning)}</button>
        <button
          className="secondary"
          onClick={() => {
            setIsRunning(false);
            startSessionRef.current = null;
            setSeconds(inputMinutes * 60 + inputSeconds);
          }}
        >
          Reset
        </button>
      </div>
      {showTimeInput && (
        <div className="time-input-overlay">
          <div className="time-input-modal">
            <h3>Set Time</h3>
            <div className="time-input-group">
              <label htmlFor="minutes-input">Minutes</label>
              <input
                id="minutes-input"
                type="number"
                min="0"
                max="180"
                value={inputMinutes}
                onChange={(e) => {
                  return setInputMinutes(Number(e.target.value));
                }}
              />
            </div>
            <div className="time-input-group">
              <label htmlFor="seconds-input">Seconds</label>
              <input
                id="seconds-input"
                type="number"
                min="0"
                max="59"
                value={inputSeconds}
                onChange={(e) => {
                  setInputSeconds(Number(e.target.value));
                }}
              />
            </div>
            <div className="time-input-actions">
              <button className="success" onClick={handleSetTime}>Set Time</button>
              <button className="secondary" onClick={() => setShowTimeInput(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
