import { useState, useEffect } from "react";

// Achievement definitions - Add your own achievements here!
const ACHIEVEMENTS = [
    // Pal Discovery Achievements
    {
        id: "first_discovery",
        name: "First Discovery",
        description: "Discover your first Pal",
        icon: "🔍",
        category: "Discovery",
        requirement: { type: "pals_discovered", count: 1 }
    },
    {
        id: "pal_collector",
        name: "Pal Collector",
        description: "Discover 25 Pals",
        icon: "📚",
        category: "Discovery",
        requirement: { type: "pals_discovered", count: 25 }
    },
    {
        id: "pal_master",
        name: "Pal Master",
        description: "Discover 50 Pals",
        icon: "🎓",
        category: "Discovery",
        requirement: { type: "pals_discovered", count: 50 }
    },
    {
        id: "pal_completionist",
        name: "Paldex Completionist",
        description: "Discover 100 Pals",
        icon: "👑",
        category: "Discovery",
        requirement: { type: "pals_discovered", count: 100 }
    },
    {
        id: "gotta_catch_em_all",
        name: "Gotta Catch 'Em All!",
        description: "Discover every single Pal in the game",
        icon: "⭐",
        category: "Discovery",
        requirement: { type: "pals_discovered", count: 999 } // Will check if = total
    },

    // Boss Battle Achievements
    {
        id: "first_blood",
        name: "First Blood",
        description: "Defeat your first boss",
        icon: "⚔️",
        category: "Combat",
        requirement: { type: "bosses_defeated", count: 1 }
    },
    {
        id: "tower_beginner",
        name: "Tower Beginner",
        description: "Defeat your first Tower Boss",
        icon: "🏰",
        category: "Combat",
        requirement: { type: "category_defeated", category: "Tower Boss", count: 1 }
    },
    {
        id: "tower_conqueror",
        name: "Tower Conqueror",
        description: "Defeat all 5 Tower Bosses",
        icon: "🏆",
        category: "Combat",
        requirement: { type: "category_defeated", category: "Tower Boss", count: 5 }
    },
    {
        id: "alpha_hunter",
        name: "Alpha Hunter",
        description: "Defeat 10 Alpha Pals",
        icon: "🎯",
        category: "Combat",
        requirement: { type: "category_defeated", category: "Alpha Pal", count: 10 }
    },
    {
        id: "alpha_slayer",
        name: "Alpha Slayer",
        description: "Defeat 25 Alpha Pals",
        icon: "🗡️",
        category: "Combat",
        requirement: { type: "category_defeated", category: "Alpha Pal", count: 25 }
    },
    {
        id: "legendary_challenger",
        name: "Legendary Challenger",
        description: "Defeat your first Legendary Pal",
        icon: "✨",
        category: "Combat",
        requirement: { type: "category_defeated", category: "Legendary", count: 1 }
    },
    {
        id: "legendary_slayer",
        name: "Legendary Slayer",
        description: "Defeat all Legendary Pals",
        icon: "💫",
        category: "Combat",
        requirement: { type: "category_defeated", category: "Legendary", count: 5 }
    },
    {
        id: "raid_warrior",
        name: "Raid Warrior",
        description: "Defeat a Raid Boss",
        icon: "👹",
        category: "Combat",
        requirement: { type: "category_defeated", category: "Raid Boss", count: 1 }
    },
    {
        id: "raid_master",
        name: "Raid Master",
        description: "Defeat all Raid Bosses",
        icon: "🔥",
        category: "Combat",
        requirement: { type: "category_defeated", category: "Raid Boss", count: 2 }
    },
    {
        id: "boss_hunter",
        name: "Boss Hunter",
        description: "Defeat 20 bosses total",
        icon: "🏹",
        category: "Combat",
        requirement: { type: "bosses_defeated", count: 20 }
    },
    {
        id: "boss_master",
        name: "Boss Master",
        description: "Defeat all 47 bosses in the game",
        icon: "🎖️",
        category: "Combat",
        requirement: { type: "bosses_defeated", count: 47 }
    },

    // Exploration Achievements (examples you can customize)
    {
        id: "explorer",
        name: "Explorer",
        description: "Use the Base Advisor feature",
        icon: "🗺️",
        category: "Exploration",
        requirement: { type: "custom", key: "used_base_advisor" }
    },
    {
        id: "strategist",
        name: "Strategist",
        description: "Use the Battle Advisor feature",
        icon: "🧠",
        category: "Exploration",
        requirement: { type: "custom", key: "used_battle_advisor" }
    },
];

