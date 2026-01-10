import { useState, useEffect } from "react";

const DEFEATED_BOSSES_KEY = "defeatedBosses";

// Type effectiveness chart (attacker -> defender)
// 2.0 = super effective, 1.0 = neutral, 0.5 = not very effective, 0.25 = barely effective
const TYPE_EFFECTIVENESS = {
    Fire: { Grass: 2.0, Ice: 2.0, Water: 0.5, Ground: 0.5, Fire: 0.5, Dragon: 0.5 },
    Water: { Fire: 2.0, Ground: 2.0, Water: 0.5, Grass: 0.5, Dragon: 0.5 },
    Grass: { Water: 2.0, Ground: 2.0, Fire: 0.5, Grass: 0.5 },
    Electric: { Water: 2.0, Electric: 0.5, Ground: 0.25, Dragon: 0.5 },
    Ice: { Grass: 2.0, Ground: 2.0, Dragon: 2.0, Fire: 0.5, Water: 0.5, Ice: 0.5 },
    Ground: { Fire: 2.0, Electric: 2.0, Grass: 0.5, Water: 0.5 },
    Dark: { Dark: 2.0, Neutral: 1.0 },
    Dragon: { Dragon: 2.0, Ice: 0.5 },
    Neutral: { Dark: 0.5 }
};

