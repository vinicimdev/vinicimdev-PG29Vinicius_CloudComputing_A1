import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import LoginForm from "./components/LoginForm";
import AppShell from "./components/AppShell";

async function createUserProfileIfNeeded(firebaseUser) {
    const userRef = doc(db, "users", firebaseUser.uid);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
        await setDoc(userRef, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            photoURL: firebaseUser.photoURL || null,
            createdAt: serverTimestamp(),
            highscore: 0,
            games: 0,
            role: "player",
        });
    }
}

async function getUserRole(uid) {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
        return snapshot.data().role || "player";
    }
    return "player";
}

export default function App() {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState("player");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await createUserProfileIfNeeded(firebaseUser);
                const role = await getUserRole(firebaseUser.uid);
                setUserRole(role);
                setUser(firebaseUser);
            } else {
                setUser(null);
                setUserRole("player");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) return <LoginForm />;
    return <AppShell user={user} role={userRole} />;
}