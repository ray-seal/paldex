# Pal-Dex - Palworld Companion App 🎮

**A fan-made companion App to be played alongside Palworld for keeping track of your Pals and seeing what is best suited to your farms needs**

![PWA](https://img.shields.io/badge/PWA-Enabled-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Vite](https://img.shields.io/badge/Vite-5-646cff)

## Features ✨

### Core Functionality
- 🔍 **Search & Discover** - Search for Pals by name with fuzzy matching
- ➕ **Add Custom Pals** - If a Pal isn't found, add it to your collection
- 📊 **View Stats** - Click discovered Pals to see their type, work suitability, and drops
- 💾 **Progress Tracking** - Your discoveries are saved locally

### Filtering & Organization
- 🎨 **Theme System** - Choose from 10 themes based on Pal types:
  - Ice (Light Blue)
  - Water (Dark Blue)
  - Ground (Brown)
  - Grass (Green)
  - Fire (Orange/Red)
  - Dark (Dark Mode)
  - Neutral (Grey)
  - Electric (Yellow)
  - Dragon (Purple)
  - Default

- 🏷️ **Type Filter** - Filter Pals by their elemental type
- 🔨 **Work Filter** - Filter by work suitability (Mining, Planting, Kindling, etc.)

### Progressive Web App (PWA)
- 📱 **Install as App** - Install on mobile or desktop
- ⚡ **Offline Support** - Works without internet after first load
- 🔄 **Auto-Updates** - Service worker keeps the app fresh
- 🏠 **Add to Home Screen** - Quick access from your device

## Installation 🚀

### Development
```bash
# Clone the repository
git clone https://github.com/ray-seal/paldex.git
cd paldex

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

### Install as PWA
1. Open the app in your browser
2. Look for the "Install App" button or browser prompt
3. Click "Install" to add to your device
4. Launch from your home screen or app drawer

## Usage 📖

1. **Search for Pals**: Type a Pal name in the search bar
2. **Discover**: If found, it gets added to your discovered list
3. **View Details**: Click any discovered Pal to see full stats
4. **Add New**: If not found, use the form to add custom Pals
5. **Filter**: Use dropdowns to filter by type or work suitability
6. **Change Theme**: Select a theme that matches your favorite Pal type

## Technologies Used 🛠️

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Service Workers** - PWA offline functionality
- **LocalStorage** - Data persistence
- **CSS-in-JS** - Inline styling with theme support

## Data Structure 📦

Pals are stored with the following properties:
```json
{
  "id": 1,
  "name": "Lamball",
  "type": "Neutral",
  "work suitability": "Handiwork Lv.1, Transporting Lv.1, Farming Lv.1",
  "gives": "Wool"
}
```

## Contributing 🤝

This is a fan-made project. Contributions are welcome!

## Disclaimer ⚠️

This is an unofficial fan-made companion app and is not affiliated with or endorsed by Pocketpair, Inc. or Palworld. All game-related content and trademarks belong to their respective owners.

## License 📄

MIT License - feel free to use and modify!

---

Made with ❤️ for the Palworld community