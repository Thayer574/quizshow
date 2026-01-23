# K-Quiz Clone

## Overview

K-Quiz Clone is a real-time multiplayer quiz game application inspired by Kahoot. It enables users to create quiz rooms, join games via room codes, and compete in timed trivia sessions. The application supports three modes: Room Owner (creates and manages games), Player (joins games via code), and Solo (practice mode with personal question pools). Built with a React frontend, Express/tRPC backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **API Communication**: tRPC client with React Query integration
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Layer**: tRPC for type-safe API endpoints
- **Authentication**: Cookie-based sessions with JWT tokens
- **OAuth**: Integration with external OAuth service for user authentication
- **Server Structure**: Modular router pattern with protected/public procedures

### Data Storage
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Entities**: Users, Rooms, RoomMembers, Questions, GameSessions, PlayerAnswers

### Key Design Patterns
- **Type Safety**: Shared types between frontend and backend via `@shared` path alias
- **Protected Routes**: tRPC middleware for authentication enforcement
- **Role-based Access**: Admin procedures for elevated permissions
- **Real-time Updates**: Polling-based data refresh (WebSocket planned but not implemented)

### Game Flow Architecture
- Room owners create rooms with unique 6-character codes
- Players join rooms using codes and wait in lobby
- All participants can add questions to the pool
- Owner controls game start, question progression
- Scoring uses time-based bonus system (faster answers = more points)

## External Dependencies

### Database
- **Neon Serverless Postgres**: Cloud-hosted PostgreSQL database
- Connection via `DATABASE_URL` environment variable

### Authentication
- **OAuth Service**: External OAuth provider for user login
- Configured via `OAUTH_SERVER_URL` environment variable
- Session tokens stored in HTTP-only cookies

### Storage & API Services
- **Forge API**: Internal service for storage, notifications, and image generation
- Configured via `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY`
- Supports file uploads to S3-compatible storage

### Third-Party Libraries
- **@tanstack/react-query**: Server state management
- **superjson**: JSON serialization with date/map support for tRPC
- **zod**: Runtime schema validation
- **lucide-react**: Icon library
- **sonner**: Toast notifications