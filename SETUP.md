# Setup Guide - Event Manager App

This guide will help you set up and run the Event Manager App locally as a React Native Web application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)

## Quick Start

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required dependencies including:
- React and React DOM
- React Native Web
- TypeScript
- Tailwind CSS
- UI component libraries

### 2. Start Development Server

```bash
npm start
```

The application will open automatically in your default browser at `http://localhost:3000`.

## Project Structure

```
Event-Manager-App/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── AppContext.tsx   # Application state management
│   ├── NewLayout.tsx    # Main layout with sidebar
│   └── ...              # Feature-specific components
├── styles/               # Global CSS and Tailwind variables
├── public/               # Static assets and HTML template
├── src/                  # Source files
├── App.tsx              # Main application component
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run web` | Start web development server |
| `npm run android` | Run on Android (requires setup) |
| `npm run ios` | Run on iOS (requires setup) |

## Development Workflow

### 1. Making Changes

The application uses a component-based architecture:
- **AppContext.tsx**: Central state management
- **NewLayout.tsx**: Main layout and navigation
- **Feature Components**: Individual functionality modules

### 2. Styling

The app uses Tailwind CSS with custom CSS variables:
- Global styles: `styles/globals.css`
- Tailwind config: `tailwind.config.js`
- Custom design system with CSS variables

### 3. State Management

- **Context API**: For global application state
- **Local State**: For component-specific state
- **Data Flow**: Unidirectional data flow pattern

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill the process using port 3000
   npx kill-port 3000
   # Or use a different port
   PORT=3001 npm start
   ```

2. **Dependencies not found**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   ```

### Performance Issues

- **Large bundle size**: Check for unused imports
- **Slow development**: Consider using `npm run build` for production testing

## Building for Production

### 1. Create Production Build

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

### 2. Test Production Build

```bash
npx serve -s build
```

### 3. Deploy

The `build/` directory contains static files that can be deployed to:
- Netlify
- Vercel
- AWS S3
- Any static hosting service

## Mobile Development

### Android Setup

1. Install Android Studio
2. Set up Android SDK
3. Create Android Virtual Device (AVD)
4. Run: `npm run android`

### iOS Setup (macOS only)

1. Install Xcode
2. Install iOS Simulator
3. Run: `npm run ios`

## Customization

### Adding New Features

1. Create new component in `components/` directory
2. Add to navigation in `NewLayout.tsx`
3. Update routing in `App.tsx`
4. Add to state management if needed

### Styling Changes

1. Modify `styles/globals.css` for global styles
2. Update `tailwind.config.js` for theme changes
3. Use Tailwind classes in components

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure Node.js version is compatible
4. Check the browser console for runtime errors

## Next Steps

After successful setup:

1. Explore the application features
2. Review the component architecture
3. Customize the design system
4. Add new functionality
5. Set up testing framework
6. Configure CI/CD pipeline
