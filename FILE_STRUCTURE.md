# Next.js 14 File Structure

```text
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── setup-password/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx         (Main layout w/ Sidebar, Topbar, BottomNav)
│   │   ├── admin/
│   │   │   ├── page.tsx       (Dashboard & Track Status)
│   │   │   ├── students/
│   │   │   │   └── page.tsx   (Student Management Table)
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/builder/
│   │   │   │       └── page.tsx (Course builder drag & drop)
│   │   │   ├── announcements/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx   (Brand & Logo management)
│   │   ├── student/
│   │   │   ├── page.tsx       (Student Home)
│   │   │   └── courses/
│   │   │       └── [id]/
│   │   │           ├── page.tsx (Course Overview, Tabs)
│   │   │           ├── project-submission/
│   │   │           │   └── page.tsx
│   │   │           └── lesson/
│   │   │               └── [lessonId]/
│   │   │                   └── page.tsx (Video Split Layout)
│   ├── layout.tsx             (Root HTML & Contexts)
│   └── globals.css            (Imports DESIGN_TOKENS)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── BottomNav.tsx
│   ├── ui/                    (shadcn + standard generic UI)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   └── features/
│       ├── video-player/
│       ├── quiz/
│       ├── certificate/
│       └── admin/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils.ts
├── hooks/
│   ├── use-mobile.tsx         (Detecting screen size)
│   └── use-video-progress.tsx
└── types/
    └── database.types.ts      (Supabase generated types)
```
