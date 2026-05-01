import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import GameFrame from "./GameFrame";
import Leaderboard from "./LeaderBoard";
import AdminDashboard from "./AdminDashboard";

export default function AppShell({ user, role }) {
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState("game");

    useEffect(() => {
        const userRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserData(snapshot.data());
            }
        });
        return () => unsubscribe();
    }, [user.uid]);

    const handleSignOut = async () => {
        try { await signOut(auth); } catch (err) { console.error(err); }
    };

    const displayName = userData?.displayName || user.displayName || user.email?.split("@")[0] || "Player";
    const isAdmin = role === "admin";

    return (
        <div className="app-shell">
            <header className="app-header">
                <div className="header-brand">
                    <span className="header-title">Project:A22</span>
                </div>
                <nav className="header-nav">
                    <button
                        className={`nav-btn ${activeTab === "game" ? "active" : ""}`}
                        onClick={() => setActiveTab("game")}
                    >
                        Game
                    </button>
                    <button
                        className={`nav-btn ${activeTab === "leaderboard" ? "active" : ""}`}
                        onClick={() => setActiveTab("leaderboard")}
                    >
                        Leaderboard
                    </button>
                    {isAdmin && (
                        <button
                            className={`nav-btn ${activeTab === "admin" ? "active" : ""}`}
                            onClick={() => setActiveTab("admin")}
                        >
                            Admin Dashboard
                        </button>
                    )}
                </nav>
                <div className="header-user">
                    {isAdmin && <span className="admin-badge">ADMIN</span>}
                    <span className="user-greeting">Hello, <strong>{displayName}</strong></span>
                    <button className="btn-signout" onClick={handleSignOut}>Sign Out</button>
                </div>
            </header>

            {activeTab !== "admin" && (
                <div className="profile-banner">
                    <div className="profile-stat">
                        <span className="stat-label">High Score</span>
                        <span className="stat-value gold">{userData?.highscore ?? 0}</span>
                    </div>
                    <div className="profile-stat">
                        <span className="stat-label">Games Played</span>
                        <span className="stat-value">{userData?.games ?? 0}</span>
                    </div>
                </div>
            )}

            <main className="tab-content">
                {activeTab === "game" && <GameFrame />}
                {activeTab === "leaderboard" && <Leaderboard currentUserId={user.uid} />}
                {activeTab === "admin" && isAdmin && <AdminDashboard user={user} />}
            </main>
        </div>
    );
}