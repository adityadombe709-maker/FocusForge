export function Sidebar({ sessions }) {
  function renderSessions() {
    if (sessions.length === 0) {
      return "No sessions today";
    } else {
      return sessions.map((session, index) => {
        return (
          <>
            <div key={index}>
              {session.startTime.toLocaleTimeString("en-US")} - {session.endTime.toLocaleTimeString("en-US")} <br />
              Duration:{" "}{session.duration}
            </div>
          </>
        );
      });
    }
  }

  return (
    <>
      <p>Today's Progress</p>
      {renderSessions()}
    </>
  );
}
