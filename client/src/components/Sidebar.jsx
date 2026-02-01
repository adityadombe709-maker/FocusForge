import { useState } from "react";
import { formatTime } from "../helpers/formatTime";

export function Sidebar({ sessions }) {
  const [option, setOption] = useState(0);
  function renderSessions() {
    if (sessions.length === 0) {
      switch (option) {
        case 0:
          return "No sessions Today";
        case 1:
          return "No sessions this week";
        case 2:
          return "No sessions this month";
        case 3:
          return "No sessions this year";
      }
    } else {
      const now = new Date();
      function determineStart() {
        if (option === 0) {
          return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (option === 1) {
          return new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - now.getDay(),
          );
        } else if (option === 2) {
          return new Date(now.getFullYear(), now.getMonth());
        } else {
          return new Date(now.getFullYear(), 0, 1);
        }
      }

      const startLimit = determineStart();
      let sessionCount = 0;
      let totalTime = 0;
      const filtered = sessions.filter((session) => {
        if (session.startTime.getTime() < startLimit.getTime()) {
          return false;
        }
        sessionCount += 1;
        totalTime += session.duration;
        return true;
      });

      return (
        <>
          <div>
            Sessions: {sessionCount} <br/>
            Time Focused: {formatTime(totalTime)} <br/>
            Avg. Session Length: {formatTime(totalTime / sessionCount)}
          </div>
          {filtered.map((session, index) => {
            return (
              <div key={index}>
                {session.startTime.toLocaleTimeString("en-US")} -{" "}
                {session.endTime.toLocaleTimeString("en-US")} <br />
                Duration: {session.formattedDuration}
              </div>
            );
          })}
        </>
      );
    }
  }

  return (
    <>
      <p>Today's Progress</p>
      <div>
        <label htmlFor="filter">Show sessions: </label>

        <select
          id="filter"
          onChange={(e) => {
            setOption(Number(e.target.value));
          }}
        >
          <option value="0">Today</option>
          <option value="1">This Week</option>
          <option value="2">This month</option>
          <option value="3">This year</option>
        </select>
      </div>
      {renderSessions()}
    </>
  );
}
