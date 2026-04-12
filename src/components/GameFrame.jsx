const GAME_URL = import.meta.env.VITE_GAME_URL;

export default function GameFrame() {
    return (
        <div className="game-area">
            <iframe 
                src={GAME_URL}
                title="Project A22"
                className="game-frame"
                allow="fullscreen"
            />
        </div>
    );
}