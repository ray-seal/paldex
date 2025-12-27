import { useEffect, useState } from "react";
import pals from "./data/pals.json";
import PalCard from "./components/PalCard";
import PalModal from "./components/PalModal";

const STORAGE_KEY = "revealedPals";
const [selectedPal, setSelectedPal] = useState(null);

function fuzzyMatch(input, pals) {
    const normalized = input.toLowerCase();
    return pals.find((pal) =>
    pal.name.toLowerCase().includes(normalized)
);
}

export default function App() {
    const [search, setSearch] = useState("");
    const [revealedPals, setRevealedPals] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if(stored) {
            setRevealedPals(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(revealedPals));
    }, [revealedPals]);

    const handleSearch = (e) => {
        e.preventDefault();

        const input = search.trim().toLowerCase();
        if (!input) return;

        let pal = pals.find(
            (p) => p.name.toLowerCase() === input
        );

        if (!pal) {
            pal = fuzzyMatch(input, pals);
        }

        if (pal && !revealedPals.includes(pal.name)) {
            setRevealedPals([...revealedPals, pal.name]);
            setMessage(`Discovered ${pal.name}!`);
        } else if (pal && revealedPals.includes(pal.name)) {
            setMessage(`${pal.name} already discovered.`);
        } else {
            setMessage("No Pal Found.");
        }

        setSearch("");
    };

        const resetProgress = () => {
            setRevealedPals([]);
            localStorage.removeItem(STORAGE_KEY);
            setMessage("Progress reset.");
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Pal-Dex</h1>

            <form onSubmit={handleSearch} style={styles.form}>
                <input
                type="text"
                placeholder="Search Pal Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.input}
                />
                <button type="submit" style={styles.button}>
                    Search
                </button>
            </form>

            {message && <p style={styles.message}>{message}</p>}

            <p style={styles.progress}>
                Discovered {revealedPals.length} / {pals.length}
            </p>

            <button onClick={resetProgress} style={styles.reset}>
                Reset Progress
            </button>

            <div style={styles.list}>
                {pals.map((pal) => (
                    <PalCard
                    key={pal.id}
                    pal={pal}
                    revealed={revealedPals.includes(pal.name)}
                    onClick={() => setSelectedPal(pal)}
                    />
                ))}
                <PalModal
                pal={selectedPal}
                onClose={() => setSelectedPal(null)}
                />
             </div>
            </div>
    );
}


const styles = {
    container: {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "sans-serif",
    },
    title: {
        textAlign: "center",
        marginBottom: "1rem",
    },
    form: {
        display: "flex",
        gap: "0.5rem",
        marginBottom: "0.5rem",
    },
    input: {
        flex: 1,
        padding: "0.5rem",
        fontSize: "1rem",
    },
    button: {
        padding: "0.5rem 1rem",
        cursor: "pointer",
    },
    message: {
        textAlign: "center",
        marginBottom: "0.75rem",
        fontStyle: "italic",
    },
    progress: {
        textAlign: "center",
        marginBottom: "1rem",
    },
    list: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "0.5rem",
    },
};