import { useState, useEffect } from "react";

// Base structures and their required work suitabilities
const BASE_STRUCTURES = {
    // Plantations & Farms
    "Wheat Plantation": { workTypes: ["Planting", "Watering", "Gathering"], priority: 1 },
    "Berry Plantation": { workTypes: ["Planting", "Watering", "Gathering"], priority: 1 },
    "Tomato Plantation": { workTypes: ["Planting", "Watering", "Gathering"], priority: 1 },
    "Lettuce Plantation": { workTypes: ["Planting", "Watering", "Gathering"], priority: 1 },
    "Potato Plantation": { workTypes: ["Planting", "Watering", "Gathering"], priority: 1 },
    "Ranch": { workTypes: ["Farming"], priority: 1 },
    "Chicken Ranch": { workTypes: ["Farming"], priority: 1 },
    
    // Resource Gathering Sites
    "Logging Site": { workTypes: ["Lumbering"], priority: 2 },
    "Stone Pit": { workTypes: ["Mining"], priority: 2 },
    "Ore Mining Site": { workTypes: ["Mining"], priority: 2 },
    "Coal Mining Site": { workTypes: ["Mining"], priority: 2 },
    "Sulfur Mining Site": { workTypes: ["Mining"], priority: 2 },
    
    // Crafting Workbenches
    "Primitive Workbench": { workTypes: ["Handiwork"], priority: 3 },
    "Weapon Workbench": { workTypes: ["Handiwork"], priority: 3 },
    "Pal Gear Workbench": { workTypes: ["Handiwork"], priority: 3 },
    "High Quality Workbench": { workTypes: ["Handiwork"], priority: 3 },
    "Sphere Workbench": { workTypes: ["Handiwork"], priority: 3 },
    "Primitive Sphere Assembly": { workTypes: ["Handiwork"], priority: 3 },
    "Sphere Assembly Line": { workTypes: ["Handiwork"], priority: 3 },
    "Advanced Sphere Assembly": { workTypes: ["Handiwork"], priority: 3 },
    
    // Processing Structures
    "Crusher": { workTypes: ["Handiwork", "Transporting"], priority: 2 },
    "Mill": { workTypes: ["Watering"], priority: 2 },
    "Furnace": { workTypes: ["Kindling"], priority: 2 },
    "Electric Furnace": { workTypes: ["Kindling"], priority: 2 },
    "Improved Furnace": { workTypes: ["Kindling"], priority: 2 },
    
    // Cooking & Food
    "Cooking Pot": { workTypes: ["Kindling"], priority: 2 },
    "Electric Kitchen": { workTypes: ["Kindling"], priority: 2 },
    "Brewery": { workTypes: ["Transporting"], priority: 3 },
    
    // Medicine
    "Medieval Medicine Workbench": { workTypes: ["Medicine"], priority: 2 },
    "High Quality Medicine Workbench": { workTypes: ["Medicine"], priority: 2 },
    
    // Climate Control
    "Cooler Box": { workTypes: ["Cooling"], priority: 3 },
    "Refrigerator": { workTypes: ["Cooling"], priority: 3 },
    "Electric Heater": { workTypes: ["Kindling"], priority: 3 },
    "Heater": { workTypes: ["Kindling"], priority: 3 },
    "Hot Spring": { workTypes: ["Watering"], priority: 3 },
    
    // Power & Utilities
    "Power Generator": { workTypes: ["Electricity"], priority: 2 },
    "Feed Box": { workTypes: [], priority: 3 },
    "Monitoring Stand": { workTypes: [], priority: 3 },
    "Incubator": { workTypes: [], priority: 3 },
    "Breeding Farm": { workTypes: [], priority: 3 },
    "Pal Bed": { workTypes: [], priority: 3 },
};

// Base level to max pals mapping
const BASE_LEVEL_LIMITS = {
    1: 5, 2: 5, 3: 6, 4: 6, 5: 7, 6: 7, 7: 8, 8: 8, 9: 9, 10: 10,
    11: 10, 12: 11, 13: 11, 14: 12, 15: 12, 16: 13, 17: 13, 18: 14, 19: 14, 20: 15
};

