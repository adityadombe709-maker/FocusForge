import { Sidebar } from "../components/Sidebar";
import { Timer } from "../components/Timer";
import { useState, useEffect } from "react";

export function Dashboard({ setIsLoggedIn }) {
  // const [sessions, setSessions] = useState([
  //   {
  //     startTime: new Date(),
  //     endTime: new Date(Date.now() + 25 * 60 * 1000),
  //     duration: 25 * 60,
  //     formattedDuration: "25:00",
  //   },

  //   {
  //     startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
  //     endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
  //     duration: 20 * 60,
  //     formattedDuration: "20:00",
  //   },

  //   {
  //     startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  //     endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
  //     duration: 15 * 60,
  //     formattedDuration: "15:00",
  //   },

  //   {
  //     startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  //     endTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
  //     duration: 30 * 60,
  //     formattedDuration: "30:00",
  //   },

  //   {
  //     startTime: new Date(new Date().setMonth(new Date().getMonth() - 1)),
  //     endTime: new Date(
  //       new Date().setMonth(new Date().getMonth() - 1) + 20 * 60 * 1000,
  //     ),
  //     duration: 20 * 60,
  //     formattedDuration: "20:00",
  //   },

  //   {
  //     startTime: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
  //     endTime: new Date(
  //       new Date().setFullYear(new Date().getFullYear() - 1) + 10 * 60 * 1000,
  //     ),
  //     duration: 10 * 60,
  //     formattedDuration: "10:00",
  //   },
  // ]);
  const [sessions, setSessions] = useState(() => {
    const stored = localStorage.getItem("sessions");
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);

    return parsed.map((session) => {
      return {
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
      };
    });
  });

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <Timer sessions={sessions} setSessions={setSessions} />
      </div>
      <Sidebar sessions={sessions} />
      <button
        onClick={() => {
          setIsLoggedIn(false);
          localStorage.setItem("loggedIn", "false");
        }}
      >
        Logout
      </button>
    </div>
  );
}
