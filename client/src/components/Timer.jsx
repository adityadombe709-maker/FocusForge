import { useState, useEffect, useRef, useCallback } from "react";
import { formatTime } from "../helpers/formatTime";
import { startPauseLabel } from "../helpers/startPauseLabel";
import axios from "axios";

export function Timer({ sessions, setSessions }) {
  const [seconds, setSeconds] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(25);
  const [inputSeconds, setInputSeconds] = useState(0);
  const startSessionRef = useRef(null);

  //Calculates seconds from input
  const handleSetTime = () => {
    const totalSeconds = inputMinutes * 60 + inputSeconds;
    if (totalSeconds > 0) {
      setSeconds(totalSeconds);
      setShowTimeInput(false);
      setIsRunning(false);
    }
  };

  //handles starting of the timer
  const handleStart = () => {
    if (!isRunning && seconds >= 1) {
      setIsRunning(true);
      startSessionRef.current = new Date();
    }
  };

  //handles stopping or pausing of the timer
  const handleEnd = useCallback(async () => {
    if (!startSessionRef.current || !isRunning) {
      return;
    }
    setIsRunning(false);
    const endTime = new Date();
    const duration = Math.round(
      (endTime.getTime() - startSessionRef.current.getTime()) / 1000,
    );
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        return;
      }
      const response = await axios.post("/api/sessions", {
        userId,
        startTime: startSessionRef.current,
        endTime: endTime,
        duration: duration,
      });

      setSessions(
        (prev) => {
          return [
            {
              ...response.data,
              startTime: new Date(response.data.startTime),
              endTime: new Date(response.data.endTime),
            },
            ...prev,
          ];
        },
        [isRunning, setSessions],
      );
    } catch (error) {
      console.error("Failed to save session: ", error);
    }
    startSessionRef.current = null;
  });

  //Just combines start and end functions
  const handleStartEnd = () => {
    if (!isRunning) {
      handleStart();
    } else {
      handleEnd();
    }
  };

  useEffect(() => {
    if (seconds === 0 && isRunning) {
      handleEnd();
    }
  }, [seconds, isRunning, handleEnd]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((s) => {
        return Math.max(0, s - 1);
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
                  setInputMinutes(Number(e.target.value));
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
              <button className="success" onClick={handleSetTime}>
                Set Time
              </button>
              <button
                className="secondary"
                onClick={() => setShowTimeInput(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
