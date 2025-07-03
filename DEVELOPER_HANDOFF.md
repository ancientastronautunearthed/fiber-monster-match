# Developer Handoff Document

## Project Overview

This is a comprehensive health and wellness tracking application with gamification elements, photo challenges, community features, and AI-powered insights. The app uses a "Light vs Blight" theme where users earn "Light" points through positive actions and community engagement.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** as build tool and dev server
- **Tailwind CSS** for styling with custom design system
- **Shadcn/UI** component library for consistent UI components
- **React Router DOM** for client-side routing
- **React Query (@tanstack/react-query)** for data fetching and caching
- **Lucide React** for icons
- **React Hook Form** with Zod validation
- **Recharts** for data visualization

### Backend & Database
- **Supabase** as Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication system
  - File storage with multiple buckets
  - Edge Functions for serverless logic

### Key Dependencies
```json
{
  "@supabase/supabase-js": "^2.50.3",
  "@tanstack/react-query": "^5.56.2",
  "react": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "class-variance-authority": "^0.7.1",
  "tailwind-merge": "^2.5.2",
  "zod": "^3.23.8"
}
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn UI components
│   ├── AchievementCard.tsx
│   ├── CameraCapture.tsx
│   ├── CommunityActionsCard.tsx
│   ├── DailyStreakCard.tsx
│   ├── LightCounter.tsx
│   ├── PointsSummary.tsx
│   ├── SupportActions.tsx
│   └── TierBadge.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx
│   ├── useCamera.tsx
│   ├── useCommunityActions.tsx
│   ├── useDailyStreak.tsx
│   ├── usePoints.tsx
│   └── use-toast.ts
├── pages/               # Page components
│   ├── Index.tsx        # Main dashboard
│   ├── Achievements.tsx
│   ├── Analytics.tsx
│   ├── Auth.tsx
│   ├── Connections.tsx
│   ├── MonsterCreator.tsx
│   ├── PhotoChallenge.tsx
│   ├── Profile.tsx
│   ├── ProfileRegistration.tsx
│   └── WhatWorks.tsx
├── data/                # Static data and configurations
├── integrations/        # External service integrations
│   └── supabase/
├── lib/                 # Utility functions
└── main.tsx            # Application entry point
```

## Database Schema

### Core Tables

#### `profiles`
User profile data with extensive health and preference tracking:
- Basic info: `display_name`, `username`, `bio`, `avatar_url`
- Health data: `primary_symptoms`, `condition_duration`, `symptom_severity`
- Preferences: `likes`, `dislikes`, `trigger_foods`, `safe_foods`
- Monster customization: `monster_keywords`, `monster_personality`
- Privacy: `analytics_consent`, `research_participation_consent`

#### `user_tiers`
Gamification tier system:
- `current_tier` (1-7): Spark → Lamplighter → Beacon → Sentinel → Guardian → Luminary → Citadel Heart
- `total_light`: Total Light points earned
- Auto-updating based on Light accumulation

#### `points_transactions`
Complete audit trail of all Light point activities:
- `action_type`: Type of action performed
- `points_amount`: Light earned/spent
- `source_type`: Where the action originated
- `metadata`: Additional context data

#### `daily_activities`
Daily engagement tracking:
- `activity_date`: Date of activities
- `daily_light_earned`: Total Light earned that day
- `activities_completed`: JSON of completed activities
- `streak_bonus`: Bonus Light from streaks

#### `community_actions`
Community engagement system:
- Action types: `beacon_hope`, `silence_whispers`, `expose_deceit`
- Daily limits and Light rewards
- Target user/content tracking

#### `photo_challenges`
Photo-based progress tracking:
- Challenge templates with pose instructions
- Daily photo capture with AI feedback
- Progress tracking and streak management

#### `relief_strategies`
User-contributed wellness strategies:
- Community voting system
- Categorization and tagging
- Approval workflow

## Key Systems

### Authentication System
- Supabase Auth with email/password
- Automatic profile creation via database trigger
- Row Level Security (RLS) policies for data protection
- Session management with automatic refresh

### Gamification System ("Light vs Blight")

#### Light Points System
Users earn Light through various activities:
- **Daily Login**: 5 Light + streak bonuses
- **Photo Challenges**: 15 base + 10 first photo + streak bonuses
- **Community Actions**: 5-10 Light per action (daily limits)
- **Profile Completion**: 25 Light
- **Strategy Sharing**: 20 Light
- **Monster Creation**: 15 Light

#### Tier Progression
Automatic tier advancement based on total Light:
- Tier 1 (Spark): 0 Light
- Tier 2 (Lamplighter): 250 Light
- Tier 3 (Beacon): 1,000 Light
- Tier 4 (Sentinel): 3,000 Light
- Tier 5 (Guardian): 7,000 Light
- Tier 6 (Luminary): 15,000 Light
- Tier 7 (Citadel Heart): 30,000 Light

#### Daily Streaks
- Login streak tracking with progressive bonuses
- Streak multipliers for consistent engagement
- Visual progress indicators

