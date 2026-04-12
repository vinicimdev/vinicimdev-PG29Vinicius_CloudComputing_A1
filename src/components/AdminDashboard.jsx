import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { auth, db } from "../firebase";
import MyBarChart from './MyBarChart';

export default function AdminDashboard({ user }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const currentUserData = users.find(u => u.id === user.uid);

    // if(!loading && currentUserData?.role !== "admin") {
    //     return <p>Access denied.</p>;
    // }

    if (!currentUserData)
    {
        return <p>Loading user...</p>
    }

    if (currentUserData?.role !== "admin")
    {
        return <p>Access denied.</p>;
    }

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (e) {
            throw new Error(`Failed to sign out, ${e}`);
        }
    };

    const topScores = [...users]
        .sort((a, b) => (b.highScore ?? 0) - (a.highScore ?? 0))
        .slice(0, 5)
        .map(u => ({
            name: u.displayName || u.email || "?",
            value: u.highScore ?? 0
        }));

    const topPlayTime = [...users]
        .sort((a, b) => (b.totalPlayMinutes  ?? 0) - (a.totalPlayMinutes  ?? 0))
        .slice(0, 5)
        .map(u => ({
            name: u.displayName || u.email || "?",
            value: u.totalPlayMinutes  ?? 0
        }));

    return (
        <div>
            <h1> Admin Dashboard (wow ur so cool)</h1>

            <button onClick={handleSignOut}>Sign Out</button>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <h2>Top Scores</h2>
                    <MyBarChart data={topScores} dataKey="value" />
                    
                    <h2>Top Play Time</h2>
                    <MyBarChart data={topPlayTime} dataKey="value" />
                </>
            )}
        </div>
    );
} 