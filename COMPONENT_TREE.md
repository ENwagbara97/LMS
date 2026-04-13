# Component Tree for Kreative Hub

Next.js 14 App Router leverages Server and Client components.

## Root Layout `app/layout.tsx` (Server Component)
- `Providers` (Client Component wrapper for React Context, Theme, etc.)
  - `AuthProvider` (Supabase Auth Listener)
  - `MainLayout` (Client Component)
    - `Sidebar` (Desktop / Collapsible)
    - `Topbar`
    - `BottomNav` (Mobile only)
    - `PageContent` -> `{children}`

## Dashboard & Core Functionality Pages
- Server Page: `app/(dashboard)/student/page.tsx`
  - `WelcomeBanner` (Server)
  - `StatCardsRow` (Client)
  - `ContinueLearningList` (Server/Client Hybrid)
  - `UpcomingMilestones` (Server)
  - `AnnouncementModal` (Client - mounts conditionally based on local state/unread query)

- Server Page: `app/(dashboard)/student/course/[id]/page.tsx`
  - `CourseHero` (Server)
  - `ProgressRing` (Client - Animated SVG)
  - `CourseTabs` (Client - Radix Tabs)
    - `LessonList` (Server) -> `LessonRowItem` (Client logic for "Add to Calendar")
    - `ProjectList` (Server) -> `ProjectCard` (Client)
    - `CertificateUnlockArea` (Client)

- Server Page: `app/(dashboard)/student/course/[id]/lesson/[lessonId]/page.tsx`
  - `VideoSplitLayout` (Client Layout)
    - Left Pane: 
      - `VideoPlayer` (Client - wrapper handling YouTube vs Uploaded)
      - `LessonTabs` (Overview, Transcript, Notes Client Editor)
    - Right Pane (or Bottom Sheet):
      - `QuizPanel` (Client - AI Quiz interface)

## UI Component Library (`/components/ui/`)
- `Button` (Variants: primary, secondary, ghost)
- `Card` (Variants: standard, interactive/hover)
- `Badge` (Variants: success, warning, error, info, pastel category)
- `ProgressLine` (Thin line progress for tables/cells)
- `ProgressRing` (Circular SVG gauge)
- `Input`, `Textarea` (Custom corners 10px)
- `Table` (Maham-specific row styling)
- `Modal`, `BottomSheet` (Dialog radix primitives)

## Specialized Feature Components (`/components/features/`)
- `VideoPlayer`
  - `YouTubeWrapper`
  - `HTML5Wrapper`
  - `CustomControls` (Play/Pause, Timeline, CC toggle, Quality)
- `QuizInterface`
  - `QuestionCard`
  - `ScoreGauge`
- `CertificateCanvas`
  - `html2canvas` renderer logic overlaying text fields over template image
- `CalendarExportButton`
  - `.ics` blob generator