### Community Actions System
Three daily community actions with limits:
- **Beacon of Hope**: General user support (5/day, 10 Light each)
- **Silence Whispers**: Support for venting posts (10/day, 5 Light each)
- **Expose Deceit**: Upvote research strategies (15/day, 5 Light each)

### Photo Challenge System
- Template-based challenges with pose guides
- Daily photo capture with camera integration
- AI feedback and sentiment analysis
- Progress tracking with streaks and statistics
- Timelapse video generation capabilities

## Design System

### Color Palette (HSL)
The application uses a comprehensive design system defined in `src/index.css`:

```css
:root {
  --primary: 262 83% 58%;        /* Purple primary */
  --primary-foreground: 210 40% 98%;
  --secondary: 220 14% 96%;
  --accent: 220 14% 96%;
  /* ... complete color system */
}
```

### Component Architecture
- All UI components use semantic tokens from the design system
- Consistent spacing, typography, and color usage
- Dark/light mode support
- Responsive design patterns

## Supabase Configuration

### Edge Functions
Located in `supabase/functions/`:
- `generate-monster-image`: AI image generation for monster avatars
- `process-analytics`: Data processing for community insights
- `test-google-key`: Service validation

### Storage Buckets
- `avatars`: Public user profile images
- `challenge-photos`: Private user photo challenges
- `challenge-templates`: Public challenge guide images
- `achievement-icons`: Public achievement badge images
- `timelapse-videos`: Private generated timelapses

### Row Level Security (RLS)
Comprehensive security policies ensure:
- Users only access their own data
- Public data is properly exposed
- Community features respect privacy settings
- Admin functions are restricted

## Development Workflow

### Environment Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set up Supabase project
4. Configure environment variables
5. Run development server: `npm run dev`

### Code Standards
- TypeScript for type safety
- ESLint configuration for code quality
- Consistent naming conventions
- Component composition over inheritance
- Custom hooks for business logic

### Testing Strategy
- Component testing with React Testing Library
- Integration testing for critical user flows
- Database testing with Supabase test utilities
- End-to-end testing for key features

## Known Issues & TODOs

### High Priority
1. **AI Image Generation**: Complete implementation in MonsterCreator
   - Integrate with Supabase edge function
   - Handle API rate limits and errors
   - Implement image caching strategy

2. **Real-time Features**: 
   - Live updates for community actions
   - Real-time notifications for achievements
   - Live leaderboards and community stats

3. **Mobile Optimization**:
   - Camera capture improvements
   - Touch gesture enhancements
   - Offline capability for photo challenges

### Medium Priority
1. **Analytics Dashboard**: Complete implementation with:
   - Personal progress visualization
   - Community insights integration
   - Export functionality

2. **Advanced Matching**: Enhance connection system with:
   - Compatibility scoring improvements
   - Recommendation engine
   - Privacy controls

3. **Notification System**:
   - Push notifications for daily reminders
   - Achievement celebrations
   - Community interaction alerts

### Low Priority
1. **Data Export**: User data portability features
2. **Advanced Filtering**: Enhanced search and filter options
3. **Accessibility**: WCAG compliance improvements

## Performance Considerations

### Optimization Strategies
- React Query for efficient data caching
- Lazy loading for route-based code splitting
- Image optimization and compression
- Database query optimization with proper indexing

### Monitoring
- Error tracking integration recommended
- Performance monitoring for key user flows
- Database performance monitoring via Supabase

## Security Considerations

### Data Protection
- All sensitive data encrypted at rest
- HTTPS enforced for all communications
- Input validation and sanitization
- Rate limiting on API endpoints

### Privacy Compliance
- User consent tracking
- Data anonymization options
- Right to deletion implementation
- Privacy policy integration

## Deployment

### Production Environment
- Hosted on Lovable platform
- Automatic deployments from main branch
- Environment variable management via Supabase
- CDN integration for static assets

### Configuration
Key environment variables (managed via Supabase secrets):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `HUGGING_FACE_ACCESS_TOKEN`
- `GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY`

## API Integration Points

### External Services
- **Hugging Face**: AI image generation
- **Google Cloud**: Potential future integrations
- **Supabase**: Primary backend service

### Rate Limiting
- Implement appropriate rate limiting for AI services
- User-based quotas for expensive operations
- Graceful degradation for service unavailability

## Future Enhancements

### Planned Features
1. **AI-Powered Insights**: Personal health pattern recognition
2. **Telemedicine Integration**: Healthcare provider connections
3. **Wearable Device Sync**: Fitness tracker integration
4. **Advanced Analytics**: Predictive health modeling
5. **Social Features**: Group challenges and communities

### Technical Debt
1. **Component Refactoring**: Some large components need splitting
2. **Type Safety**: Improve TypeScript coverage
3. **Error Handling**: Standardize error boundaries
4. **Performance**: Optimize bundle size and loading times

## Getting Help

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/UI Docs](https://ui.shadcn.com/)

### Community
- Project Discord/Slack channels
- Code review guidelines
- Architecture decision records
- Development best practices

## Contact Information

For questions about this application, contact the development team or refer to the project documentation in the repository.

---

**Last Updated**: [Current Date]
**Document Version**: 1.0
**Maintainer**: Development Team