import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import SESSIONS_PER_DAY_PY from "../charts/sessionsPerDay.py?raw";
import AVG_PIPES_PY from "../charts/avgPipesPerDay.py?raw";

let pyodideReady = null;

function getPyodide() {
    if (!pyodideReady) {
        pyodideReady = (async () => {
            const pyodide = await globalThis.loadPyodide();
            await pyodide.loadPackage(["matplotlib"]);
            return pyodide;
        })();
    }
    return pyodideReady;
}

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [pyStatus, setPyStatus] = useState("idle");

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snap) => {
            setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
    }, []);

    useEffect(() => {
        const q = query(collection(db, "scores"), orderBy("endTime", "desc"));
        return onSnapshot(q, (snap) => {
            setSessions(
                snap.docs.map((d) => {
                    const data = d.data();
                    return {
                        id: d.id,
                        userId: data.userId,
                        score: data.score ?? 0,
                        pipes: data.pipes ?? 0,
                        duration: data.duration ?? 0,
                        startTime: data.startTime?.toDate?.()?.toISOString() ?? null,
                        endTime: data.endTime?.toDate?.()?.toISOString() ?? null,
                    };
                })
            );
        });
    }, []);

    useEffect(() => {
        if (sessions.length === 0) {
            setPyStatus("no-data");
            return;
        }

        const renderCharts = async () => {
            try {
                setPyStatus("loading");
                const pyodide = await getPyodide();
                window.__pyodideData = JSON.stringify(sessions);

                setPyStatus("running");
                await pyodide.runPythonAsync(SESSIONS_PER_DAY_PY);
                await pyodide.runPythonAsync(AVG_PIPES_PY);

                setPyStatus("done");
            } catch (err) {
                console.error("Pyodide error:", err);
                setPyStatus("error");
            }
        };

        renderCharts();
    }, [sessions]);

    const totalUsers = users.length;
    const totalSessions = sessions.length;
    const totalMinutes = Math.round(sessions.reduce((s, x) => s + (x.duration ?? 0), 0) / 60);
    const topScore = sessions.reduce((best, x) => Math.max(best, x.score ?? 0), 0);

    return (
        <div className="admin-content">
            <div className="admin-stats-row">
                <div className="stat-card">
                    <div>
                        <p className="stat-num">{totalUsers}</p>
                        <p className="stat-lbl">Total Players</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div>
                        <p className="stat-num">{totalSessions}</p>
                        <p className="stat-lbl">Sessions Logged</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div>
                        <p className="stat-num">{totalMinutes}</p>
                        <p className="stat-lbl">Total Minutes</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div>
                        <p className="stat-num">{topScore}</p>
                        <p className="stat-lbl">Top Score</p>
                    </div>
                </div>
            </div>

            <div className="py-status">
                {pyStatus === "loading" && <span>Loading Pyodide (first time only, ~10MB)...</span>}
                {pyStatus === "running" && <span>Running Python charts...</span>}
                {pyStatus === "done" && <span style={{ color: "#10b981" }}>Charts updated</span>}
                {pyStatus === "no-data" && <span>No telemetry data yet — play a game first!</span>}
                {pyStatus === "error" && <span style={{ color: "#ef4444" }}>Error rendering charts (check console)</span>}
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <div id="chart-sessions-per-day"></div>
                </div>
                <div className="chart-card">
                    <div id="chart-avg-pipes"></div>
                </div>
            </div>

            <div className="users-table-card">
                <h2 className="card-title">Recent Sessions</h2>
                <div className="table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Score</th>
                                <th>Pipes</th>
                                <th>Duration (s)</th>
                                <th>Ended</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.slice(0, 20).map((s) => (
                                <tr key={s.id}>
                                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                        {s.userId?.substring(0, 12)}...
                                    </td>
                                    <td>{s.score}</td>
                                    <td>{s.pipes}</td>
                                    <td>{s.duration}</td>
                                    <td>{s.endTime ? new Date(s.endTime).toLocaleString() : "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}