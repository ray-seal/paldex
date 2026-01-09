# How to Add Custom Achievements

## Achievement Structure

Each achievement is defined with the following properties:

```javascript
{
    id: "unique_achievement_id",           // Unique identifier (use snake_case)
    name: "Achievement Name",              // Display name
    description: "What the player needs to do", // Description
    icon: "🏆",                            // Emoji icon
    category: "Category Name",             // Discovery, Combat, Exploration, etc.
    requirement: {                         // Unlock condition
        type: "achievement_type",
        // Additional properties based on type
    }
}
```

## Achievement Types

### 1. Pal Discovery Achievements

Unlocks based on how many Pals have been discovered:

```javascript
{
    id: "my_discovery_achievement",
    name: "Pal Collector",
    description: "Discover 10 Pals",
    icon: "📖",
    category: "Discovery",
    requirement: { 
        type: "pals_discovered", 
        count: 10 
    }
}
```

**Special case for "discover all pals":**
- Use `count: 999` to check if all pals are discovered

### 2. Boss Battle Achievements

#### Total Bosses Defeated
```javascript
{
    id: "defeat_5_bosses",
    name: "Boss Slayer",
    description: "Defeat 5 bosses",
    icon: "⚔️",
    category: "Combat",
    requirement: { 
        type: "bosses_defeated", 
        count: 5 
    }
}
```

#### Category-Specific Boss Defeats
```javascript
{
    id: "tower_master",
    name: "Tower Master",
    description: "Defeat all Tower Bosses",
    icon: "🏰",
    category: "Combat",
    requirement: { 
        type: "category_defeated",
        category: "Tower Boss",  // "Tower Boss", "Alpha Pal", "Legendary", "Raid Boss"
        count: 5
    }
}
```

### 3. Custom Achievements

For achievements that don't fit the above patterns, use custom type:

```javascript
{
    id: "my_custom_achievement",
    name: "App Explorer",
    description: "Use every feature in the app",
    icon: "🔍",
    category: "Exploration",
    requirement: { 
        type: "custom", 
        key: "explored_all_features"  // localStorage key to check
    }
}
```

**To trigger custom achievements**, add this code where appropriate:
```javascript
localStorage.setItem("explored_all_features", "true");
```

## Categories

You can use any category name. Common categories:
- **Discovery** - Finding and collecting Pals
- **Combat** - Defeating bosses and battles
- **Exploration** - Using app features, finding locations
- **Collection** - Completing sets or groups
- **Mastery** - Advanced achievements

## Example: Adding Your Own Achievement

1. Open `/src/components/Achievements.jsx`
2. Find the `ACHIEVEMENTS` array
3. Add your achievement at the end:

```javascript
const ACHIEVEMENTS = [
    // ... existing achievements ...
    
    // Your new achievement
    {
        id: "speed_demon",
        name: "Speed Demon",
        description: "Defeat 10 bosses in a row",
        icon: "⚡",
        category: "Combat",
        requirement: { 
            type: "custom", 
            key: "defeat_streak_10" 
        }
    },
];
```

## Tips

- Use clear, descriptive achievement names
- Make descriptions specific about what needs to be done
- Choose fitting emoji icons (🏆⭐🎯🔥💎🌟✨🎖️👑⚔️🛡️)
- Group related achievements in the same category
- Start with easy achievements and progress to harder ones
- Test your achievements by checking if they unlock correctly!

## Current Available Boss Categories

- **"Tower Boss"** - 5 total bosses
- **"Alpha Pal"** - 35 total bosses
- **"Legendary"** - 5 total bosses
- **"Raid Boss"** - 2 total bosses