// Boss data with types, recommended levels, and locations
const BOSS_DATA = {
    // Tower Bosses
    "Zoe & Grizzbolt": { 
        types: ["Electric", "Neutral"], 
        level: 15,
        location: "Rayne Syndicate Tower",
        region: "Bamboo Groves",
        category: "Tower Boss"
    },
    "Lily & Lyleen": {
        types: ["Grass"],
        level: 23,
        location: "Free Pal Alliance Tower",
        region: "Windswept Hills",
        category: "Tower Boss"
    },
    "Axel & Orserk": {
        types: ["Dragon", "Electric"],
        level: 31,
        location: "Brothers of the Eternal Pyre Tower",
        region: "Desert",
        category: "Tower Boss"
    },
    "Marcus & Faleris": {
        types: ["Fire"],
        level: 38,
        location: "PAL Genetic Research Unit Tower",
        region: "Volcanic Region",
        category: "Tower Boss"
    },
    "Victor & Shadowbeak": {
        types: ["Dark"],
        level: 50,
        location: "Rayne Syndicate Tower (Final)",
        region: "Northern Snowy Mountains",
        category: "Tower Boss"
    },
    
    // Alpha Pals - Starting Area & Grassy Regions
    "Chillet (Alpha)": {
        types: ["Ice", "Dragon"],
        level: 11,
        location: "Chillet Habitat",
        region: "Eastern Grassy Area",
        category: "Alpha Pal"
    },
    "Kingpaca (Alpha)": {
        types: ["Neutral"],
        level: 23,
        location: "Alpha Kingpaca Territory",
        region: "Eastern Plains",
        category: "Alpha Pal"
    },
    "Mammorest (Alpha)": {
        types: ["Grass"],
        level: 38,
        location: "Alpha Boss Arena",
        region: "Grassy Behemoth Hills",
        category: "Alpha Pal"
    },
    "Mossanda (Alpha)": {
        types: ["Grass"],
        level: 38,
        location: "Boss Arena",
        region: "Verdant Brook",
        category: "Alpha Pal"
    },
    "Elizabee (Alpha)": {
        types: ["Grass"],
        level: 34,
        location: "Elizabee Den",
        region: "Western Grassy Plains",
        category: "Alpha Pal"
    },
    "Warsect (Alpha)": {
        types: ["Grass", "Ground"],
        level: 35,
        location: "Warsect Territory",
        region: "Marsh Island",
        category: "Alpha Pal"
    },
    "Lunaris (Alpha)": {
        types: ["Neutral"],
        level: 32,
        location: "Moonlit Ruins",
        region: "Ancient Ruins",
        category: "Alpha Pal"
    },
    "Verdash (Alpha)": {
        types: ["Grass"],
        level: 35,
        location: "Forest Arena",
        region: "Dense Forest",
        category: "Alpha Pal"
    },
    
    // Alpha Pals - Desert Region
    "Anubis (Alpha)": {
        types: ["Ground"],
        level: 47,
        location: "Desert Ruins",
        region: "Dry Desert",
        category: "Alpha Pal"
    },
    "Blazamut (Alpha)": {
        types: ["Fire"],
        level: 49,
        location: "Blazamut Territory",
        region: "Volcanic Caldera",
        category: "Alpha Pal"
    },
    "Azurobe (Alpha)": {
        types: ["Dragon"],
        level: 41,
        location: "Dragon Territory",
        region: "Desert Canyon",
        category: "Alpha Pal"
    },
    "Menasting (Alpha)": {
        types: ["Dark", "Ground"],
        level: 44,
        region: "Deep Desert",
        location: "Menasting Territory",
        category: "Alpha Pal"
    },
    
    // Alpha Pals - Volcanic Region
    "Suzaku (Alpha)": {
        types: ["Fire"],
        level: 45,
        location: "Volcanic Peak",
        region: "Mount Obsidian",
        category: "Alpha Pal"
    },
    "Jormuntide (Alpha)": {
        types: ["Water", "Dragon"],
        level: 45,
        location: "Lake Territory",
        region: "Sealed Realm of the Thunder Dragon",
        category: "Alpha Pal"
    },
    "Relaxaurus (Alpha)": {
        types: ["Dragon", "Water"],
        level: 43,
        location: "Coastal Territory",
        region: "Northeastern Beach",
        category: "Alpha Pal"
    },
    "Penking (Alpha)": {
        types: ["Water", "Ice"],
        level: 15,
        location: "Frozen Lake",
        region: "Icy Weasel Hill",
        category: "Alpha Pal"
    },
    
    // Alpha Pals - Snow/Ice Region
    "Frostallion (Alpha)": {
        types: ["Ice"],
        level: 50,
        location: "Frozen Tundra",
        region: "Northern Snowy Mountains",
        category: "Alpha Pal"
    },
    "Sibelyx (Alpha)": {
        types: ["Ice"],
        level: 48,
        location: "Icy Territory",
        region: "Land of Absolute Zero",
        category: "Alpha Pal"
    },
    "Cryolinx (Alpha)": {
        types: ["Ice", "Dragon"],
        level: 48,
        location: "Frozen Arena",
        region: "Frozen Mountain Pass",
        category: "Alpha Pal"
    },
    "Reptyro (Alpha)": {
        types: ["Fire", "Ground"],
        level: 41,
        location: "Rocky Territory",
        region: "Scorching Mineshaft",
        category: "Alpha Pal"
    },
    
    // Alpha Pals - Island Regions
    "Quivern (Alpha)": {
        types: ["Dragon"],
        level: 33,
        location: "Island Peak",
        region: "Sealed Realm of the Winged Tyrant",
        category: "Alpha Pal"
    },
    "Elphidran (Alpha)": {
        types: ["Dragon"],
        level: 27,
        location: "Dragon Territory",
        region: "Twilight Dunes",
        category: "Alpha Pal"
    },
    "Wumpo (Alpha)": {
        types: ["Ice"],
        level: 38,
        location: "Ice Arena",
        region: "Hypocrite Hill",
        category: "Alpha Pal"
    },
    "Bushi (Alpha)": {
        types: ["Fire"],
        level: 23,
        location: "Fire Territory",
        region: "Sealed Realm of the Swordmaster",
        category: "Alpha Pal"
    },
    
    // Alpha Pals - Dark/Cave Regions
    "Astegon (Alpha)": {
        types: ["Dark", "Dragon"],
        level: 48,
        location: "Dark Cavern",
        region: "Destroyed Mineshaft",
        category: "Alpha Pal"
    },
    "Grizzbolt (Alpha)": {
        types: ["Electric"],
        level: 29,
        location: "Electric Territory",
        region: "Sealed Realm of the Guardian",
        category: "Alpha Pal"
    },
    "Lyleen (Alpha)": {
        types: ["Grass"],
        level: 32,
        location: "Flower Field",
        region: "Moonless Shore",
        category: "Alpha Pal"
    },
    "Beakon (Alpha)": {
        types: ["Electric"],
        level: 43,
        location: "Electric Peak",
        region: "Thunder Mountain",
        category: "Alpha Pal"
    },
    
    // Legendary/Raid Pals
    "Jetragon (Legendary)": {
        types: ["Dragon"],
        level: 50,
        location: "Sky High Mountain Peak",
        region: "Northeastern Mountains",
        category: "Legendary"
    },
    "Necromus (Legendary)": {
        types: ["Dark"],
        level: 50,
        location: "Dark Altar",
        region: "Dessicated Desert",
        category: "Legendary"
    },
    "Paladius (Legendary)": {
        types: ["Neutral"],
        level: 50,
        location: "Sacred Mountain",
        region: "Iceberg Mineshaft",
        category: "Legendary"
    },
    "Frostallion Noct (Legendary)": {
        types: ["Dark"],
        level: 50,
        location: "Dark Frozen Peak",
        region: "Northern Mountains",
        category: "Legendary"
    },
    "Shadowbeak (Legendary)": {
        types: ["Dark"],
        level: 47,
        location: "Shadow Realm",
        region: "Sealed Realm of the Invincible",
        category: "Legendary"
    },
    "Bellanoir (Raid Boss)": {
        types: ["Dark"],
        level: 50,
        location: "Raid Portal",
        region: "Summoned via Slab",
        category: "Raid Boss"
    },
    "Bellanoir Libero (Raid Boss)": {
        types: ["Dark"],
        level: 60,
        location: "Raid Portal",
        region: "Summoned via Slab",
        category: "Raid Boss"
    },
};

