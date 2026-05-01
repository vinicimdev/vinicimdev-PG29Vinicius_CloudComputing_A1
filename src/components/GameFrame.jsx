import { useEffect, useRef, useState } from "react";
import { auth } from "../firebase";

const GAME_URL = import.meta.env.VITE_GAME_URL || null;
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || "";

export default function GameFrame() {
    const iframeRef = useRef(null);
    const retryIntervalRef = useRef(null);
    const [authStatus, setAuthStatus] = useState("waiting");

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.type === "firebase-auth-ack") {
                console.log("[GameFrame] Unity acknowledged auth handshake");
                setAuthStatus("acked");
                // Stop retrying once we get the ack
                if (retryIntervalRef.current) {
                    clearInterval(retryIntervalRef.current);
                    retryIntervalRef.current = null;
                }
            }
        };
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
            if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);
        };
    }, []);

    const sendAuthToUnity = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.warn("[GameFrame] No user logged in");
                setAuthStatus("error");
                return;
            }

            const idToken = await user.getIdToken();
            const payload = {
                type: "firebase-auth",
                uid: user.uid,
                idToken,
                displayName: user.displayName || user.email?.split("@")[0] || "Player",
                projectId: FIREBASE_PROJECT_ID,
            };

            iframeRef.current?.contentWindow?.postMessage(payload, "*");
            console.log("[GameFrame] Sent auth to Unity iframe");
        } catch (err) {
            console.error("[GameFrame] Failed to send auth:", err);
            setAuthStatus("error");
        }
    };

    const handleIframeLoad = () => {
        setAuthStatus("sent");

        // Send immediately
        sendAuthToUnity();

        // Retry every 1.5s until we get the ack
        if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = setInterval(() => {
            sendAuthToUnity();
        }, 1500);

        // Give up after 30 seconds
        setTimeout(() => {
            if (retryIntervalRef.current) {
                clearInterval(retryIntervalRef.current);
                retryIntervalRef.current = null;
                setAuthStatus((prev) => prev === "acked" ? prev : "timeout");
            }
        }, 30000);
    };

    if (!GAME_URL) {
        return (
            <div className="game-placeholder">
                <div className="placeholder-inner">
                    <span className="placeholder-icon">🎮</span>
                    <h3>Game Not Configured</h3>
                    <p>Set <code>VITE_GAME_URL</code> in your <code>.env</code> file.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="game-area">
            <div className="game-status">
                {authStatus === "waiting" && <span>Loading game...</span>}
                {authStatus === "sent" && <span>Connecting to game (retrying)...</span>}
                {authStatus === "acked" && <span style={{ color: "#10b981" }}>Game ready</span>}
                {authStatus === "timeout" && <span style={{ color: "#f59e0b" }}>Connection timeout — try refreshing</span>}
                {authStatus === "error" && <span style={{ color: "#ef4444" }}>Auth error — check console</span>}
            </div>
            <iframe
                ref={iframeRef}
                src={GAME_URL}
                title="Flappy Bird"
                className="game-frame"
                allow="fullscreen"
                onLoad={handleIframeLoad}
            />
        </div>
    );
}