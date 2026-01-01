# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Living Eulogy (domain: livingeulogy.io) is a cross-platform mobile/web app for sharing heartfelt messages about people while they're alive. Built with Expo (React Native) + Supabase + Netlify.

## Commands

```bash
# Development
npm start                           # Start Expo dev server
npx expo start                      # Same as above
npx expo start --web                # Web only

# Build & Deploy
npx expo export --platform web      # Build static web export to dist/
netlify deploy --prod --dir=dist    # Deploy to Netlify (after build)

# Type checking
npx tsc -p tsconfig.json --noEmit
```

## Architecture

### Stack
- **Frontend**: Expo (React Native) with Expo Router (file-based routing)
- **Backend**: Supabase (Auth + PostgreSQL database)
- **Hosting**: Netlify (static site + serverless functions)
- **Email**: Resend (transactional emails via Netlify function)

### Key Directories
- `app/` - Expo Router pages (file-based routing)
  - `(auth)/` - Login/signup screens (unauthenticated)
  - `(tabs)/` - Main app tabs (authenticated)
  - `view/[token].tsx` - Public share page for viewing eulogies
- `lib/` - Shared utilities
  - `supabase.ts` - Supabase client (handles SSR with `typeof window` check)
  - `auth-context.tsx` - React context for auth state
- `netlify/functions/` - Serverless functions
  - `send-eulogy-email.js` - Sends email notifications via Resend API

### Data Model (Supabase)
- `profiles` - User profiles (linked to Supabase Auth)
- `eulogies` - The messages (has `share_token` for private link sharing, `visibility` enum)

Schema with RLS policies is in `supabase/schema.sql`.

### Auth Flow
Root `app/_layout.tsx` wraps app in `AuthProvider` and redirects based on session state:
- No session → `/(auth)/login`
- Has session → `/(tabs)`

### SSR Consideration
The Supabase client in `lib/supabase.ts` checks `typeof window === 'undefined'` to handle Expo's static web export (SSR). AsyncStorage is only used client-side.

## Environment Variables

**Netlify** (set in Site configuration → Environment variables):
- `RESEND_API_KEY` - API key for sending emails

**Supabase credentials** are currently hardcoded in `lib/supabase.ts` (anon key is public).

## External Services

- **Supabase project**: hbsrqbphrugdghyizwcc.supabase.co
- **Domain**: livingeulogy.io (DNS via Netlify)
- **Email sender**: hello@livingeulogy.io (via Resend)
