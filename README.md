# Prospecting Analytics Platform (PAP) v1.0

A Cloudflare-native web application designed to analyze global geological, geochemical, and remote-sensing data to identify precious-metal prospecting opportunities.

## Features

- 🗺️ **Interactive Heatmap Visualization**: Visual representation of prospecting sites with color-coded markers
- ⚙️ **Weight Tuning Controls**: Adjust the importance of geological, geochemical, and remote-sensing data
- 🎯 **Filtering Capabilities**: Set minimum score thresholds to focus on high-value targets
- 📊 **Analytics Dashboard**: Real-time statistics and sorted target extraction
- ☁️ **Cloudflare Native**: Runs on Cloudflare Workers for global edge deployment

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Cloudflare account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/amiddlebrook/PAP.git
cd PAP
```

2. Install dependencies:
```bash
npm install
```

### Local Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8787`

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Usage

1. **Adjust Weights**: Use the sliders in the Controls panel to adjust the importance of each data source:
   - Geological Data
   - Geochemical Data
   - Remote-Sensing Data

2. **Set Threshold**: Use the threshold slider to filter out sites below a minimum score

3. **Update Analysis**: Click the "Update Analysis" button to recalculate scores and refresh the visualization

4. **Explore Results**: 
   - View sites on the interactive heatmap
   - Hover over markers to see detailed information
   - Check the analytics dashboard for statistics
   - Review the sorted list of top targets

## Color Legend

- 🟢 **Green (High Value)**: Score ≥ 0.75
- 🟡 **Yellow (Medium Value)**: Score 0.50 - 0.74
- 🔴 **Red (Low Value)**: Score < 0.50

## Technology Stack

- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Deployment**: Wrangler CLI

## Project Structure

```
PAP/
├── src/
│   └── index.ts          # Main worker script and HTML interface
├── wrangler.toml         # Cloudflare Workers configuration
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## License

MIT