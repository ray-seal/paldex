import { useState, useEffect } from "react";

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
    "Zoe and Grizzbolt": { 
        types: ["Electric", "Neutral"], 
        level: 15,
        location: "Rayne Syndicate Tower",
        description: "First tower boss - Electric/Neutral type"
    },
    "Lily and Lyleen": {
        types: ["Grass"],
        level: 23,
        location: "Free Pal Alliance Tower",
        description: "Second tower boss - Pure Grass type"
    },
    "Axel and Orserk": {
        types: ["Dragon", "Electric"],
        level: 31,
        location: "Brothers of the Eternal Pyre Tower",
        description: "Third tower boss - Dragon/Electric hybrid"
    },
    "Marcus and Faleris": {
        types: ["Fire"],
        level: 38,
        location: "PAL Genetic Research Unit Tower",
        description: "Fourth tower boss - Pure Fire type"
    },
    "Victor and Shadowbeak": {
        types: ["Dark"],
        level: 50,
        location: "Rayne Syndicate Tower (Final)",
        description: "Final tower boss - Pure Dark type"
    },
    "Mammorest": {
        types: ["Grass"],
        level: 13,
        location: "World Boss",
        description: "Grass type world boss"
    },
    "Kingpaca": {
        types: ["Neutral"],
        level: 18,
        location: "World Boss",
        description: "Neutral type alpha boss"
    },
    "Bushi": {
        types: ["Fire"],
        level: 23,
        location: "World Boss",
        description: "Fire type world boss"
    },
    "Wumpo": {
        types: ["Ice"],
        level: 28,
        location: "World Boss",
        description: "Ice type world boss"
    },
    "Blazamut": {
        types: ["Fire"],
        level: 49,
        location: "World Boss",
        description: "High-level Fire type"
    },
    "Frostallion": {
        types: ["Ice"],
        level: 50,
        location: "Legendary",
        description: "Ice legendary"
    },
    "Jetragon": {
        types: ["Dragon"],
        level: 50,
        location: "Legendary",
        description: "Dragon legendary"
    },
    "Necromus": {
        types: ["Dark"],
        level: 50,
        location: "Legendary",
        description: "Dark legendary"
    },
    "Paladius": {
        types: ["Neutral"],
        level: 50,
        location: "Legendary",
        description: "Neutral legendary"
    }
};

export default function BattleAdvisor({ allPals, revealedPals, theme }) {
    const [selectedBoss, setSelectedBoss] = useState("");
    const [teamSize, setTeamSize] = useState(5);
    const [recommendations, setRecommendations] = useState(null);

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
    };

    return (
        <div style={styles.container}>
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: theme.text }}>
                Battle Team Advisor
            </h2>

            <div style={styles.infoBox}>
                <strong>How to use:</strong> Select a boss you want to battle. The advisor will recommend 
                the best team from your collected Pals based on type advantages and suggest appropriate levels.
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
                        <optgroup label="Tower Bosses">
                            <option value="Zoe and Grizzbolt">Zoe and Grizzbolt (Lv.15)</option>
                            <option value="Lily and Lyleen">Lily and Lyleen (Lv.23)</option>
                            <option value="Axel and Orserk">Axel and Orserk (Lv.31)</option>
                            <option value="Marcus and Faleris">Marcus and Faleris (Lv.38)</option>
                            <option value="Victor and Shadowbeak">Victor and Shadowbeak (Lv.50)</option>
                        </optgroup>
                        <optgroup label="World Bosses">
                            <option value="Mammorest">Mammorest (Lv.13)</option>
                            <option value="Kingpaca">Kingpaca (Lv.18)</option>
                            <option value="Bushi">Bushi (Lv.23)</option>
                            <option value="Wumpo">Wumpo (Lv.28)</option>
                            <option value="Blazamut">Blazamut (Lv.49)</option>
                        </optgroup>
                        <optgroup label="Legendary Pals">
                            <option value="Frostallion">Frostallion (Lv.50)</option>
                            <option value="Jetragon">Jetragon (Lv.50)</option>
                            <option value="Necromus">Necromus (Lv.50)</option>
                            <option value="Paladius">Paladius (Lv.50)</option>
                        </optgroup>
                    </select>

                    {selectedBoss && (
                        <div style={styles.bossInfo}>
                            <div style={styles.bossInfoRow}>
                                <span style={styles.label}>Boss:</span>
                                <span>{selectedBoss}</span>
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
                                <span style={styles.label}>Location:</span>
                                <span>{BOSS_DATA[selectedBoss].location}</span>
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
