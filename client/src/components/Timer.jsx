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
  const wasRunningBeforePauseRef = useRef(false);

  const logTimerEvent = (event, details = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[Timer] ${event} @ ${timestamp}`, details);
  };

  useEffect(() => {
    const handleExtensionPing = (event) => {
      if (event.source !== window) {
        return;
      }

      if (event.data?.type === "FOCUSFORGE_EXTENSION_PING") {
        logTimerEvent("EXTENSION_PING_RECEIVED");
        window.postMessage({ type: "FOCUSFORGE_TIMER_READY" }, "*");
      }
    };

    window.addEventListener("message", handleExtensionPing);
    return () => window.removeEventListener("message", handleExtensionPing);
  }, []);

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
  const handleStart = (source = "manual_start") => {
    if (!isRunning && seconds >= 1) {
      logTimerEvent("RESUMED", {
        source,
        secondsRemaining: seconds,
      });
      setIsRunning(true);
      startSessionRef.current = new Date();
    }
  };

  //handles stopping or pausing of the timer
  const handleEnd = useCallback(
    async (reason = "manual_pause") => {
      if (!startSessionRef.current || !isRunning) {
        return;
      }
      setIsRunning(false);
      const startTime = startSessionRef.current;
      startSessionRef.current = null;
      const endTime = new Date();
      const duration = Math.round(
        (endTime.getTime() - startTime.getTime()) / 1000,
      );
      logTimerEvent("PAUSED", {
        reason,
        pausedAtSecondsRemaining: seconds,
        elapsedSeconds: duration,
      });
      if (duration < 1) {
        return;
      }
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          return;
        }
        const response = await axios.post("/api/sessions", {
          userId,
          startTime: startTime,
          endTime: endTime,
          duration: duration,
        });

        setSessions((prev) => {
          return [
            {
              ...response.data,
              startTime: new Date(response.data.startTime),
              endTime: new Date(response.data.endTime),
            },
            ...prev,
          ];
        });
      } catch (error) {
        console.error("Failed to save session: ", error);
      }
      startSessionRef.current = null;
    },
    [isRunning, seconds, setSessions],
  );

  //Just combines start and end functions
  const handleStartEnd = () => {
    if (!isRunning) {
      handleStart("manual_start");
    } else {
      handleEnd("manual_pause");
    }
  };

  //stop timer when it hits zero
  useEffect(() => {
    if (seconds === 0 && isRunning) {
      handleEnd("completed");
    }
  }, [seconds, isRunning, handleEnd]);

  //timer logic
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

  //announce timer page so extension can register the correct tab
  useEffect(() => {
    logTimerEvent("TIMER_READY_SIGNAL_SENT");
    window.postMessage({ type: "FOCUSFORGE_TIMER_READY" }, "*");
  }, []);

  //handle messages from extension
  useEffect(() => {
    const handleMessage = (event) => {
      //check if message is from out extension
      if (event.data.type === "FROM_EXTENSION") {
        //get pausing message
        const shouldPause = event.data.shouldPause;
        logTimerEvent("EXTENSION_STATUS_RECEIVED", {
          shouldPause,
          currentDomain: event.data.currentDomain,
        });

        if (shouldPause && isRunning) {
          wasRunningBeforePauseRef.current = true;
          handleEnd("extension_pause");
        } else if (
          !shouldPause &&
          !isRunning &&
          wasRunningBeforePauseRef.current
        ) {
          handleStart("extension_resume");
          wasRunningBeforePauseRef.current = false;
        }
      }
    };

    //listen for messages
    window.addEventListener("message", handleMessage);

    //Cleanup: listener no longer needed when the component isnt rendering
    return () => {
      return window.removeEventListener("message", handleMessage);
    };
  }, [isRunning, handleStart, handleEnd]);

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
            // setIsRunning(false);
            // startSessionRef.current = null;
            setSeconds(inputMinutes * 60 + inputSeconds);
            handleEnd("reset");
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
