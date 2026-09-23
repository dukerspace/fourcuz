# Fourcuz

A Pomodoro Technique-based task management application built with a modern monorepo architecture. This project implements a React + Vite + TypeScript frontend with offline storage support.

## 🏗️ Architecture

### Monorepo Structure

```
.
├── apps/
│   └── web/          # React + Vite + TypeScript frontend
├── packages/
│   ├── shared/       # Shared types, utilities, and constants
│   └── ui/           # Shared UI component library (@fourcuz/ui)
├── package.json      # Root workspace configuration
├── turbo.json        # Turbo monorepo configuration
└── tsconfig.base.json
```

### Tech Stack

**Frontend (apps/web)**

- React 18+ with TypeScript
- Vite for fast development and building
- React Router for navigation
- Tailwind CSS 4 for styling
- Zustand for state management
- React i18next for internationalization
- Sonner for toast notifications
- Recharts for data visualization
- Radix UI components via @fourcuz/ui package
- LocalStorage for offline data persistence

**Shared Packages**

- `@shared/types` - TypeScript types and interfaces, utility functions, and constants
- `@fourcuz/ui` - Shared UI component library with Radix UI primitives and Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Bun >= 1.0.0

### Installation

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Build shared packages:**
   ```bash
   bun run --filter @shared/types build
   bun run --filter @fourcuz/ui build
   ```

### Development

**Start the development server:**

```bash
bun dev
```

The web app will be available at `http://localhost:3000`.

### Build

Build all packages:

```bash
bun build
```

### Other Commands

```bash
# Type checking
bun type-check

# Linting
bun lint

# Clean build artifacts
bun clean
```

## ✨ Features

### Core Features (Implemented)

- ✅ **Pomodoro Timer**
  - Customizable work session duration (1-60 minutes)
  - Customizable short break duration (1-60 minutes)
  - Customizable long break duration (1-60 minutes)
  - Configurable long break interval (2-8 pomodoros)
  - Auto-start breaks and pomodoros (configurable)
  - Disable break option
  - Visual countdown with progress circle
  - Task association with timer

- ✅ **Task Management**
  - Create, edit, and delete tasks
  - Mark tasks as complete/incomplete
  - Task priorities (low, medium, high)
  - Task descriptions
  - Track completed Pomodoros per task
  - Project/category organization
  - Task filtering and sorting

- ✅ **Project Management**
  - Create and manage projects/categories
  - Assign tasks to projects
  - Project-based time tracking
  - Project statistics and distribution charts

- ✅ **Statistics Dashboard**
  - Total Pomodoros completed
  - Daily, weekly, and monthly statistics
  - Time tracking (total focus time)
  - Task completion metrics
  - Focus time charts (daily, weekly, monthly views)
  - Project time distribution
  - Pomodoro records timeline
  - Focus time goals tracking

- ✅ **Settings & Customization**
  - Dark/Light theme toggle with system preference detection
  - Internationalization (i18n) - English and Thai
  - Customizable timer durations
  - Sound notifications toggle
  - Auto-start preferences
  - Settings persistence

- ✅ **Additional Features**
  - Browser notifications for reminders
  - Offline storage support
  - Responsive design (mobile, tablet, desktop)
  - Clean, modern UI with smooth animations

### Planned Features

- Subtasks support
- Recurring tasks
- User authentication
- Cloud synchronization
- Advanced analytics and reports
- Export/import data
- Mobile app (PWA)

## 📁 Data Storage

The application uses browser LocalStorage for data persistence:

- All data (tasks, projects, pomodoros, settings) is stored locally in the browser
- Data persists across browser sessions
- No backend or database required
- Works offline with full functionality

## 🛠️ Development Tools

- **Turbo** - Monorepo build system for optimized task execution
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **TypeScript** - Type safety across the monorepo
- **Bun** - Fast JavaScript runtime and package manager

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Montol Saklor


