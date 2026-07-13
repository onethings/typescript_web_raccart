# Traccar Web (TypeScript) — Unofficial Rewrite

> **Disclaimer:** This is an **unofficial, community-maintained** TypeScript rewrite of the [Traccar](https://www.traccar.org/) GPS tracking system frontend. It is **not** affiliated with or endorsed by the official Traccar project.  
> Licensed under **Apache 2.0**, in compliance with the original [Traccar Web](https://github.com/traccar/traccar-web) project.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server (defaults to http://localhost:3000)
npx vite

# 3. Production build
npx vite build
```

## Testing

### Using the Public Demo Server

By default, the dev server proxies API requests to **https://demo3.traccar.org**:

| Endpoint | Proxy Target |
|---|---|
| `/api/*` | `https://demo3.traccar.org/api/*` |
| `/api/socket` (WebSocket) | `wss://demo3.traccar.org/api/socket` |

Open http://localhost:3000 to see the login page. Use the demo3 account credentials to log in.

### Using a Local Traccar Server

To connect to your own Traccar server, modify the proxy settings in `vite.config.ts`:

```ts
proxy: {
  '/api/socket': {
    target: 'ws://localhost:8082',
    ws: true,
  },
  '/api': {
    target: 'http://localhost:8082',
  },
},
```

### Useful Commands

| Command | Description |
|---|---|
| `npm install` | Install all dependencies |
| `npx vite` | Start dev server (port 3000) |
| `npx vite build` | Production build to `build/` |
| `npx vite preview` | Preview the production build |
| `npx tsc --noEmit` | TypeScript type checking |

## Tech Stack

- **Framework**: React 19 + TypeScript 5.8
- **State Management**: Redux Toolkit 2.12
- **Routing**: React Router DOM v7
- **UI Library**: Material UI (MUI) v7
- **Maps**: MapLibre GL JS v5
- **Charts**: Recharts 2.15
- **Build Tool**: Vite 6 + SWC
- **PWA**: vite-plugin-pwa

## Project Structure

```
src/
├── api/            # API client (axios + 50+ endpoints)
├── attributes/     # Device, position, command attribute definitions
├── components/     # Shared components (36 total)
│   ├── common/     #   - PageLayout, DeviceList, StatusCard, etc.
│   └── core/       #   - ErrorBoundary, SocketController, etc.
├── hooks/          # Custom hooks (useAsyncTask, useReportData, etc.)
├── i18n/           # Internationalization (60+ languages)
├── login/          # LogoImage component
├── main/           # MainToolbar, useFilter
├── map/            # Map system (21 components)
│   ├── core/       #   - MapView, preloadImages, mapUtil
│   ├── main/       #   - MapPositions, MapGeofence, MapRoutePath, etc.
│   ├── control/    #   - MapScale, MapGeocoder, MapRuler, etc.
│   └── draw/       #   - MapGeofenceEdit
├── pages/          # Page components (55+ routes)
│   ├── login/      #   - Login, Register, Reset password, Change server
│   ├── main/       #   - Main map page + MainMap
│   ├── settings/   #   - 29 CRUD settings pages
│   ├── reports/    #   - 12 report types
│   └── other/      #   - Event, Replay, Geofences, Emulator, etc.
├── reports/        # Report helpers (ColumnSelect, ResizeHandle, etc.)
├── resources/      # Static assets (SVG icons)
├── store/          # Redux store (10 slices)
├── theme/          # MUI theme (including RTL support)
├── types/          # TypeScript type definitions
└── utils/          # Utility functions (15 files)
```


## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.