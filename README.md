# Event Manager App

A comprehensive Event Management Application built with React Native Web, providing professional event planning and management capabilities.

## Features

- **Project Management**: Create, track, and manage events from idea to completion
- **BOM Management**: Bill of Materials hierarchy and import functionality
- **Supplier Matching**: Procurement and vendor management
- **Permits Management**: Regulatory compliance and approval tracking
- **Logistics Planning**: Transportation and resource scheduling
- **Master Data Management**: Centralized data repository
- **Reporting & Analytics**: Comprehensive reporting tools
- **File Management**: Document storage and organization
- **Calendar Integration**: Event scheduling and timeline management

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: React Native Web
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API
- **Icons**: Lucide React
- **Build Tool**: Create React App

## Prerequisites

- Node.js 16+ 
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Event-Manager-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run web` - Start web development server
- `npm run android` - Run on Android (requires React Native setup)
- `npm run ios` - Run on iOS (requires React Native setup)

## Project Structure

```
Event-Manager-App/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── AppContext.tsx   # Application state management
│   ├── NewLayout.tsx    # Main layout component
│   └── ...              # Feature-specific components
├── styles/               # Global styles and CSS variables
├── public/               # Static assets and HTML template
├── App.tsx              # Main application component
├── index.js             # Application entry point
└── package.json         # Dependencies and scripts
```

## Key Components

### AppContext
Central state management for projects, navigation, and application state.

### NewLayout
Main layout component with sidebar navigation and responsive design.

### Global Dashboard
Overview of all projects and system-wide metrics.

### Project Management
Individual project views with specialized tools for each project phase.

## Development

The application uses a modular component architecture with:
- **Context-based state management** for global state
- **Component composition** for flexible layouts
- **Tailwind CSS** for consistent styling
- **TypeScript** for type safety

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Mobile Development

To run on mobile devices:

1. **Android**: `npm run android`
2. **iOS**: `npm run ios`

Note: Mobile development requires additional React Native CLI setup.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software. All rights reserved.
