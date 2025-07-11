# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run lint` - Run ESLint with TypeScript support
- `npm run preview` - Preview production build locally

### Firebase Commands
- `npm run firebase:login` - Login to Firebase
- `npm run firebase:deploy` - Deploy to Firebase Hosting
- `npm run firebase:emulators` - Start Firebase emulators

### Database Management
- `npm run db:indexes:generate` - Generate Firestore indexes
- `npm run db:indexes:deploy` - Deploy Firestore indexes
- `npm run db:indexes:status` - Check index status
- `npm run optimize` - Full optimization pipeline (indexes + performance tests)

### Performance Testing
- `npm run test:performance` - Run query performance tests
- `npm run test:queries` - Run both index status check and performance tests

## Architecture Overview

### Data Flow Architecture
This is a **dual-mode data architecture** supporting both authenticated Firebase users and demo mode:

1. **DataContext** (`src/contexts/DataContext.tsx`) - Central data provider that automatically switches between:
   - **Mock Data**: For demo mode and unauthenticated users
   - **Firebase Data**: For authenticated users via DiaryService

2. **Authentication Flow** (`src/contexts/AuthContext.tsx`):
   - Google OAuth via Firebase Auth
   - Demo mode toggle for testing without authentication
   - Automatic data source switching based on auth state

### Core Components Structure

#### Timeline System
- **Timeline2D** (`src/components/Timeline2D.tsx`) - Main 2D grid timeline with:
  - Horizontal axis: days/months (1-12)
  - Vertical axis: years
  - Optimized caching system for year-based data loading
  - Hover tooltips with diary content preview
  - Zoom and pan functionality

#### Data Services
- **DiaryService** (`src/services/diaryService.ts`) - Firebase Firestore operations
- **Firebase Config** (`src/services/firebase.ts`) - Firebase initialization with emulator support
- **Mock Data** (`src/data/mockData.ts`) - Demo data for unauthenticated users

### Database Architecture (Firestore)

#### Time-Based Collection Sharding
Collections are partitioned by year to optimize for 100-year data retention:
- `/diaries-{year}/{diaryId}` - Year-based diary partitioning
- `/media-{year}/{mediaId}` - Year-based media storage
- `/contexts-{year}-{month}/{contextId}` - Monthly context data

#### Performance Optimization
- **Composite Indexes**: Defined in `firestore.indexes.json`
- **Query Optimization**: Custom optimization service in `src/services/queryOptimization.ts`
- **Automatic Sharding**: Prevents single collection from growing too large

### State Management
- **Zustand Stores**:
  - `src/store/authStore.ts` - Authentication state
  - `src/store/appStore.ts` - Application-wide state
- **React Context**:
  - DataContext for data operations
  - AuthContext for authentication

## Key Development Patterns

### Data Access Pattern
Always use the `useData()` hook which automatically handles:
- Mock vs Firebase data switching
- Loading states
- Error handling
- Data format unification via `UnifiedDiaryEntry` interface

### Component Development
- Components receive data via DataContext, not direct Firebase calls
- Use TypeScript interfaces from `src/types/` for all data structures
- Follow existing patterns in components for consistency

### Firebase Environment
- Development: Uses emulators when `VITE_USE_FIREBASE_EMULATOR=true`
- Production: Direct Firebase connection
- Environment variables prefixed with `VITE_` for client-side access

## File Structure Notes

### Critical Directories
- `src/components/` - Reusable UI components
- `src/contexts/` - React Context providers (Auth, Data)
- `src/services/` - External service integrations (Firebase, etc.)
- `src/types/` - TypeScript type definitions
- `docs/` - Architecture documentation (especially `firestore-data-model.md`)

### Firebase Configuration
- `firebase.json` - Firebase project configuration
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Database indexes
- `functions/` - Cloud Functions (Node.js 18)

## Development Rules

### Core Rules (Never Violate)

#### 1. File Size Limit - 600 Line Rule
- **All files must not exceed 600 lines**
- Split immediately if exceeded
- Applies to: JS/TS, CSS, JSON, MD files

#### 2. Security Rules
- **Never store sensitive data in plain text**
- **No API keys or secrets in code**
- **No sensitive information in console logs**

#### 3. Function Size Limit
- **All functions must be 50 lines or less**

### File Naming
```javascript
// Components: PascalCase
Timeline2D.tsx, DiaryEditor.tsx

// Utilities: camelCase  
dateFormatter.ts, validationHelper.ts

// Hooks: start with 'use'
useAuth.ts, useDiary.ts

// Constants: UPPER_SNAKE_CASE
API_ENDPOINTS.ts, ERROR_MESSAGES.ts
```

### Git Rules
- **Commit messages in Korean**
- **Pre-commit check: files under 600 lines**
- **Never commit .env files**

## Special Considerations

### Mock Data System
The application seamlessly switches between mock and real data based on authentication state. When developing:
- Test both authenticated and demo modes
- Ensure new features work with both data sources
- Mock data structure must match Firebase data structure

### Performance Optimization
- Timeline component uses aggressive caching for year-based data
- Firestore queries are optimized for time-based access patterns
- Media files are automatically partitioned by year

### Development with Emulators
When using Firebase emulators, ensure all services are running:
- Auth: localhost:9099
- Firestore: localhost:8080
- Storage: localhost:9199
- Functions: localhost:5001
