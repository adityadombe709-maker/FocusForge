import { useState, useEffect } from "react";

export function Timer() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(25);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [startSession, setStartSession] = useState(null);

  const handleSetTime = () => {
    const totalSeconds = inputMinutes * 60 + inputSeconds;
    if (totalSeconds > 0) {
      setSeconds(totalSeconds);
      setShowTimeInput(false);
      setIsRunning(false);
    }
  };

  const handleStartEnd = () => {
    if (!isRunning){
      setIsRunning(!isRunning);
      setStartSession(new Date());
    }
    else{
      setIsRunning(!isRunning);
      const session = {
        startTime: startSession,
        endTime: new Date(),
        duration: formatTime(Math.round((new Date().getTime() - startSession.getTime()) / 1000))
      };
      setSessions((prev) => {
        return [...prev, session];
      });
    }
  }

  useEffect(() => {
    console.log(sessions);
  }, [sessions]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins} : ${secs < 10 ? "0" : ""}${secs}`;
  };

  const startPauseLabel = function(){
    if (isRunning){
      return "Pause";
    }
    else{
      return "Start";
    }
  }

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
      <div>
        <button
          onClick={handleStartEnd}
        >
          {startPauseLabel()}
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setSeconds(inputMinutes * 60 + inputSeconds);
          }}
        >
          Reset
        </button>
      </div>
      {showTimeInput && (
        <div>
          <h3>Set Time</h3>
          <div>
            <label>Minutes: </label>
            <input
              type="number"
              min="0"
              max="180"
              value={inputMinutes}
              onChange={(e) => {
                return setInputMinutes(Number(e.target.value));
              }}
            />
          </div>
          <div>
            <label>Seconds: </label>
            <input
              type="number"
              min="0"
              max="59"
              value={inputSeconds}
              onChange={(e) => {
                setInputSeconds(Number(e.target.value));
              }}
            />
          </div>
          <button onClick={handleSetTime}>Set Time</button>
          <button onClick={() => setShowTimeInput(false)}>Cancel</button>
        </div>
      )}
    </>
  );
}
