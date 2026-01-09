import { useEffect, useState } from "react";
import pals from "./data/pals.json";
import PalCard from "./components/PalCard";
import PalModal from "./components/PalModal";
import BaseAdvisor from "./components/BaseAdvisor";
import BattleAdvisor from "./components/BattleAdvisor";
import Achievements from "./components/Achievements";

const STORAGE_KEY = "revealedPals";
const PALS_DATA_KEY = "customPals";
const THEME_KEY = "selectedTheme";
const ACTIVE_TAB_KEY = "activeTab";
const DEFEATED_BOSSES_KEY = "defeatedBosses";

// Theme colors based on types
const themes = {
    default: { bg: "#ffffff", cardBg: "#f9f9f9", text: "#000000", border: "#ccc" },
    ice: { bg: "#e0f7ff", cardBg: "#b3e5fc", text: "#01579b", border: "#81d4fa" },
    water: { bg: "#1565c0", cardBg: "#1976d2", text: "#ffffff", border: "#0d47a1" },
    ground: { bg: "#8d6e63", cardBg: "#a1887f", text: "#ffffff", border: "#6d4c41" },
    grass: { bg: "#81c784", cardBg: "#a5d6a7", text: "#1b5e20", border: "#66bb6a" },
    fire: { bg: "#ff5722", cardBg: "#ff7043", text: "#ffffff", border: "#e64a19" },
    dark: { bg: "#212121", cardBg: "#424242", text: "#ffffff", border: "#616161" },
    neutral: { bg: "#9e9e9e", cardBg: "#bdbdbd", text: "#212121", border: "#757575" },
    electric: { bg: "#ffd54f", cardBg: "#ffe082", text: "#f57f17", border: "#ffca28" },
    dragon: { bg: "#7b1fa2", cardBg: "#9c27b0", text: "#ffffff", border: "#6a1b9a" }
};

function fuzzyMatch(input, pals) {
    const normalized = input.toLowerCase();
    return pals.find((pal) =>
    pal.name.toLowerCase().includes(normalized)
);
}

