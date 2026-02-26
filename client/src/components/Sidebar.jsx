import { useState } from "react";
import { formatTime } from "../helpers/formatTime";

export function Sidebar({ sessions }) {
  const [option, setOption] = useState(0);
  function renderSessions() {
    if (sessions.length === 0) {
      let message = "";
      switch (option) {
        case 0:
          message = "No sessions today";
          break;
        case 1:
          message = "No sessions this week";
          break;
        case 2:
          message = "No sessions this month";
          break;
        case 3:
          message = "No sessions this year";
          break;
        default:
          message = "No sessions";
      }
      return <div className="empty-state">{message}</div>;
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
          <div className="session-stats">
            <div>
              <span className="stat-label">Sessions:</span> {sessionCount}
            </div>
            <div>
              <span className="stat-label">Time Focused:</span>{" "}
              {formatTime(totalTime)}
            </div>
            <div>
              <span className="stat-label">Avg. Session:</span>{" "}
              {formatTime(Math.round(totalTime / sessionCount))}
            </div>
          </div>
          <div className="session-list">
            {filtered.map((session, index) => {
              return (
                <div key={index} className="session-item">
                  <div className="session-time">
                    {session.startTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {session.endTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="session-duration">
                    Duration: {formatTime(session.duration)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      );
    }
  }

  return (
    <div className="sidebar">
      <p className="sidebar-title">Today's Progress</p>
      <div className="sidebar-filter">
        <label htmlFor="session-filter">Show sessions</label>
        <select
          id="session-filter"
          onChange={(e) => {
            setOption(Number(e.target.value));
          }}
        >
          <option value="0">Today</option>
          <option value="1">This Week</option>
          <option value="2">This Month</option>
          <option value="3">This Year</option>
        </select>
      </div>
      {renderSessions()}
    </div>
  );
}
