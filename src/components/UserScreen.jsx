import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import Leaderboard from "./LeaderBoard";
import GameFrame from "./GameFrame";

export default function UserScreen({ user }) {
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

    const displayName = userData?.displayName || 
                             user.displayName || 
                             user.email?.split("@")[0] || 
                            "Player";

    return (
            <div className="user-screen">
                <header className="app-header">
                    <div className="header-brand">
                        <span className="header-title">Project:A22</span>
                    </div>
                    <div className="header-user">
                        <span className="user-greeting">Hello, <strong>{displayName}</strong></span>
                        <button className="btn-signout" onClick={handleSignOut}>Sign Out</button>
                    </div>
                </header>

                <div className="profile-banner">
                    <div className="profile-stat">
                        <span className="stat-label">High Score</span>
                        <span className="stat-value gold">{userData?.highScore ?? 0}</span>
                    </div>
                    <div className="profile-stat">
                        <span className="stat-label">Games Played</span>
                        <span className="stat-value">{userData?.gamesPlayed ?? 0}</span>
                    </div>
                    <div className="profile-stat">
                        <span className="stat-label">Play Time</span>
                        <span className="stat-value">{userData?.totalPlayMinutes ?? 0} min</span>
                    </div>
                </div>

                <nav className="tab-nav">
                    <button
                        className={`tab-btn ${activeTab === "game" ? "active" : ""}`}
                        onClick={() => setActiveTab("game")}
                    >
                        Play Game
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "leaderboard" ? "active" : ""}`}
                        onClick={() => setActiveTab("leaderboard")}
                    >
                        Leaderboard
                    </button>
                </nav>

                <main className="tab-content">
                    {activeTab === "game" && <GameFrame />}
                    {activeTab === "leaderboard" && <Leaderboard currentUserId={user.uid} />}
                </main>
            </div>
        );
}