export default function Achievements({ revealedPals, totalPals, defeatedBosses, bossCategories, theme }) {
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        checkAchievements();
    }, [revealedPals, defeatedBosses]);

    const checkAchievements = () => {
        const unlocked = [];

        ACHIEVEMENTS.forEach(achievement => {
            let isUnlocked = false;

            switch (achievement.requirement.type) {
                case "pals_discovered":
                    if (achievement.requirement.count === 999) {
                        // Special case: all pals
                        isUnlocked = revealedPals.length === totalPals;
                    } else {
                        isUnlocked = revealedPals.length >= achievement.requirement.count;
                    }
                    break;

                case "bosses_defeated":
                    isUnlocked = defeatedBosses.length >= achievement.requirement.count;
                    break;

                case "category_defeated":
                    const categoryCount = bossCategories[achievement.requirement.category]?.defeated || 0;
                    isUnlocked = categoryCount >= achievement.requirement.count;
                    break;

                case "custom":
                    // For custom achievements, check localStorage
                    const customData = localStorage.getItem(achievement.requirement.key);
                    isUnlocked = customData === "true";
                    break;

                default:
                    break;
            }

            if (isUnlocked) {
                unlocked.push(achievement.id);
            }
        });

        setUnlockedAchievements(unlocked);
    };

    const categories = ["All", ...new Set(ACHIEVEMENTS.map(a => a.category))];
    const filteredAchievements = filter === "All" 
        ? ACHIEVEMENTS 
        : ACHIEVEMENTS.filter(a => a.category === filter);

    const unlockedCount = unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;
    const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

    const styles = {
        container: {
            padding: "1rem",
            maxWidth: "900px",
            margin: "0 auto",
        },
        header: {
            textAlign: "center",
            marginBottom: "1.5rem",
        },
        title: {
            fontSize: "2rem",
            fontWeight: "bold",
            color: theme.text,
            marginBottom: "0.5rem",
        },
        subtitle: {
            fontSize: "1.2rem",
            color: theme.text,
            marginBottom: "1rem",
        },
        progressSection: {
            backgroundColor: theme.cardBg,
            border: `2px solid ${theme.border}`,
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
        },
        progressBar: {
            width: "100%",
            height: "30px",
            backgroundColor: "#e0e0e0",
            borderRadius: "15px",
            overflow: "hidden",
            marginTop: "1rem",
        },
        progressFill: {
            height: "100%",
            backgroundColor: "#ffd700",
            transition: "width 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontWeight: "bold",
            fontSize: "1rem",
        },
        filterContainer: {
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
        },
        filterButton: {
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.2s ease",
        },
        filterActive: {
            backgroundColor: "#007bff",
            color: "white",
        },
        filterInactive: {
            backgroundColor: theme.cardBg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
        },
        achievementGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
        },
        achievementCard: {
            backgroundColor: theme.cardBg,
            border: `2px solid ${theme.border}`,
            borderRadius: "8px",
            padding: "1.5rem",
            transition: "all 0.2s ease",
            position: "relative",
            overflow: "hidden",
        },
        achievementCardUnlocked: {
            borderColor: "#ffd700",
            boxShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
        },
        achievementCardLocked: {
            opacity: 0.6,
        },
        achievementIcon: {
            fontSize: "3rem",
            marginBottom: "0.5rem",
            filter: "grayscale(100%)",
        },
        achievementIconUnlocked: {
            fontSize: "3rem",
            marginBottom: "0.5rem",
            filter: "none",
        },
        achievementName: {
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: theme.text,
            marginBottom: "0.5rem",
        },
        achievementDescription: {
            fontSize: "0.9rem",
            color: theme.text,
            marginBottom: "1rem",
        },
        achievementCategory: {
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            borderRadius: "12px",
            fontSize: "0.75rem",
            fontWeight: "bold",
            backgroundColor: "#007bff",
            color: "white",
            marginBottom: "0.5rem",
        },
        unlockedBadge: {
            position: "absolute",
            top: "1rem",
            right: "1rem",
            backgroundColor: "#28a745",
            color: "white",
            padding: "0.25rem 0.75rem",
            borderRadius: "12px",
            fontSize: "0.75rem",
            fontWeight: "bold",
        },
        lockedBadge: {
            position: "absolute",
            top: "1rem",
            right: "1rem",
            backgroundColor: "#6c757d",
            color: "white",
            padding: "0.25rem 0.75rem",
            borderRadius: "12px",
            fontSize: "0.75rem",
            fontWeight: "bold",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.title}>🏆 Achievements</div>
                <div style={styles.subtitle}>
                    {unlockedCount} / {totalCount} Unlocked
                </div>
            </div>

            {/* Progress Section */}
            <div style={styles.progressSection}>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${completionPercentage}%` }}>
                        {completionPercentage > 5 ? `${completionPercentage}%` : ''}
                    </div>
                </div>
            </div>

            {/* Category Filters */}
            <div style={styles.filterContainer}>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setFilter(category)}
                        style={{
                            ...styles.filterButton,
                            ...(filter === category ? styles.filterActive : styles.filterInactive)
                        }}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Achievement Grid */}
            <div style={styles.achievementGrid}>
                {filteredAchievements.map(achievement => {
                    const isUnlocked = unlockedAchievements.includes(achievement.id);
                    return (
                        <div
                            key={achievement.id}
                            style={{
                                ...styles.achievementCard,
                                ...(isUnlocked ? styles.achievementCardUnlocked : styles.achievementCardLocked)
                            }}
                        >
                            <div style={styles.achievementCategory}>
                                {achievement.category}
                            </div>
                            
                            {isUnlocked ? (
                                <div style={styles.unlockedBadge}>✓ UNLOCKED</div>
                            ) : (
                                <div style={styles.lockedBadge}>🔒 LOCKED</div>
                            )}

                            <div style={isUnlocked ? styles.achievementIconUnlocked : styles.achievementIcon}>
                                {achievement.icon}
                            </div>
                            <div style={styles.achievementName}>
                                {achievement.name}
                            </div>
                            <div style={styles.achievementDescription}>
                                {achievement.description}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
