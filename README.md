# Basketball Team Manager

A comprehensive React/Next.js application for managing basketball teams, players, and transfers with real-time API integration and local team management capabilities.

## 🏗️ Architecture Overview

### Tech Stack

- **Frontend Framework**: Next.js 15.3.4 with React 19
- **State Management**: Redux Toolkit with React Redux
- **Styling**: Tailwind CSS 4 with PostCSS
- **Type Safety**: TypeScript 5
- **Form Validation**: Zod
- **Icons**: Lucide React
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: npm

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main application page
│   ├── globals.css        # Global styles
│   └── favicon.ico        # App icon
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components (Header)
│   ├── teams/            # Team management components
│   ├── players/          # Player management components
│   ├── offers/           # Transfer offer components
│   ├── settings/         # Settings components
│   ├── transfers/        # Transfer history components
│   ├── Dashboard.tsx     # Main dashboard component
│   ├── Providers.tsx     # Redux provider wrapper
│   └── HydrationProvider.tsx # State hydration provider
└── lib/                  # Core utilities and state management
    ├── store.ts          # Redux store configuration
    ├── hooks.ts          # Custom Redux hooks
    ├── utils.ts          # Utility functions
    └── slices/           # Redux slices
        ├── authSlice.ts      # Authentication state
        ├── teamsSlice.ts     # Teams and transfers state
        ├── playersSlice.ts   # Players state
        └── offersSlice.ts    # Transfer offers state
```

## 🔄 State Management Architecture

### Redux Store Structure

The application uses Redux Toolkit for centralized state management with four main slices:

#### 1. Auth Slice (`authSlice.ts`)

- **Purpose**: Manages user authentication state
- **State Properties**:
  - `user`: Current authenticated user
  - `isAuthenticated`: Authentication status
  - `isHydrated`: Hydration status for SSR
- **Key Actions**:
  - `login`: Authenticate user and store in localStorage
  - `logout`: Clear authentication and localStorage
  - `hydrate`: Restore auth state from localStorage

#### 2. Teams Slice (`teamsSlice.ts`)

- **Purpose**: Manages API teams, local teams, and transfer operations
- **State Properties**:
  - `apiTeams`: Teams fetched from BallDontLie API
  - `localTeams`: User-created local teams
  - `loading`: Loading states for different operations
  - `transferHistory`: Transfer records
  - `cacheExpiry`: Cache management (5 minutes)
- **Key Actions**:
  - `fetchTeams`: Async thunk for API team fetching
  - `fetchTeamPlayers`: Async thunk for team player fetching
  - `createLocalTeam`: Create new local team
  - `transferPlayer`: Handle player transfers between teams
  - `hideApiTeam`: Hide API teams from display

#### 3. Players Slice (`playersSlice.ts`)

- **Purpose**: Manages player data and custom player creation
- **State Properties**:
  - `allPlayers`: All players from API
  - `customPlayers`: User-created custom players
  - `displayedPlayers`: Paginated player display
  - `loading`: Loading states
  - `hasMore`: Pagination control
- **Key Actions**:
  - `fetchAllPlayers`: Async thunk for fetching all players
  - `loadMorePlayers`: Load additional players (infinite scroll)
  - `createCustomPlayer`: Create new custom player
  - `addCustomPlayerToTeam`: Add custom player to team

#### 4. Offers Slice (`offersSlice.ts`)

- **Purpose**: Manages transfer offers between teams
- **State Properties**:
  - `offers`: Array of transfer offers
- **Key Actions**:
  - `createOffer`: Create new transfer offer
  - `updateOfferStatus`: Accept/reject offers
  - `hydrateOffers`: Restore offers from localStorage

## 🔄 Data Flow & Workflow

### 1. Application Initialization

```
1. App loads → Providers.tsx wraps with Redux Provider
2. HydrationProvider triggers on mount
3. All slices hydrate from localStorage
4. Auth state determines login/dashboard view
5. Dashboard renders with cached data or loading states
```

### 2. Authentication Flow

```
1. User enters username → LoginForm component
2. Redux dispatch login action
3. Auth state updates with user info
4. User info stored in localStorage
5. App redirects to dashboard
6. On logout, state cleared and localStorage cleaned
```

### 3. Team Management Flow

```
1. User navigates to Teams tab
2. Check cache expiry (5 minutes)
3. If cache valid → use cached data
4. If cache expired → fetch from API
5. Display API teams and local teams
6. User can create local teams
7. User can hide API teams
```

### 4. Player Management Flow

```
1. User clicks on team → fetch team players
2. Display players with pagination
3. User can create custom players
4. User can add players to local teams
5. Infinite scroll loads more players
6. Cache management prevents unnecessary API calls
```

### 5. Transfer System Flow

```
1. User creates offer → OfferModal component
2. Offer stored in Redux state and localStorage
3. Offer appears in offers list
4. User can accept/reject offers
5. On acceptance → transferPlayer action triggered
6. Player moved between teams
7. Transfer history updated
8. Team rosters updated
```

## 🎯 Key Features Implementation

### 1. Caching Strategy

- **Cache Duration**: 5 minutes for API data
- **Storage**: localStorage for persistence
- **Cache Keys**: Separate keys for teams, players, offers
- **Cache Invalidation**: Automatic expiry and manual clear options

### 2. Infinite Scroll

- **Implementation**: Custom pagination with `displayLimit`
- **State Management**: `currentPage`, `hasMore`, `displayedPlayers`
- **Performance**: Load 10 players at a time
- **User Experience**: Smooth scrolling with loading indicators

### 3. Form Validation

- **Library**: Zod for schema validation
- **Integration**: React Hook Form with Zod resolver
- **Validation Rules**: Required fields, data types, custom validations
- **Error Handling**: Real-time validation feedback

### 4. Transfer System

- **Offer Creation**: Modal-based offer creation
- **Offer Management**: Accept/reject functionality
- **Transfer Execution**: Automatic player movement
- **History Tracking**: Complete transfer records
- **Team Updates**: Real-time roster updates

### 5. Custom Player Creation

- **Form Fields**: Name, position, nationality, physical attributes
- **Validation**: Comprehensive form validation
- **Integration**: Seamless addition to local teams
- **Persistence**: Stored in localStorage

## 🔧 Development Workflow

### 1. Component Development Pattern

```
1. Create component with TypeScript interfaces
2. Implement Redux state management
3. Add form validation with Zod
4. Style with Tailwind CSS
5. Add loading states and error handling
6. Test with different data scenarios
```

### 2. State Management Pattern

```
1. Define TypeScript interfaces
2. Create Redux slice with initial state
3. Implement reducers for state updates
4. Add async thunks for API calls
5. Implement localStorage persistence
6. Add hydration logic for SSR
```

### 3. API Integration Pattern

```
1. Check cache validity
2. Make authenticated API request
3. Handle different response statuses
4. Update Redux state with response
5. Cache successful responses
6. Provide meaningful error messages
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- BallDontLie API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd test_2

