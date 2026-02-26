import { Sidebar } from "../components/Sidebar";
import { Timer } from "../components/Timer";
import { useState, useEffect } from "react";
import axios from "axios";

export function Dashboard({ setIsLoggedIn }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        return;
      }

      try {
        const response = await axios.get(`/api/sessions/${userId}`);
        const hydratedSessions = response.data.map((session) => {
          return {
            ...session,
            startTime: new Date(session.startTime),
            endTime: new Date(session.endTime),
          };
        });
        setSessions(hydratedSessions);
      } catch (error) {
        console.error("Failed to fetch sessions: ", error);
      }
    };
    fetchSessions();
  }, []);


  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <Timer sessions={sessions} setSessions={setSessions} />
      </div>
      <Sidebar sessions={sessions} />
      <button
        onClick={() => {
          setIsLoggedIn(false);
          localStorage.removeItem("loggedIn");
          localStorage.removeItem("userId");
        }}
      >
        Logout
      </button>
    </div>
  );
}