export default function BaseAdvisor({ allPals, revealedPals, theme }) {
    const [baseLevel, setBaseLevel] = useState(10);
    const [selectedStructures, setSelectedStructures] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    const maxPals = BASE_LEVEL_LIMITS[baseLevel] || 5;

    const handleStructureToggle = (structure) => {
        setSelectedStructures(prev => 
            prev.includes(structure) 
                ? prev.filter(s => s !== structure)
                : [...prev, structure]
        );
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

    const calculateRecommendations = () => {
        if (selectedStructures.length === 0) {
            setRecommendations([]);
            return;
        }

        // Get all collected pals
        const collectedPals = allPals.filter(pal => revealedPals.includes(pal.name));
        
        if (collectedPals.length === 0) {
            setRecommendations([{ message: "You haven't discovered any Pals yet! Search for Pals to build your collection." }]);
            return;
        }

        // Aggregate required work types with priorities
        const requiredWork = {};
        const hasNoWorkStructures = selectedStructures.some(structure => 
            BASE_STRUCTURES[structure].workTypes.length === 0
        );
        
        selectedStructures.forEach(structure => {
            const structureInfo = BASE_STRUCTURES[structure];
            structureInfo.workTypes.forEach(workType => {
                if (!requiredWork[workType]) {
                    requiredWork[workType] = { count: 0, priority: structureInfo.priority };
                }
                requiredWork[workType].count += 1;
            });
        });

        // Score each pal based on how well they match required work
        const palScores = collectedPals.map(pal => {
            const works = parseWorkSuitability(pal["work suitability"]);
            let score = 0;
            let matchedWorks = [];
            let totalLevel = 0;

            Object.entries(requiredWork).forEach(([workType, info]) => {
                if (works[workType]) {
                    const workLevel = works[workType];
                    // Higher level = better, more required = more valuable
                    score += (workLevel * 10) * info.count * info.priority;
                    totalLevel += workLevel;
                    matchedWorks.push(`${workType} Lv.${workLevel}`);
                }
            });

            // Bonus for versatility (multiple work types)
            score += Object.keys(works).length * 2;

            return {
                pal,
                score,
                matchedWorks,
                totalLevel,
                allWorks: works
            };
        });

        // Sort by score (highest first) and take top N based on base level
        palScores.sort((a, b) => b.score - a.score);
        const topPals = palScores.slice(0, maxPals);

        // Check coverage of required work
        const workCoverage = {};
        Object.keys(requiredWork).forEach(work => {
            workCoverage[work] = { covered: false, level: 0, pals: [] };
        });

        topPals.forEach(({ pal, allWorks }) => {
            Object.entries(allWorks).forEach(([workType, level]) => {
                if (workCoverage[workType]) {
                    workCoverage[workType].covered = true;
                    workCoverage[workType].level = Math.max(workCoverage[workType].level, level);
                    workCoverage[workType].pals.push(pal.name);
                }
            });
        });

        setRecommendations({
            team: topPals,
            coverage: workCoverage,
            requiredWork,
            hasNoWorkStructures
        });
    };

    useEffect(() => {
        calculateRecommendations();
    }, [selectedStructures, baseLevel, revealedPals]);

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
        levelSelector: {
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
        },
        slider: {
            flex: 1,
            height: "8px",
        },
        levelDisplay: {
            fontSize: "1.2rem",
            fontWeight: "bold",
            minWidth: "120px",
        },
        structuresGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "0.75rem",
        },
        structureCard: {
            padding: "0.75rem",
            border: "2px solid",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontSize: "0.9rem",
            fontWeight: "500",
        },
        selectedStructure: {
            backgroundColor: "#4a90e2",
            color: "white",
            borderColor: "#357abd",
        },
        unselectedStructure: {
            backgroundColor: theme.bg,
            color: theme.text,
            borderColor: theme.border,
        },
        recommendationsSection: {
            backgroundColor: theme.cardBg,
            border: `2px solid ${theme.border}`,
            borderRadius: "8px",
            padding: "1.5rem",
        },
        palCard: {
            backgroundColor: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: "6px",
            padding: "1rem",
            marginBottom: "0.75rem",
        },
        palHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
        },
        palName: {
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: theme.text,
        },
        palType: {
            fontSize: "0.85rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px",
            backgroundColor: "#e0e0e0",
            color: "#333",
        },
        workList: {
            fontSize: "0.9rem",
            color: theme.text,
            marginTop: "0.5rem",
        },
        coverageSection: {
            marginTop: "1.5rem",
            padding: "1rem",
            backgroundColor: theme.bg,
            borderRadius: "6px",
            border: `1px solid ${theme.border}`,
        },
        coverageItem: {
            display: "flex",
            justifyContent: "space-between",
            padding: "0.5rem",
            borderBottom: `1px solid ${theme.border}`,
        },
        covered: {
            color: "#28a745",
            fontWeight: "bold",
        },
        notCovered: {
            color: "#dc3545",
            fontWeight: "bold",
        },
        infoBox: {
            padding: "1rem",
            backgroundColor: "#fff3cd",
            color: "#856404",
            borderRadius: "6px",
            marginBottom: "1rem",
            border: "1px solid #ffc107",
        },
        emptyState: {
            textAlign: "center",
            padding: "2rem",
            color: theme.text,
            fontSize: "1.1rem",
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: theme.text }}>
                Base Advisor
            </h2>

            <div style={styles.infoBox}>
                <strong>How to use:</strong> Select your base level and the structures you have built. 
                The advisor will recommend the best team from your collected Pals.
            </div>

            {/* Base Level Selector */}
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Base Level</div>
                <div style={styles.levelSelector}>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={baseLevel}
                        onChange={(e) => setBaseLevel(parseInt(e.target.value))}
                        style={styles.slider}
                    />
                    <div style={styles.levelDisplay}>
                        Level {baseLevel} ({maxPals} Pals max)
                    </div>
                </div>
            </div>

            {/* Structure Selection */}
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Select Your Base Structures</div>
                <div style={styles.structuresGrid}>
                    {Object.keys(BASE_STRUCTURES).map(structure => {
                        const isSelected = selectedStructures.includes(structure);
                        return (
                            <div
                                key={structure}
                                style={{
                                    ...styles.structureCard,
                                    ...(isSelected ? styles.selectedStructure : styles.unselectedStructure)
                                }}
                                onClick={() => handleStructureToggle(structure)}
                            >
                                {structure}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recommendations */}
            {selectedStructures.length === 0 ? (
                <div style={styles.emptyState}>
                    Select at least one structure to get team recommendations.
                </div>
            ) : recommendations.length === 0 || recommendations.message ? (
                <div style={styles.emptyState}>
                    {recommendations[0]?.message || "Calculating recommendations..."}
                </div>
            ) : (
                <div style={styles.recommendationsSection}>
                    <div style={styles.sectionTitle}>
                        Recommended Team ({recommendations.team?.length || 0}/{maxPals} Pals)
                    </div>

                    {recommendations.team && recommendations.team.length > 0 ? (
                        <>
                            {recommendations.team.map(({ pal, matchedWorks, score }, index) => (
                                <div key={pal.id} style={styles.palCard}>
                                    <div style={styles.palHeader}>
                                        <div style={styles.palName}>
                                            {index + 1}. {pal.name}
                                        </div>
                                        <div style={styles.palType}>{pal.type}</div>
                                    </div>
                                    <div style={styles.workList}>
                                        <strong>Relevant Skills:</strong> {matchedWorks.join(", ") || "General support"}
                                    </div>
                                    <div style={styles.workList}>
                                        <strong>All Skills:</strong> {pal["work suitability"] || "None"}
                                    </div>
                                </div>
                            ))}

                            {/* Work Coverage Analysis */}
                            <div style={styles.coverageSection}>
                                <div style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.75rem", color: theme.text }}>
                                    Work Coverage Analysis
                                </div>
                                {Object.keys(recommendations.requiredWork).length > 0 ? (
                                    Object.entries(recommendations.requiredWork).map(([workType, info]) => {
                                        const coverage = recommendations.coverage[workType];
                                        return (
                                            <div key={workType} style={styles.coverageItem}>
                                                <span>{workType} (needed by {info.count} structure{info.count > 1 ? 's' : ''})</span>
                                                <span style={coverage.covered ? styles.covered : styles.notCovered}>
                                                    {coverage.covered 
                                                        ? `✓ Covered (Lv.${coverage.level} - ${coverage.pals.length} pal${coverage.pals.length > 1 ? 's' : ''})` 
                                                        : '✗ Not Covered'}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ textAlign: "center", padding: "1rem", color: theme.text }}>
                                        {recommendations.hasNoWorkStructures 
                                            ? "Selected structures don't require Pal work (e.g., Feed Box, Monitoring Stand). These are passive structures."
                                            : "No work requirements to analyze."}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={styles.emptyState}>
                            No suitable Pals found in your collection. Discover more Pals!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