# Install dependencies
npm install

# Start development server
npm run dev
```

### API Setup

1. Get API key from [BallDontLie API](https://www.balldontlie.io/)
2. Log into the application
3. Navigate to Settings tab
4. Enter your API key
5. Save and start using the application

### Environment Variables

```env
NEXT_PUBLIC_BALLDONTLIE_API_KEY=your_api_key_here
```

## 📱 User Interface

### Design System

- **Color Scheme**: Blue primary with gray accents
- **Typography**: Inter font family
- **Components**: Consistent card-based layout
- **Responsive**: Mobile-first design approach
- **Accessibility**: ARIA labels and keyboard navigation

### Key UI Components

- **Dashboard**: Tab-based navigation
- **Team Cards**: Visual team representation
- **Player Cards**: Player information display
- **Modals**: Offer creation and confirmation
- **Forms**: Validated input components
- **Loading States**: Spinner and skeleton loaders

## 🔒 Security Considerations

### Data Protection

- API keys stored in localStorage (client-side only)
- No sensitive data sent to external servers
- Input validation prevents XSS attacks
- TypeScript provides compile-time safety

### Best Practices

- Environment variables for production
- Input sanitization
- Error boundary implementation
- Secure API key handling

## 🧪 Testing Strategy

### Manual Testing Scenarios

1. **Authentication**: Login/logout flow
2. **Team Management**: Create, view, hide teams
3. **Player Management**: Fetch, create, add players
4. **Transfer System**: Create, accept, reject offers
5. **Cache Management**: Verify cache expiry
6. **Error Handling**: API failures, validation errors

### Performance Testing

- Large dataset handling
- Infinite scroll performance
- Cache effectiveness
- Memory usage optimization

## 🚀 Deployment

### Build Process

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Deployment Considerations

- Environment variables configuration
- API key management
- Static asset optimization
- Performance monitoring

## 📈 Future Enhancements

### Planned Features

- Real-time notifications
- Advanced filtering and search
- Team statistics and analytics
- Export/import functionality
- Multi-user support
- Advanced transfer negotiations

### Technical Improvements

- Unit and integration tests
- Performance optimization
- PWA capabilities
- Offline support
- Advanced caching strategies

## 🤝 Contributing

### Development Guidelines

1. Follow TypeScript best practices
2. Use Redux Toolkit patterns
3. Implement proper error handling
4. Add loading states for async operations
5. Maintain consistent styling with Tailwind
6. Write meaningful commit messages

### Code Quality

- ESLint configuration for code consistency
- TypeScript strict mode enabled
- Component prop validation
- Redux state type safety
- Form validation with Zod

---

This architecture provides a robust, scalable foundation for the basketball team management application with excellent user experience, performance, and maintainability.