export { BOSS_DATA };

export default function BattleAdvisor({ allPals, revealedPals, theme }) {
    const [selectedBoss, setSelectedBoss] = useState("");
    const [teamSize, setTeamSize] = useState(5);
    const [recommendations, setRecommendations] = useState(null);
    const [defeatedBosses, setDefeatedBosses] = useState([]);

    // Load defeated bosses from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(DEFEATED_BOSSES_KEY);
        if (stored) {
            setDefeatedBosses(JSON.parse(stored));
        }
    }, []);

    // Save defeated bosses to localStorage
    useEffect(() => {
        localStorage.setItem(DEFEATED_BOSSES_KEY, JSON.stringify(defeatedBosses));
    }, [defeatedBosses]);

    const toggleBossDefeated = (bossName) => {
        setDefeatedBosses(prev => 
            prev.includes(bossName)
                ? prev.filter(b => b !== bossName)
                : [...prev, bossName]
        );
    };

    const resetAllProgress = () => {
        if (window.confirm("Are you sure you want to reset all boss completion progress?")) {
            setDefeatedBosses([]);
            localStorage.removeItem(DEFEATED_BOSSES_KEY);
        }
    };

    const parseWorkSuitability = (workString) => {
        if (!workString) return {};
        const works = {};
        const parts = workString.split(',').map(s => s.trim());
        
        parts.forEach(part => {
            const match = part.match(/(.+?)\s+Lv\.(\d+)/);
            if (match) {
                const workType = match[1].trim();
                const level = parseInt(match[2]);
                works[workType] = level;
            }
        });
        
        return works;
    };

    const calculateTypeEffectiveness = (attackerTypes, defenderTypes) => {
        let totalEffectiveness = 1.0;
        
        // Parse types if they're comma-separated strings
        const attackerTypeList = typeof attackerTypes === 'string' 
            ? attackerTypes.split(',').map(t => t.trim())
            : attackerTypes;
        
        const defenderTypeList = typeof defenderTypes === 'string'
            ? defenderTypes.split(',').map(t => t.trim())
            : defenderTypes;

        attackerTypeList.forEach(attackerType => {
            defenderTypeList.forEach(defenderType => {
                const effectiveness = TYPE_EFFECTIVENESS[attackerType]?.[defenderType] || 1.0;
                totalEffectiveness *= effectiveness;
            });
        });

        return totalEffectiveness;
    };

    const calculateRecommendations = () => {
        if (!selectedBoss) {
            setRecommendations(null);
            return;
        }

        const boss = BOSS_DATA[selectedBoss];
        const collectedPals = allPals.filter(pal => revealedPals.includes(pal.name));

        if (collectedPals.length === 0) {
            setRecommendations({ 
                error: "You haven't discovered any Pals yet! Search for Pals to build your collection." 
            });
            return;
        }

        // Score each pal based on type effectiveness
        const palScores = collectedPals.map(pal => {
            const palTypes = typeof pal.type === 'string' 
                ? pal.type.split(',').map(t => t.trim())
                : [pal.type];

            // Calculate offensive advantage
            const offensiveScore = calculateTypeEffectiveness(palTypes, boss.types);
            
            // Calculate defensive resistance (inverted - we want to resist boss's attacks)
            const defensiveScore = calculateTypeEffectiveness(boss.types, palTypes);
            const resistanceScore = defensiveScore <= 0.5 ? 1.5 : (defensiveScore >= 2.0 ? 0.5 : 1.0);

            // Work suitability bonus (combat-relevant skills)
            const works = parseWorkSuitability(pal["work suitability"]);
            const workBonus = Object.keys(works).length * 0.1;

            // Calculate overall score
            const totalScore = (offensiveScore * 2) + resistanceScore + workBonus;

            // Determine effectiveness description
            let effectiveness = "Neutral";
            let color = "#666";
            if (offensiveScore >= 2.0) {
                effectiveness = "Super Effective!";
                color = "#28a745";
            } else if (offensiveScore >= 1.5) {
                effectiveness = "Effective";
                color = "#17a2b8";
            } else if (offensiveScore <= 0.5) {
                effectiveness = "Not Effective";
                color = "#dc3545";
            }

            // Recommended level (boss level +/- based on type advantage)
            let recommendedLevel = boss.level;
            if (offensiveScore >= 2.0) {
                recommendedLevel = Math.max(1, boss.level - 5);
            } else if (offensiveScore <= 0.75) {
                recommendedLevel = boss.level + 5;
            }

            return {
                pal,
                score: totalScore,
                offensiveScore,
                defensiveScore,
                effectiveness,
                effectivenessColor: color,
                recommendedLevel
            };
        });

        // Sort by score and take top N
        palScores.sort((a, b) => b.score - a.score);
        const topTeam = palScores.slice(0, teamSize);

        setRecommendations({
            boss,
            team: topTeam,
            allScores: palScores
        });
    };

    useEffect(() => {
        calculateRecommendations();
    }, [selectedBoss, teamSize, revealedPals]);

    // Calculate completion stats
    const totalBosses = Object.keys(BOSS_DATA).length;
    const defeatedCount = defeatedBosses.length;
    const completionPercentage = Math.round((defeatedCount / totalBosses) * 100);

    // Category stats
    const categoryStats = {};
    Object.entries(BOSS_DATA).forEach(([name, data]) => {
        const category = data.category;
        if (!categoryStats[category]) {
            categoryStats[category] = { total: 0, defeated: 0 };
        }
        categoryStats[category].total += 1;
        if (defeatedBosses.includes(name)) {
            categoryStats[category].defeated += 1;
        }
    });

    const styles = {
        container: {
            padding: "1rem",
            maxWidth: "900px",
            margin: "0 auto",
        },
        section: {
            backgroundColor: theme.cardBg,
            border: `2px solid ${theme.border}`,
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
        },
        sectionTitle: {
            fontSize: "1.3rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: theme.text,
        },
        bossSelector: {
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
        },
        select: {
            padding: "0.75rem",
            fontSize: "1rem",
            borderRadius: "6px",
            border: `2px solid ${theme.border}`,
            backgroundColor: theme.bg,
            color: theme.text,
            cursor: "pointer",
        },
        bossInfo: {
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: theme.bg,
            borderRadius: "6px",
            border: `1px solid ${theme.border}`,
        },
        bossInfoRow: {
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
            fontSize: "0.95rem",
        },
        label: {
            fontWeight: "bold",
            color: theme.text,
        },
        teamSizeSelector: {
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginTop: "1rem",
        },
        slider: {
            flex: 1,
            height: "6px",
        },
        palCard: {
            backgroundColor: theme.bg,
            border: `2px solid ${theme.border}`,
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
        },
        palHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
        },
        palName: {
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: theme.text,
        },
        palType: {
            fontSize: "0.85rem",
            padding: "0.25rem 0.75rem",
            borderRadius: "4px",
            backgroundColor: "#e0e0e0",
            color: "#333",
        },
        effectivenessBadge: {
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "0.75rem",
        },
        statsRow: {
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.9rem",
            padding: "0.5rem 0",
            borderTop: `1px solid ${theme.border}`,
        },
        recommendedLevel: {
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#007bff",
        },
        infoBox: {
            padding: "1rem",
            backgroundColor: "#d1ecf1",
            color: "#0c5460",
            borderRadius: "6px",
            marginBottom: "1rem",
            border: "1px solid #bee5eb",
        },
        emptyState: {
            textAlign: "center",
            padding: "2rem",
            color: theme.text,
            fontSize: "1.1rem",
        },
        typeChip: {
            display: "inline-block",
            padding: "0.25rem 0.5rem",
            margin: "0.25rem",
            borderRadius: "4px",
            fontSize: "0.85rem",
            fontWeight: "bold",
            backgroundColor: "#6c757d",
            color: "white",
        },
        statsSection: {
            backgroundColor: theme.cardBg,
            border: `2px solid ${theme.border}`,
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
        },
        statsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginTop: "1rem",
        },
        statCard: {
            backgroundColor: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: "6px",
            padding: "1rem",
            textAlign: "center",
        },
        statNumber: {
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#007bff",
            marginBottom: "0.25rem",
        },
        statLabel: {
            fontSize: "0.9rem",
            color: theme.text,
            fontWeight: "500",
        },
        progressBar: {
            width: "100%",
            height: "24px",
            backgroundColor: "#e0e0e0",
            borderRadius: "12px",
            overflow: "hidden",
            marginTop: "1rem",
        },
        progressFill: {
            height: "100%",
            backgroundColor: "#28a745",
            transition: "width 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.85rem",
        },
        checkboxContainer: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem",
            backgroundColor: theme.bg,
            borderRadius: "6px",
            marginTop: "1rem",
            border: `1px solid ${theme.border}`,
            cursor: "pointer",
            transition: "all 0.2s ease",
        },
        checkbox: {
            width: "20px",
            height: "20px",
            cursor: "pointer",
        },
        defeatedBadge: {
            display: "inline-block",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontWeight: "bold",
            backgroundColor: "#28a745",
            color: "white",
            marginLeft: "0.5rem",
        },
        resetButton: {
            padding: "0.5rem 1rem",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "bold",
            marginTop: "1rem",
        },
        categoryStatRow: {
            display: "flex",
            justifyContent: "space-between",
            padding: "0.5rem",
            borderBottom: `1px solid ${theme.border}`,
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: theme.text }}>
                Battle Team Advisor
            </h2>

            <div style={styles.infoBox}>
                <strong>How to use:</strong> Select a boss you want to battle. The advisor will recommend 
                the best team from your collected Pals based on type advantages and suggest appropriate levels.
                Check off bosses as you defeat them to track your progress!
            </div>

            {/* Completion Stats */}
            <div style={styles.statsSection}>
                <div style={styles.sectionTitle}>Boss Completion Progress</div>
                
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${completionPercentage}%` }}>
                        {completionPercentage > 10 ? `${completionPercentage}%` : ''}
                    </div>
                </div>

                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{defeatedCount}/{totalBosses}</div>
                        <div style={styles.statLabel}>Total Bosses Defeated</div>
                    </div>
                    {Object.entries(categoryStats).map(([category, stats]) => (
                        <div key={category} style={styles.statCard}>
                            <div style={styles.statNumber}>{stats.defeated}/{stats.total}</div>
                            <div style={styles.statLabel}>{category}</div>
                        </div>
                    ))}
                </div>

                <button onClick={resetAllProgress} style={styles.resetButton}>
                    Reset All Progress
                </button>
            </div>

            {/* Boss Selection */}
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Select Boss/Enemy</div>
                <div style={styles.bossSelector}>
                    <select
                        value={selectedBoss}
                        onChange={(e) => setSelectedBoss(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">-- Choose a Boss --</option>
                        <optgroup label="🏰 Tower Bosses">
                            <option value="Zoe & Grizzbolt">Zoe & Grizzbolt (Lv.15) - Bamboo Groves</option>
                            <option value="Lily & Lyleen">Lily & Lyleen (Lv.23) - Windswept Hills</option>
                            <option value="Axel & Orserk">Axel & Orserk (Lv.31) - Desert</option>
                            <option value="Marcus & Faleris">Marcus & Faleris (Lv.38) - Volcanic Region</option>
                            <option value="Victor & Shadowbeak">Victor & Shadowbeak (Lv.50) - Northern Snowy Mountains</option>
                        </optgroup>
                        <optgroup label="🌿 Alpha Pals - Grassy Regions (Lv.11-38)">
                            <option value="Chillet (Alpha)">Chillet (Lv.11) - Eastern Grassy Area</option>
                            <option value="Kingpaca (Alpha)">Kingpaca (Lv.23) - Eastern Plains</option>
                            <option value="Lunaris (Alpha)">Lunaris (Lv.32) - Ancient Ruins</option>
                            <option value="Elizabee (Alpha)">Elizabee (Lv.34) - Western Grassy Plains</option>
                            <option value="Warsect (Alpha)">Warsect (Lv.35) - Marsh Island</option>
                            <option value="Verdash (Alpha)">Verdash (Lv.35) - Dense Forest</option>
                            <option value="Mammorest (Alpha)">Mammorest (Lv.38) - Grassy Behemoth Hills</option>
                            <option value="Mossanda (Alpha)">Mossanda (Lv.38) - Verdant Brook</option>
                        </optgroup>
                        <optgroup label="🏜️ Alpha Pals - Desert Region (Lv.41-49)">
                            <option value="Azurobe (Alpha)">Azurobe (Lv.41) - Desert Canyon</option>
                            <option value="Menasting (Alpha)">Menasting (Lv.44) - Deep Desert</option>
                            <option value="Anubis (Alpha)">Anubis (Lv.47) - Dry Desert</option>
                            <option value="Blazamut (Alpha)">Blazamut (Lv.49) - Volcanic Caldera</option>
                        </optgroup>
                        <optgroup label="🔥 Alpha Pals - Volcanic/Water Regions (Lv.15-45)">
                            <option value="Penking (Alpha)">Penking (Lv.15) - Icy Weasel Hill</option>
                            <option value="Bushi (Alpha)">Bushi (Lv.23) - Sealed Realm of the Swordmaster</option>
                            <option value="Elphidran (Alpha)">Elphidran (Lv.27) - Twilight Dunes</option>
                            <option value="Lyleen (Alpha)">Lyleen (Lv.32) - Moonless Shore</option>
                            <option value="Quivern (Alpha)">Quivern (Lv.33) - Sealed Realm of the Winged Tyrant</option>
                            <option value="Reptyro (Alpha)">Reptyro (Lv.41) - Scorching Mineshaft</option>
                            <option value="Relaxaurus (Alpha)">Relaxaurus (Lv.43) - Northeastern Beach</option>
                            <option value="Jormuntide (Alpha)">Jormuntide (Lv.45) - Sealed Realm of the Thunder Dragon</option>
                            <option value="Suzaku (Alpha)">Suzaku (Lv.45) - Mount Obsidian</option>
                        </optgroup>
                        <optgroup label="❄️ Alpha Pals - Ice/Snow Region (Lv.38-50)">
                            <option value="Wumpo (Alpha)">Wumpo (Lv.38) - Hypocrite Hill</option>
                            <option value="Cryolinx (Alpha)">Cryolinx (Lv.48) - Frozen Mountain Pass</option>
                            <option value="Sibelyx (Alpha)">Sibelyx (Lv.48) - Land of Absolute Zero</option>
                            <option value="Frostallion (Alpha)">Frostallion (Lv.50) - Northern Snowy Mountains</option>
                        </optgroup>
                        <optgroup label="⚡ Alpha Pals - Electric/Dark Regions (Lv.29-48)">
                            <option value="Grizzbolt (Alpha)">Grizzbolt (Lv.29) - Sealed Realm of the Guardian</option>
                            <option value="Beakon (Alpha)">Beakon (Lv.43) - Thunder Mountain</option>
                            <option value="Astegon (Alpha)">Astegon (Lv.48) - Destroyed Mineshaft</option>
                        </optgroup>
                        <optgroup label="✨ Legendary Pals (Lv.47-50)">
                            <option value="Shadowbeak (Legendary)">Shadowbeak (Lv.47) - Sealed Realm of the Invincible</option>
                            <option value="Jetragon (Legendary)">Jetragon (Lv.50) - Northeastern Mountains</option>
                            <option value="Necromus (Legendary)">Necromus (Lv.50) - Dessicated Desert</option>
                            <option value="Paladius (Legendary)">Paladius (Lv.50) - Iceberg Mineshaft</option>
                            <option value="Frostallion Noct (Legendary)">Frostallion Noct (Lv.50) - Northern Mountains</option>
                        </optgroup>
                        <optgroup label="👹 Raid Bosses (Lv.50-60)">
                            <option value="Bellanoir (Raid Boss)">Bellanoir (Lv.50) - Summoned via Slab</option>
                            <option value="Bellanoir Libero (Raid Boss)">Bellanoir Libero (Lv.60) - Summoned via Slab</option>
                        </optgroup>
                    </select>

                    {selectedBoss && (
                        <div style={styles.bossInfo}>
                            <div style={styles.bossInfoRow}>
                                <span style={styles.label}>Boss:</span>
                                <span>
                                    {selectedBoss}
                                    {defeatedBosses.includes(selectedBoss) && (
                                        <span style={styles.defeatedBadge}>✓ DEFEATED</span>
                                    )}
                                </span>
                            </div>
                            <div style={styles.bossInfoRow}>
                                <span style={styles.label}>Category:</span>
                                <span>{BOSS_DATA[selectedBoss].category}</span>
                            </div>
                            <div style={styles.bossInfoRow}>
                                <span style={styles.label}>Level:</span>
                                <span>{BOSS_DATA[selectedBoss].level}</span>
                            </div>
                            <div style={styles.bossInfoRow}>
                                <span style={styles.label}>Type(s):</span>
                                <span>
                                    {BOSS_DATA[selectedBoss].types.map(type => (
                                        <span key={type} style={styles.typeChip}>{type}</span>
                                    ))}
                                </span>
                            </div>
                            <div style={styles.bossInfoRow}>
                                <span style={styles.label}>Region:</span>
                                <span>{BOSS_DATA[selectedBoss].region}</span>
                            </div>
                            <div style={styles.bossInfoRow}>
                                <span style={styles.label}>Location:</span>
                                <span>{BOSS_DATA[selectedBoss].location}</span>
                            </div>

                            {/* Defeated Checkbox */}
                            <div 
                                style={styles.checkboxContainer}
                                onClick={() => toggleBossDefeated(selectedBoss)}
                            >
                                <input
                                    type="checkbox"
                                    checked={defeatedBosses.includes(selectedBoss)}
                                    onChange={() => {}}
                                    style={styles.checkbox}
                                />
                                <span style={{ fontWeight: "bold", fontSize: "1rem" }}>
                                    {defeatedBosses.includes(selectedBoss) 
                                        ? "Mark as Not Defeated" 
                                        : "Mark as Defeated"}
                                </span>
                            </div>
                        </div>
                    )}

                    <div style={styles.teamSizeSelector}>
                        <span style={styles.label}>Team Size:</span>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={teamSize}
                            onChange={(e) => setTeamSize(parseInt(e.target.value))}
                            style={styles.slider}
                        />
                        <span style={{ fontWeight: "bold", minWidth: "60px" }}>{teamSize} Pals</span>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            {!selectedBoss ? (
                <div style={styles.emptyState}>
                    Select a boss to get team recommendations.
                </div>
            ) : recommendations?.error ? (
                <div style={styles.emptyState}>
                    {recommendations.error}
                </div>
            ) : recommendations?.team ? (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>
                        Recommended Team ({recommendations.team.length}/{teamSize})
                    </div>

                    {recommendations.team.map(({ pal, effectiveness, effectivenessColor, offensiveScore, recommendedLevel }, index) => (
                        <div key={pal.id} style={styles.palCard}>
                            <div style={styles.palHeader}>
                                <div>
                                    <div style={styles.palName}>
                                        {index + 1}. {pal.name}
                                    </div>
                                    <div style={{ fontSize: "0.85rem", color: theme.text, marginTop: "0.25rem" }}>
                                        {pal.type}
                                    </div>
                                </div>
                            </div>

                            <div style={{ 
                                ...styles.effectivenessBadge, 
                                backgroundColor: effectivenessColor,
                                color: "white"
                            }}>
                                {effectiveness} ({offensiveScore}x damage)
                            </div>

                            <div style={styles.statsRow}>
                                <span style={styles.label}>Recommended Level:</span>
                                <span style={styles.recommendedLevel}>Level {recommendedLevel}+</span>
                            </div>

                            <div style={styles.statsRow}>
                                <span style={styles.label}>Work Skills:</span>
                                <span style={{ fontSize: "0.85rem" }}>
                                    {pal["work suitability"] || "None"}
                                </span>
                            </div>
                        </div>
                    ))}

                    <div style={{ ...styles.infoBox, marginTop: "1.5rem" }}>
                        <strong>💡 Tip:</strong> Type advantages deal 2x damage! Bring Pals with super effective types 
                        and ensure they're at or above the recommended level for best results.
                    </div>
                </div>
            ) : null}
        </div>
    );
}