export default function App() {
    const [selectedPal, setSelectedPal] = useState(null);
    const [search, setSearch] = useState("");
    const [revealedPals, setRevealedPals] = useState([]);
    const [message, setMessage] = useState("");
    const [allPals, setAllPals] = useState(pals);
    const [theme, setTheme] = useState("default");
    const [typeFilter, setTypeFilter] = useState("");
    const [workFilter, setWorkFilter] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPalData, setNewPalData] = useState({ name: "", type: "", workSuitability: "", gives: "" });
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [activeTab, setActiveTab] = useState("pokedex");
    const [defeatedBosses, setDefeatedBosses] = useState([]);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallButton(true);
        };
        
        window.addEventListener('beforeinstallprompt', handler);
        
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setShowInstallButton(false);
        }
        
        setDeferredPrompt(null);
    };

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if(stored) {
            setRevealedPals(JSON.parse(stored));
        }

        const storedPals = localStorage.getItem(PALS_DATA_KEY);
        if (storedPals) {
            setAllPals([...pals, ...JSON.parse(storedPals)]);
        }

        const storedTheme = localStorage.getItem(THEME_KEY);
        if (storedTheme) {
            setTheme(storedTheme);
        }

        const storedTab = localStorage.getItem(ACTIVE_TAB_KEY);
        if (storedTab) {
            setActiveTab(storedTab);
        }

        const storedDefeatedBosses = localStorage.getItem(DEFEATED_BOSSES_KEY);
        if (storedDefeatedBosses) {
            setDefeatedBosses(JSON.parse(storedDefeatedBosses));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(revealedPals));
    }, [revealedPals]);

    useEffect(() => {
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
    }, [activeTab]);

    const handleSearch = (e) => {
        e.preventDefault();

        const input = search.trim().toLowerCase();
        if (!input) return;

        let pal = allPals.find(
            (p) => p.name.toLowerCase() === input
        );

        if (!pal) {
            pal = fuzzyMatch(input, allPals);
        }

        if (pal && !revealedPals.includes(pal.name)) {
            setRevealedPals([...revealedPals, pal.name]);
            setMessage(`Discovered ${pal.name}!`);
            setSelectedPal(pal);
        } else if (pal && revealedPals.includes(pal.name)) {
            setMessage(`${pal.name} already discovered.`);
            setSelectedPal(pal);
        } else {
            setMessage(`No Pal found. Would you like to add "${search}"?`);
            setNewPalData({ ...newPalData, name: search });
            setShowAddForm(true);
        }

        setSearch("");
    };

        const resetProgress = () => {
            setRevealedPals([]);
            localStorage.removeItem(STORAGE_KEY);
            setMessage("Progress reset.");
    };

    const handleAddPal = () => {
        if (!newPalData.name || !newPalData.type) {
            setMessage("Name and Type are required.");
            return;
        }

        const newPal = {
            id: allPals.length + 1,
            name: newPalData.name,
            type: newPalData.type,
            "work suitability": newPalData.workSuitability || "N/A",
            gives: newPalData.gives || "N/A"
        };

        const customPals = JSON.parse(localStorage.getItem(PALS_DATA_KEY) || "[]");
        customPals.push(newPal);
        localStorage.setItem(PALS_DATA_KEY, JSON.stringify(customPals));

        setAllPals([...allPals, newPal]);
        setRevealedPals([...revealedPals, newPal.name]);
        setMessage(`Added and discovered ${newPal.name}!`);
        setShowAddForm(false);
        setNewPalData({ name: "", type: "", workSuitability: "", gives: "" });
    };

    // Get unique types and work suitabilities for filters
    const uniqueTypes = [...new Set(allPals.flatMap(p => {
        if (typeof p.type === 'string') {
            return p.type.split(',').map(t => t.trim());
        }
        return p.type;
    }))].sort();

    const uniqueWork = [...new Set(allPals.flatMap(p => {
        const work = p["work suitability"] || "";
        return work.split(',').map(w => w.trim().replace(/ Lv\.\d+/g, ''));
    }))].filter(Boolean).sort();

    // Filter pals based on type and work suitability
    const filteredPals = allPals.filter(pal => {
        let matchType = true;
        let matchWork = true;

        if (typeFilter) {
            const palTypes = typeof pal.type === 'string' 
                ? pal.type.split(',').map(t => t.trim().toLowerCase())
                : [pal.type.toLowerCase()];
            matchType = palTypes.includes(typeFilter.toLowerCase());
        }

        if (workFilter) {
            const palWork = (pal["work suitability"] || "").toLowerCase();
            matchWork = palWork.includes(workFilter.toLowerCase());
        }

        return matchType && matchWork;
    });

    // Calculate boss category stats for achievements
    const BOSS_DATA = {
        "Tower Boss": 5,
        "Alpha Pal": 35,
        "Legendary": 5,
        "Raid Boss": 2
    };

    const bossCategories = {};
    Object.keys(BOSS_DATA).forEach(category => {
        bossCategories[category] = {
            total: BOSS_DATA[category],
            defeated: 0
        };
    });

    // Count defeated bosses by category (this would ideally come from BattleAdvisor's BOSS_DATA)
    // For now, we'll do a simple categorization based on boss names
    defeatedBosses.forEach(bossName => {
        if (bossName.includes("Tower") || bossName.includes("&")) {
            bossCategories["Tower Boss"].defeated += 1;
        } else if (bossName.includes("Legendary")) {
            bossCategories["Legendary"].defeated += 1;
        } else if (bossName.includes("Raid Boss") || bossName.includes("Bellanoir")) {
            bossCategories["Raid Boss"].defeated += 1;
        } else if (bossName.includes("Alpha") || bossName.includes("(Alpha)")) {
            bossCategories["Alpha Pal"].defeated += 1;
        }
    });

    const currentTheme = themes[theme] || themes.default;

    return (
        <div style={{ ...styles.container, backgroundColor: currentTheme.bg, color: currentTheme.text }}>
            <h1 style={styles.title}>Pal-Dex</h1>

            {/* Navigation Tabs */}
            <div style={styles.tabContainer}>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === "pokedex" ? styles.activeTab : styles.inactiveTab)
                    }}
                    onClick={() => setActiveTab("pokedex")}
                >
                    Pal-Dex
                </button>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === "advisor" ? styles.activeTab : styles.inactiveTab)
                    }}
                    onClick={() => setActiveTab("advisor")}
                >
                    Base Advisor
                </button>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === "battle" ? styles.activeTab : styles.inactiveTab)
                    }}
                    onClick={() => setActiveTab("battle")}
                >
                    Battle Advisor
                </button>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === "achievements" ? styles.activeTab : styles.inactiveTab)
                    }}
                    onClick={() => setActiveTab("achievements")}
                >
                    Achievements
                </button>
            </div>

            {activeTab === "pokedex" ? (
                <>
                    <div style={styles.controlsRow}>
                <label style={styles.label}>
                    Theme:
                    <select 
                        value={theme} 
                        onChange={(e) => setTheme(e.target.value)}
                        style={styles.select}
                    >
                        <option value="default">Default</option>
                        <option value="ice">Ice</option>
                        <option value="water">Water</option>
                        <option value="ground">Ground</option>
                        <option value="grass">Grass</option>
                        <option value="fire">Fire</option>
                        <option value="dark">Dark</option>
                        <option value="neutral">Neutral</option>
                        <option value="electric">Electric</option>
                        <option value="dragon">Dragon</option>
                    </select>
                </label>

                <label style={styles.label}>
                    Filter by Type:
                    <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">All Types</option>
                        {uniqueTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </label>

                <label style={styles.label}>
                    Filter by Work:
                    <select 
                        value={workFilter} 
                        onChange={(e) => setWorkFilter(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">All Work</option>
                        {uniqueWork.map(work => (
                            <option key={work} value={work}>{work}</option>
                        ))}
                    </select>
                </label>
            </div>

            {showInstallButton && (
                <div style={styles.installBanner}>
                    <span>Install Pal-Dex for offline access!</span>
                    <button onClick={handleInstallClick} style={styles.installButton}>
                        Install App
                    </button>
                </div>
            )}

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

            {showAddForm && (
                <div style={{ ...styles.addForm, backgroundColor: currentTheme.cardBg, border: `2px solid ${currentTheme.border}` }}>
                    <h3>Add New Pal</h3>
                    <input
                        type="text"
                        placeholder="Name"
                        value={newPalData.name}
                        onChange={(e) => setNewPalData({ ...newPalData, name: e.target.value })}
                        style={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="Type (e.g., Fire, Water)"
                        value={newPalData.type}
                        onChange={(e) => setNewPalData({ ...newPalData, type: e.target.value })}
                        style={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="Work Suitability (optional)"
                        value={newPalData.workSuitability}
                        onChange={(e) => setNewPalData({ ...newPalData, workSuitability: e.target.value })}
                        style={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="Gives (optional)"
                        value={newPalData.gives}
                        onChange={(e) => setNewPalData({ ...newPalData, gives: e.target.value })}
                        style={styles.input}
                    />
                    <div style={styles.formButtons}>
                        <button onClick={handleAddPal} style={styles.button}>Add Pal</button>
                        <button onClick={() => setShowAddForm(false)} style={styles.button}>Cancel</button>
                    </div>
                </div>
            )}

            <p style={styles.progress}>
                Discovered {revealedPals.length} / {allPals.length}
            </p>

            <button onClick={resetProgress} style={styles.reset}>
                Reset Progress
            </button>

            <div style={styles.list}>
                {filteredPals.map((pal) => (
                    <PalCard
                    key={pal.id}
                    pal={pal}
                    revealed={revealedPals.includes(pal.name)}
                    onClick={() => setSelectedPal(pal)}
                    theme={currentTheme}
                    />
                ))}
                <PalModal
                pal={selectedPal}
                onClose={() => setSelectedPal(null)}
                theme={currentTheme}
                revealed={selectedPal ? revealedPals.includes(selectedPal.name) : false}
                onAddToCollection={() => {
                    if (selectedPal && !revealedPals.includes(selectedPal.name)) {
                        setRevealedPals([...revealedPals, selectedPal.name]);
                        setMessage(`Added ${selectedPal.name} to collection!`);
                        setSelectedPal(null);
                    }
                }}
                />
             </div>
                </>
            ) : activeTab === "advisor" ? (
                <BaseAdvisor 
                    allPals={allPals}
                    revealedPals={revealedPals}
                    theme={currentTheme}
                />
            ) : activeTab === "battle" ? (
                <BattleAdvisor 
                    allPals={allPals}
                    revealedPals={revealedPals}
                    theme={currentTheme}
                />
            ) : (
                <Achievements 
                    revealedPals={revealedPals}
                    totalPals={allPals.length}
                    defeatedBosses={defeatedBosses}
                    bossCategories={bossCategories}
                    theme={currentTheme}
                />
            )}
            </div>
    );
}


const styles = {
    container: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "sans-serif",
        minHeight: "100vh",
        transition: "all 0.3s ease",
    },
    title: {
        textAlign: "center",
        marginBottom: "1rem",
    },
    tabContainer: {
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1.5rem",
        justifyContent: "center",
        borderBottom: "2px solid #ccc",
        flexWrap: "wrap",
        padding: "0.5rem",
    },
    tab: {
        padding: "0.75rem 1.5rem",
        fontSize: "1rem",
        fontWeight: "bold",
        border: "none",
        borderBottom: "3px solid transparent",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backgroundColor: "transparent",
        whiteSpace: "nowrap",
    },
    activeTab: {
        borderBottomColor: "#007bff",
        color: "#007bff",
    },
    inactiveTab: {
        color: "#666",
    },
    controlsRow: {
        display: "flex",
        gap: "1rem",
        marginBottom: "1rem",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        fontSize: "0.9rem",
        fontWeight: "bold",
    },
    select: {
        padding: "0.5rem",
        fontSize: "1rem",
        borderRadius: "4px",
        border: "1px solid #ccc",
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
        borderRadius: "4px",
        border: "1px solid #ccc",
        marginBottom: "0.5rem",
    },
    button: {
        padding: "0.5rem 1rem",
        cursor: "pointer",
        borderRadius: "4px",
        border: "1px solid #ccc",
        backgroundColor: "#007bff",
        color: "white",
        fontSize: "1rem",
    },
    message: {
        textAlign: "center",
        marginBottom: "0.75rem",
        fontStyle: "italic",
        fontWeight: "bold",
    },
    progress: {
        textAlign: "center",
        marginBottom: "1rem",
        fontSize: "1.1rem",
        fontWeight: "bold",
    },
    reset: {
        padding: "0.5rem 1rem",
        cursor: "pointer",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "4px",
        marginBottom: "1rem",
        display: "block",
        margin: "0 auto 1rem",
    },
    list: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "0.5rem",
    },
    addForm: {
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1rem",
    },
    formButtons: {
        display: "flex",
        gap: "0.5rem",
        justifyContent: "center",
    },
    installBanner: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        backgroundColor: "#4a90e2",
        color: "white",
        borderRadius: "8px",
        marginBottom: "1rem",
        gap: "1rem",
        flexWrap: "wrap",
    },
    installButton: {
        padding: "0.5rem 1rem",
        backgroundColor: "white",
        color: "#4a90e2",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "1rem",
    },
};