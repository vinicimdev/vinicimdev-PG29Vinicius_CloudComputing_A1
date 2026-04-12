import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import LoginForm from "./components/LoginForm";
import GamePortal from "./components/GamePortal";
import AdminDashboard from "./components/AdminDashboard";
import UserScreen from "./components/UserScreen";

async function createUserProfileIfNeed(firebaseUser) {
    const userRef = doc(db, "users", firebaseUser.uid);
    const snapshot = await getDoc(userRef);
    
    if (!snapshot.exists) {
        await setDoc(userRef, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || "Player",
            photoURL: firebaseUser.photoURL || null,
            createdAt: serverTimestamp(),
            highscore: 0,
            gamesPlayed: 0,
            role: "user"
        })
        console.log(`User ${firebaseUser.email} created.`)
    }
}

async function getUserRole(uid) {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);
    if(snapshot.exists()) {
        return snapshot.data().role || "Player";
    }
    return "user"
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState("user");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await createUserProfileIfNeed(firebaseUser);
                const role = await getUserRole(firebaseUser.uid);
                setUserRole(role);
                setUser(firebaseUser);
            } else {
                setUser(null);
                setUserRole("user");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div>
                <p>Checking auth state...</p>
            </div>
        )
    }
    
    if (!user) return <LoginForm />;
    if (userRole === "admin") return <AdminDashboard user={user} />;
    return <UserScreen user={user} />;
}
