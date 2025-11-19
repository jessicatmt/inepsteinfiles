# In The Epstein Files - Search Application

## Overview

This is a web application that allows users to search through publicly available Epstein-related court documents, depositions, and flight logs. The application provides a bold, single-purpose interface inspired by isabevigodadead.com, delivering immediate yes/no answers with supporting document references. Users can search for any name and share results via social media.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (replacing React Router)
- TanStack Query (React Query) for server state management and caching

**UI Component System:**
- shadcn/ui component library with Radix UI primitives for accessibility
- Tailwind CSS for utility-first styling with custom design tokens
- "New York" style variant with neutral color scheme
- Custom typography using Public Sans font family
- Design system emphasizes bold typography and single-purpose clarity

**Routing Structure:**
- `/` - Home page with centered search input
- `/:name` - Dynamic search results page showing YES/NO answer with document matches
- `/about` - Information about data sources and methodology

**State Management:**
- React Query handles all API data fetching with automatic caching
- Query key pattern: `['/api/search', name]` for search results
- No global state management needed due to simple data flow

**Key Design Principles:**
- Mobile-first responsive design
- Progressive disclosure: answer first, details below
- Zero-friction social sharing via copy link and Twitter integration
- Accessibility through Radix UI primitives and semantic HTML

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and routing
- TypeScript throughout for type safety
- Development mode uses Vite middleware for HMR
- Production mode serves pre-built static assets

**API Endpoints:**
- `GET /api/search/:name` - Search for name in document database, returns SearchResult with matches

**Data Storage Strategy:**
- In-memory storage implementation (MemStorage class)
- Document interface defines: title, pageNumber, excerpt, sourceUrl, date, names array
- Search algorithm uses case-insensitive matching with kebab-case URL normalization
- Designed to be replaceable with persistent database via IStorage interface

**Data Model:**
- Documents contain multiple names for aliasing (e.g., "Bill Clinton", "William Clinton")
- SearchResult contains found boolean and array of DocumentMatch objects
- Each match includes excerpt, page number, source URL, and date

**Database Schema (Drizzle ORM):**
- PostgreSQL-ready schema defined in shared/schema.ts
- Documents table with text arrays for names, supporting future database migration
- Schema uses Drizzle-Zod for runtime validation
- Currently configured for Neon serverless PostgreSQL but not actively used

### External Dependencies

**Third-Party Services:**
- Google Fonts API for Public Sans typography
- DocumentCloud for source document hosting (referenced in seed data)
- Twitter/X API for social sharing integration

**Key NPM Packages:**
- `@neondatabase/serverless` - Neon PostgreSQL driver (configured but not actively used)
- `drizzle-orm` & `drizzle-kit` - Database ORM and migration tools
- `@tanstack/react-query` - Server state management
- `wouter` - Lightweight routing
- `@radix-ui/*` - Accessible UI primitives
- `tailwindcss` - Utility-first CSS framework
- `zod` - Schema validation

**Development Tools:**
- Replit-specific plugins for development banner and error overlay
- TypeScript for static type checking
- ESBuild for production server bundling

**Design Assets:**
- Custom favicon and OG image for social sharing
- Design guidelines document defines typography scale and spacing system
- Color system uses HSL values with CSS custom properties for theming