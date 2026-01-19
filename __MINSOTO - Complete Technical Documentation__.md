<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# **MINSOTO - Complete Technical Documentation**

**Version:** 1.0
**Last Updated:** December 13, 2024
**Document Type:** Technical Specification \& Product Vision
**Target Audience:** Senior Developers, Product Team, Technical Leadership

***

# **Table of Contents**

1. [Executive Summary](#1-executive-summary)
2. [Product Vision \& Philosophy](#2-product-vision--philosophy)
3. [Core Features Overview](#3-core-features-overview)
4. [System Architecture](#4-system-architecture)
5. [Database Schema](#5-database-schema)
6. [API Specifications](#6-api-specifications)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Feature Specifications](#8-feature-specifications)
9. [User Flows](#9-user-flows)
10. [Design System](#10-design-system)
11. [Security \& Privacy](#11-security--privacy)
12. [Development Roadmap](#12-development-roadmap)
13. [Deployment \& Infrastructure](#13-deployment--infrastructure)
14. [Testing Strategy](#14-testing-strategy)
15. [Performance Requirements](#15-performance-requirements)

***

# **1. Executive Summary**

## **1.1 What is Minsoto?**

Minsoto is a **mindful social productivity platform** that combines social networking with personal development tools. Unlike traditional social media designed for endless scrolling and distraction, Minsoto is built around focus, intentional growth, and meaningful connections.

**Tagline:** *"Mindfulness in Motion"*

**Etymology:** Minsoto = "Mindfulness" + "Soto" (曹洞, Japanese Zen Buddhism school emphasizing meditation and presence)

***

## **1.2 Core Value Proposition**

| **Traditional Social Media** | **Minsoto** |
| :-- | :-- |
| Passive consumption | Active creation \& growth |
| Algorithmic addiction | Intentional engagement |
| Surface-level connections | Deep, purpose-driven relationships |
| Time-wasting | Productivity-focused |
| Privacy concerns | Privacy-first design |
| Generic profiles | Customizable, functional dashboards |


***

## **1.3 Target Users**

1. **Students** - College students seeking productive communities and study accountability
2. **Professionals** - Remote workers wanting organized networking and habit tracking
3. **Creators** - Content creators managing projects and building communities
4. **Organizations** - Colleges/companies wanting internal networking platforms
5. **Growth-Focused Individuals** - Anyone prioritizing personal development over mindless scrolling

***

# **2. Product Vision \& Philosophy**

## **2.1 Guiding Principles**

### **Principle 1: Mindful by Design**

Every feature must serve a purpose. No infinite scroll, no addictive notifications, no vanity metrics.

### **Principle 2: Function Over Form**

Beautiful minimalist design, but functionality comes first. Every pixel serves the user's goals.

### **Principle 3: Community Over Audience**

Focus on quality connections, not follower counts. Two-tier relationship system (Connections + Friends).

### **Principle 4: Customization \& Control**

Users own their experience. Customizable profiles, privacy controls, data portability.

### **Principle 5: Productivity First**

Social features enhance productivity, not distract from it. Integrated task management, habit tracking, goal setting.

***

## **2.2 Design Philosophy**

**Zen Minimalism:**

- Black \& white base palette with subtle accent colors
- Japanese aesthetic influences (kanji characters, clean lines, negative space)
- Nothing UI-inspired widget system
- Grid-based layouts with precise alignment
- Subtle animations, never distracting

**Visual Language:**

- Typography: Geist Sans (primary), Geist Mono (code/data)
- Border-based design (no heavy shadows)
- Decorative corner brackets on key elements
- Opacity-based hierarchy (100% → 70% → 50% → 30%)
- Kanji characters as decorative elements (静寂正念)

***

# **3. Core Features Overview**

## **3.1 Feature Map**

```
MINSOTO PLATFORM
│
├── AUTHENTICATION & ONBOARDING
│   ├── Google OAuth Integration
│   ├── Username Setup
│   ├── Organization Detection
│   └── Profile Initialization
│
├── USER DASHBOARD (NEW - Personal Productivity Hub)
│   ├── Private Widget Canvas
│   ├── Task Management
│   ├── Habit Tracking & Streaks
│   ├── Daily Schedule
│   ├── Goal Tracking
│   ├── Stats & Analytics
│   ├── Quick Actions
│   └── Cross-Device Sync
│
├── PUBLIC PROFILE (Social Layer)
│   ├── Customizable Widget Grid
│   ├── Public/Private Widget Toggle
│   ├── Profile Information
│   ├── Interest Tags
│   ├── Organization Badges
│   ├── Connection Stats
│   └── Theme Customization
│
├── CONNECTIONS & NETWORKING
│   ├── Two-Tier System (Connections → Friends)
│   ├── Connection Requests
│   ├── Friend Upgrades
│   ├── Organization-Based Discovery
│   ├── Interest-Based Matching
│   └── Mutual Connection Discovery
│
├── ORGANIZATIONS
│   ├── Auto-Detection via Email Domain
│   ├── Manual Verification (Google OAuth)
│   ├── Organization Directory
│   ├── Member Discovery
│   ├── Organization Feeds
│   └── Admin Controls
│
├── FEEDS & CONTENT
│   ├── Global Feed (curated)
│   ├── Interest-Based Feed
│   ├── Organization Feed
│   ├── Friends Feed
│   ├── Post Creation (text, images, links)
│   ├── Reactions & Comments
│   └── Content Filtering
│
├── CIRCLES (Growth Communities)
│   ├── Create/Join Circles
│   ├── Circle Types (Study, Project, Habit, Interest)
│   ├── Circle Feed & Chat
│   ├── Shared Goals & Challenges
│   ├── Member Roles (Admin, Moderator, Member)
│   └── Circle Analytics
│
├── WIDGETS (Productivity Modules)
│   ├── Tasks & Projects (Kanban)
│   ├── Habit Streaks (Daily/Weekly)
│   ├── Habit Graph (Contribution-style)
│   ├── Today's Schedule
│   ├── Goals Widget
│   ├── Stats Widget
│   ├── Activity Graph
│   ├── Interests Display
│   ├── Highlighted Post
│   ├── Circle Summary
│   └── Community Extensions
│
├── MESSAGING (Future Phase)
│   ├── Direct Messages
│   ├── Group Chats
│   ├── Circle Messaging
│   └── Rich Media Support
│
└── EXTENSIONS & PLUGINS (Community-Driven)
    ├── Plugin Marketplace
    ├── Developer API
    ├── Custom Widget Development
    └── Integration Ecosystem
```


***

## **3.2 Feature Priority Matrix**

| **Feature** | **Phase** | **Priority** | **Status** |
| :-- | :-- | :-- | :-- |
| Authentication (Google OAuth) | 0 | Critical | ✅ Complete |
| Profile \& Widget System | 0 | Critical | ✅ Complete |
| Organizations | 2A | High | 🚧 In Progress |
| Connections System | 2A | High | 🚧 In Progress |
| **User Dashboard** | 2B | High | 📋 Planned |
| Friend Upgrade | 2C | Medium | 📋 Planned |
| Feed \& Posts | 3 | Medium | 📋 Planned |
| Circles | 4 | Medium | 📋 Planned |
| Messaging | 5 | Low | 📋 Planned |
| Extensions API | 6 | Low | 📋 Planned |


***

# **4. System Architecture**

## **4.1 Technology Stack**

### **Frontend**

```yaml
Framework: Next.js 15 (App Router)
Language: TypeScript
Styling: Tailwind CSS
State Management: Zustand
API Client: Axios
Drag & Drop: react-grid-layout / @dnd-kit
Charts: Recharts
Animations: Framer Motion
Icons: Lucide React
Deployment: Vercel
```


### **Backend**

```yaml
Framework: Django 4.2
API: Django REST Framework
Authentication: JWT + Google OAuth 2.0
Database: PostgreSQL (Neon)
ORM: Django ORM
Task Queue: Celery (future)
Caching: Redis (future)
File Storage: AWS S3 / Cloudinary (future)
Deployment: Render
```


### **Infrastructure**

```yaml
Database: Neon PostgreSQL (serverless)
CDN: Vercel Edge Network
Email: Gmail SMTP / SendGrid (future)
Monitoring: Sentry (future)
Analytics: PostHog / Mixpanel (future)
```


***

## **4.2 System Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Web App    │  │  Mobile PWA  │  │ Desktop PWA  │        │
│  │  (Next.js)   │  │  (Next.js)   │  │  (Next.js)   │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Vercel CDN    │
                    └────────┬────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                      API GATEWAY                                │
├────────────────────────────┼────────────────────────────────────┤
│                             │                                    │
│                    ┌────────▼────────┐                          │
│                    │  Django REST    │                          │
│                    │   Framework     │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│         ┌───────────────────┼───────────────────┐              │
│         │                   │                   │              │
│   ┌─────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐       │
│   │   Auth     │    │  Business   │    │   Data      │       │
│   │  Services  │    │   Logic     │    │  Services   │       │
│   └─────┬──────┘    └──────┬──────┘    └──────┬──────┘       │
│         │                   │                   │              │
└─────────┼───────────────────┼───────────────────┼──────────────┘
          │                   │                   │
          │         ┌─────────▼─────────┐         │
          │         │   Django ORM      │         │
          │         └─────────┬─────────┘         │
          │                   │                   │
┌─────────┼───────────────────┼───────────────────┼──────────────┐
│         │         DATABASE LAYER                │              │
├─────────┼───────────────────┼───────────────────┼──────────────┤
│         │                   │                   │              │
│   ┌─────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐       │
│   │  Google    │    │ PostgreSQL  │    │   Redis     │       │
│   │   OAuth    │    │   (Neon)    │    │  (Future)   │       │
│   └────────────┘    └─────────────┘    └─────────────┘       │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                           │
├────────────────────────────────────────────────────────────────┤
│  • Google OAuth 2.0      • Email (SMTP)                       │
│  • AWS S3 (future)       • SendGrid (future)                  │
│  • Cloudinary (future)   • Sentry (future)                    │
└────────────────────────────────────────────────────────────────┘
```


***

## **4.3 Data Flow Architecture**

### **Authentication Flow**

```
User → Google OAuth → Backend Token Verification → JWT Generation → 
Frontend Storage → API Requests with JWT → Backend Verification → Response
```


### **Profile Loading Flow**

```
User visits /profile/username → 
API: GET /profile/{username} → 
Check ownership → 
Filter widgets by visibility → 
API: GET /widgets/data → 
Merge data → 
Render profile
```


### **Widget Interaction Flow**

```
User adds/edits widget → 
Update local state (optimistic) → 
API: PATCH /profile/me/layout → 
Backend validation → 
Save to database → 
Confirm to frontend
```


***

# **5. Database Schema**

## **5.1 Complete ERD (Entity Relationship Diagram)**

```
┌─────────────────────┐
│     CustomUser      │
├─────────────────────┤
│ id (UUID, PK)       │
│ username            │
│ email (unique)      │
│ google_id           │
│ first_name          │
│ last_name           │
│ is_setup_complete   │
│ date_joined         │
└──────────┬──────────┘
           │
           │ 1:1
           │
┌──────────▼──────────┐
│      Profile        │
├─────────────────────┤
│ id (UUID, PK)       │
│ user_id (FK)        │
│ bio                 │
│ profile_picture_url │
│ theme               │
│ layout (JSON)       │◄──────────┐
│ created_at          │           │
│ updated_at          │           │
└─────────────────────┘           │
                                  │
                                  │  Stores widget
                                  │  configuration
                                  │
┌─────────────────────────────────┴──────────────┐
│ Layout JSON Structure:                         │
│ {                                              │
│   "widgets": [                                 │
│     {                                          │
│       "id": "uuid",                            │
│       "type": "tasks",                         │
│       "position": {"x": 0, "y": 0},            │
│       "size": {"w": 2, "h": 2},                │
│       "visibility": "public|private",          │
│       "config": {}                             │
│     }                                          │
│   ]                                            │
│ }                                              │
└────────────────────────────────────────────────┘

┌─────────────────────┐
│    Organization     │
├─────────────────────┤
│ id (UUID, PK)       │
│ name                │
│ domain (unique)     │
│ logo_url            │
│ org_type            │
│ description         │
│ is_verified         │
│ website             │
│ location            │
│ created_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────────────┐
│ OrganizationMembership      │
├─────────────────────────────┤
│ id (UUID, PK)               │
│ user_id (FK)                │
│ organization_id (FK)        │
│ verification_status         │
│ verification_email          │
│ role                        │
│ is_primary                  │
│ is_visible                  │
│ show_on_profile             │
│ joined_at                   │
└─────────────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│    CustomUser       │         │    CustomUser       │
│  (from_user)        │         │    (to_user)        │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           │                               │
           └───────────┬───────────────────┘
                       │
                       │ N:N (self-referential)
                       │
           ┌───────────▼──────────┐
           │     Connection       │
           ├──────────────────────┤
           │ id (UUID, PK)        │
           │ from_user_id (FK)    │
           │ to_user_id (FK)      │
           │ status               │ ← pending/accepted/rejected
           │ connection_type      │ ← connection/friend
           │ message              │
           │ created_at           │
           │ updated_at           │
           └──────────────────────┘

┌─────────────────────┐
│      Interest       │
├─────────────────────┤
│ id (UUID, PK)       │
│ name (unique)       │
│ description         │
│ created_at          │
└──────────┬──────────┘
           │
           │ N:N
           │
┌──────────▼──────────┐
│   UserInterest      │
├─────────────────────┤
│ id (UUID, PK)       │
│ user_id (FK)        │
│ interest_id (FK)    │
│ is_public           │
│ added_at            │
└─────────────────────┘

┌─────────────────────┐
│    HabitStreak      │
├─────────────────────┤
│ id (UUID, PK)       │
│ user_id (FK)        │
│ name                │
│ description         │
│ current_streak      │
│ longest_streak      │
│ is_public           │
│ created_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│     HabitLog        │
├─────────────────────┤
│ id (UUID, PK)       │
│ habit_id (FK)       │
│ date (unique)       │
│ completed           │
│ notes               │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│        Task         │
├─────────────────────┤
│ id (UUID, PK)       │
│ user_id (FK)        │
│ title               │
│ description         │
│ status              │ ← todo/in_progress/completed
│ priority            │ ← low/medium/high
│ due_date            │
│ is_public           │
│ created_at          │
│ updated_at          │
└─────────────────────┘

┌─────────────────────┐
│        Post         │ (Future Phase 3)
├─────────────────────┤
│ id (UUID, PK)       │
│ author_id (FK)      │
│ content             │
│ image_urls (JSON)   │
│ visibility          │
│ post_type           │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│      Comment        │
├─────────────────────┤
│ id (UUID, PK)       │
│ post_id (FK)        │
│ author_id (FK)      │
│ content             │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│       Circle        │ (Future Phase 4)
├─────────────────────┤
│ id (UUID, PK)       │
│ name                │
│ description         │
│ circle_type         │
│ is_private          │
│ created_by (FK)     │
│ created_at          │
└──────────┬──────────┘
           │
           │ N:N
           │
┌──────────▼──────────┐
│  CircleMembership   │
├─────────────────────┤
│ id (UUID, PK)       │
│ circle_id (FK)      │
│ user_id (FK)        │
│ role                │
│ joined_at           │
└─────────────────────┘
```


***

## **5.2 Database Indexes**

```sql
-- Performance-critical indexes

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Organizations
CREATE INDEX idx_org_domain ON organizations(domain);
CREATE INDEX idx_org_verified ON organizations(is_verified);

-- Organization Memberships
CREATE INDEX idx_orgmem_user_status ON organization_memberships(user_id, verification_status);
CREATE INDEX idx_orgmem_org_status ON organization_memberships(organization_id, verification_status);

-- Connections
CREATE INDEX idx_conn_from_status ON connections(from_user_id, status);
CREATE INDEX idx_conn_to_status ON connections(to_user_id, status);
CREATE INDEX idx_conn_status_type ON connections(status, connection_type);

-- Tasks
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Habits
CREATE INDEX idx_habits_user ON habit_streaks(user_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(habit_id, date);
```


***

## **5.3 Database Constraints**

```sql
-- Prevent self-connections
ALTER TABLE connections ADD CONSTRAINT prevent_self_connection 
CHECK (from_user_id != to_user_id);

-- Unique connection pairs (bidirectional)
CREATE UNIQUE INDEX idx_unique_connection 
ON connections(LEAST(from_user_id, to_user_id), GREATEST(from_user_id, to_user_id));

-- Unique organization membership
ALTER TABLE organization_memberships ADD CONSTRAINT unique_org_membership 
UNIQUE (user_id, organization_id);

-- Unique habit log per day
ALTER TABLE habit_logs ADD CONSTRAINT unique_habit_date 
UNIQUE (habit_id, date);
```


***

# **6. API Specifications**

## **6.1 API Base URL**

```
Production: https://api.minsoto.app
Development: http://localhost:8000/api
```


## **6.2 Authentication**

All API requests (except authentication endpoints) require JWT token in header:

```http
Authorization: Bearer <access_token>
```

**Token Refresh:**

```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "<refresh_token>"
}
```


***

## **6.3 Complete API Endpoint List**

### **Authentication Endpoints**

```http
POST   /api/auth/google/               # Google OAuth login
POST   /api/auth/setup-username/       # Set username after signup
POST   /api/auth/token/refresh/        # Refresh JWT token
```


### **User Endpoints**

```http
GET    /api/user/me/                   # Get current user info
PATCH  /api/user/me/                   # Update user info
```


### **Profile Endpoints**

```http
GET    /api/profile/me/                # Get own profile
PATCH  /api/profile/me/                # Update own profile
GET    /api/profile/{username}/        # Get user profile (visibility filtered)
PATCH  /api/profile/me/layout/         # Update widget layout
```


### **Organization Endpoints**

```http
GET    /api/organizations/             # List all verified organizations
GET    /api/organizations/{domain}/    # Get organization details & members
POST   /api/organizations/verify/      # Verify org membership with OAuth
GET    /api/organizations/my/          # Get user's organizations
DELETE /api/organizations/{id}/leave/  # Leave organization
```


### **Connection Endpoints**

```http
GET    /api/connections/               # List accepted connections (?type=all|friends|connections)
GET    /api/connections/pending/       # Get received pending requests
GET    /api/connections/sent/          # Get sent pending requests
POST   /api/connections/request/       # Send connection request
POST   /api/connections/accept/        # Accept connection request
POST   /api/connections/reject/        # Reject connection request
DELETE /api/connections/{id}/remove/   # Remove connection
POST   /api/connections/upgrade/       # Upgrade connection to friend
GET    /api/connections/status/{user_id}/  # Check connection status with user
```


### **Discovery Endpoints**

```http
GET    /api/discover/                  # Discover users (?search=&organization=)
GET    /api/discover/suggested/        # Get suggested connections (future)
```


### **Widget Data Endpoints**

```http
GET    /api/widgets/data/              # Get all widget data for current user
```


### **Task Endpoints**

```http
GET    /api/tasks/                     # List tasks (?status=todo|in_progress|completed)
POST   /api/tasks/                     # Create task
GET    /api/tasks/{id}/                # Get task details
PATCH  /api/tasks/{id}/                # Update task
DELETE /api/tasks/{id}/                # Delete task
```


### **Habit Endpoints**

```http
GET    /api/habits/                    # List habits
POST   /api/habits/                    # Create habit
GET    /api/habits/{id}/               # Get habit details
PATCH  /api/habits/{id}/               # Update habit
DELETE /api/habits/{id}/               # Delete habit
POST   /api/habits/{id}/log/           # Log habit completion for date
```


### **Interest Endpoints**

```http
GET    /api/interests/                 # List all available interests
POST   /api/interests/add/             # Add interest to profile
DELETE /api/interests/{id}/remove/     # Remove interest from profile
```


***

## **6.4 API Request/Response Examples**

### **Example: Send Connection Request**

**Request:**

```http
POST /api/connections/request/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "to_user_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Hi! I saw we're both in IIIT Sri City and interested in photography. Would love to connect!"
}
```

**Response (201 Created):**

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "from_user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "kenji_a",
    "first_name": "Kenji",
    "last_name": "Aoki"
  },
  "to_user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "sakura_m",
    "first_name": "Sakura",
    "last_name": "Miyamoto"
  },
  "status": "pending",
  "connection_type": "connection",
  "message": "Hi! I saw we're both in IIIT Sri City and interested in photography. Would love to connect!",
  "created_at": "2024-12-13T03:24:00.000Z"
}
```


### **Example: Get Profile with Widget Layout**

**Request:**

```http
GET /api/profile/kenji_a/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**

```json
{
  "profile": {
    "id": "abc12345-...",
    "user": {
      "id": "123e4567-...",
      "username": "kenji_a",
      "email": "kenji@iiits.in",
      "first_name": "Kenji",
      "last_name": "Aoki"
    },
    "bio": "Photography enthusiast | Meditation practitioner | Building Minsoto",
    "profile_picture_url": "https://...",
    "theme": "dark",
    "layout": {
      "widgets": [
        {
          "id": "widget-1",
          "type": "tasks",
          "position": {"x": 0, "y": 0},
          "size": {"w": 2, "h": 2},
          "visibility": "public",
          "config": {}
        },
        {
          "id": "widget-2",
          "type": "habit-streak",
          "position": {"x": 2, "y": 0},
          "size": {"w": 1, "h": 2},
          "visibility": "private",
          "config": {}
        }
      ]
    },
    "interests": [
      {"id": "int-1", "interest_name": "Photography", "is_public": true},
      {"id": "int-2", "interest_name": "Meditation", "is_public": true}
    ],
    "stats": {
      "connections": 45,
      "friends": 12,
      "total_tasks": 23,
      "completed_tasks": 18,
      "active_habits": 5
    }
  },
  "is_owner": false
}
```


***

## **6.5 Error Response Format**

All errors follow this structure:

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific field error"
  }
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

***

# **7. Frontend Architecture**

## **7.1 Project Structure**

```
minsoto-frontend/
├── public/
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home/redirect
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── setup-username/
│   │   │   └── page.tsx
│   │   ├── dashboard/                # NEW: Personal dashboard
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── profile/
│   │   │   └── [username]/
│   │   │       └── page.tsx
│   │   ├── connections/
│   │   │   ├── page.tsx              # Connections list
│   │   │   ├── pending/
│   │   │   │   └── page.tsx          # Pending requests
│   │   │   └── friends/
│   │   │       └── page.tsx          # Friends list
│   │   ├── discover/
│   │   │   └── page.tsx              # User discovery
│   │   ├── community/
│   │   │   ├── page.tsx              # Organizations list
│   │   │   └── [domain]/
│   │   │       └── page.tsx          # Organization directory
│   │   ├── feed/
│   │   │   └── page.tsx              # Global feed (future)
│   │   ├── circles/
│   │   │   ├── page.tsx              # Circles list (future)
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── profile/
│   │       ├── privacy/
│   │       └── organizations/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── profile/
│   │   │   ├── ProfileSidebar.tsx
│   │   │   ├── ProfileCanvas.tsx
│   │   │   └── WidgetLibrary.tsx
│   │   ├── dashboard/                # NEW: Dashboard components
│   │   │   ├── DashboardGrid.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── DashboardStats.tsx
│   │   ├── widgets/
│   │   │   ├── BaseWidget.tsx
│   │   │   ├── TasksWidget.tsx
│   │   │   ├── HabitStreakWidget.tsx
│   │   │   ├── HabitGraphWidget.tsx
│   │   │   ├── InterestsWidget.tsx
│   │   │   ├── StatsWidget.tsx
│   │   │   └── ... (more widgets)
│   │   ├── connections/
│   │   │   ├── ConnectionCard.tsx
│   │   │   ├── ConnectionRequest.tsx
│   │   │   └── ConnectionButton.tsx
│   │   ├── organizations/
│   │   │   ├── OrgCard.tsx
│   │   │   ├── OrgDirectory.tsx
│   │   │   └── OrgVerification.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Loading.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                    # Axios instance
│   │   ├── utils.ts                  # Utility functions
│   │   └── constants.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts              # Zustand auth store
│   │   ├── profileStore.ts           # Profile state
│   │   └── dashboardStore.ts         # NEW: Dashboard state
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── profile.ts
│   │   ├── widget.ts
│   │   ├── connection.ts
│   │   └── organization.ts
│   │
│   └── styles/
│       └── globals.css
│
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```


***

## **7.2 State Management Strategy**

### **Zustand Stores**

**Auth Store (`stores/authStore.ts`):**

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  tokens: { access: string; refresh: string } | null;
  login: (tokens: Tokens, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}
```

**Dashboard Store (NEW) (`stores/dashboardStore.ts`):**

```typescript
interface DashboardState {
  layout: WidgetLayout;
  widgetData: WidgetData;
  isEditMode: boolean;
  updateLayout: (layout: WidgetLayout) => void;
  toggleEditMode: () => void;
  addWidget: (widget: Widget) => void;
  removeWidget: (widgetId: string) => void;
  updateWidgetData: (type: string, data: any) => void;
}
```


***

# **8. Feature Specifications**

## **8.1 NEW FEATURE: User Dashboard**

### **8.1.1 Overview**

The **User Dashboard** is a personal productivity hub separate from the public profile. It serves as a standalone productivity tool that users can access across devices, even without social engagement.

**Key Distinction:**

- **Public Profile** (`/profile/[username]`): Social layer, customizable visibility, others can view
- **Personal Dashboard** (`/dashboard`): Private productivity space, always private, only user can access

***

### **8.1.2 Dashboard Features**

#### **A. Private Widget Canvas**

- All widgets are **private by default**
- User can add unlimited widgets
- No public/private toggle (everything is private)
- Fully customizable grid layout
- Separate layout from public profile


#### **B. Quick Actions Panel**

```
┌─────────────────────────────────────┐
│         QUICK ACTIONS               │
├─────────────────────────────────────┤
│  [+ Add Task]   [+ Add Habit]      │
│  [+ Log Activity]  [View Stats]    │
│  [Set Goal]     [Start Timer]      │
└─────────────────────────────────────┘
```


#### **C. Today's Focus Section**

- Today's scheduled tasks
- Active habits to complete
- Daily goals progress
- Time-sensitive items


#### **D. Analytics \& Insights**

- Weekly/monthly productivity trends
- Habit completion rates
- Task completion velocity
- Streaks \& achievements


#### **E. Cross-Device Sync**

- Real-time sync across devices
- Offline support with sync on reconnect
- Conflict resolution for concurrent edits

***

### **8.1.3 Dashboard Widgets**

**Available Widgets:**

1. **Task Manager** - Full Kanban board
2. **Habit Tracker** - Daily/weekly habit checkboxes
3. **Goal Progress** - Visual goal tracking
4. **Daily Schedule** - Time-blocked calendar
5. **Focus Timer** - Pomodoro timer
6. **Notes** - Quick notes widget
7. **Stats Overview** - Productivity metrics
8. **Streak Tracker** - Habit streaks visualization
9. **Activity Log** - Recent activities
10. **Calendar** - Month view with events

***

### **8.1.4 Dashboard Layout Structure**

```
┌────────────────────────────────────────────────────────────┐
│  MINSOTO                                          [Profile] │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              TODAY'S FOCUS                            │  │
│  │  • Complete English HW (Due 3 PM)                    │  │
│  │  • Gym session ✓                                     │  │
│  │  • Meditation (Not started)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │     TASKS      │  │    HABITS      │  │    STATS    │  │
│  │                │  │                │  │             │  │
│  │  To Do: 8      │  │  Today: 3/5    │  │  Streak: 12 │  │
│  │  Progress: 4   │  │  Week: 21/35   │  │  Tasks: 45  │  │
│  │  Done: 23      │  │  Longest: 28   │  │  Hours: 32  │  │
│  └────────────────┘  └────────────────┘  └─────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          TASK BOARD (Kanban)                         │  │
│  │  ┌─────────┐  ┌───────────┐  ┌──────────┐          │  │
│  │  │  To Do  │  │In Progress│  │ Completed│          │  │
│  │  │         │  │           │  │          │          │  │
│  │  │ Task 1  │  │  Task A   │  │  Task X  │          │  │
│  │  │ Task 2  │  │  Task B   │  │  Task Y  │          │  │
│  │  └─────────┘  └───────────┘  └──────────┘          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌────────────────┐  ┌─────────────────────────────────┐  │
│  │     TIMER      │  │      ACTIVITY LOG               │  │
│  │                │  │  • Completed "Gym" - 2 hrs ago  │  │
│  │   25:00        │  │  • Started "Study" - 3 hrs ago  │  │
│  │   [Start]      │  │  • Completed task - 5 hrs ago   │  │
│  └────────────────┘  └─────────────────────────────────┘  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```


***

### **8.1.5 Dashboard API Endpoints**

```http
GET    /api/dashboard/                 # Get dashboard layout & data
PATCH  /api/dashboard/layout/          # Update dashboard layout
GET    /api/dashboard/focus/           # Get today's focus items
GET    /api/dashboard/stats/           # Get productivity stats
POST   /api/dashboard/sync/            # Sync dashboard data
```


***

### **8.1.6 Dashboard Implementation**

**Backend Model (add to `models.py`):**

```python
class Dashboard(models.Model):
    """Separate dashboard configuration from profile"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='dashboard')
    layout = models.JSONField(default=dict, blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    last_synced = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s Dashboard"
```

**Frontend Component (`app/dashboard/page.tsx`):**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import QuickActions from '@/components/dashboard/QuickActions';
import TodaysFocus from '@/components/dashboard/TodaysFocus';

export default function DashboardPage() {
  const { layout, widgetData, isEditMode } = useDashboardStore();
  
  return (
    <div className="min-h-screen bg-black text-white">
      <nav>{/* Navigation */}</nav>
      
      <div className="p-6">
        {/* Today's Focus */}
        <TodaysFocus />
        
        {/* Quick Actions */}
        <QuickActions />
        
        {/* Dashboard Grid */}
        <DashboardGrid
          layout={layout}
          widgetData={widgetData}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  );
}
```


***

## **8.2 Customizable Profile (Public)**

### **8.2.1 Widget System**

**Widget Types:**

- **Tasks \& Projects** - Kanban view (public subset)
- **Habit Streaks** - Daily schedule view
- **Habit Graph** - GitHub-style contribution graph
- **Interests** - Tag collection
- **Stats** - Numeric achievements
- **Activity** - Engagement graph
- **Schedule** - Time-based tasks
- **Post Highlight** - Featured post
- **Circle Summary** - Group memberships
- **Extensions** - Community plugins

**Widget Properties:**

```typescript
interface Widget {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: { w: number; h: number };
  visibility: 'public' | 'private';
  config: Record<string, unknown>;
}
```


***

## **8.3 Organizations \& Discovery**

### **8.3.1 Organization Auto-Detection**

**Flow:**

1. User signs up with `aniket@iiits.in`
2. Backend extracts domain: `iiits.in`
3. Check if Organization exists for domain
4. If yes: Auto-create OrganizationMembership
5. If no: Create new Organization (pending verification)
6. User sees "IIIT Sri City" badge on profile

**Supported Organization Types:**

- Colleges/Universities
- Companies
- Schools
- Communities
- Other

***

### **8.3.2 Manual Verification Flow**

**Scenario:** User signed up with Gmail, wants to verify college email

**Steps:**

1. User goes to Settings → Organizations
2. Clicks "Verify Organization"
3. Google OAuth popup (forced account picker)
4. User selects organization email
5. Backend verifies token, extracts domain
6. Creates OrganizationMembership
7. User now has organization access

**UI Flow:**

```
Settings → Organizations
    ↓
[+ Add Organization]
    ↓
Modal: "Verify with Google OAuth"
    ↓
Google OAuth (select org email)
    ↓
Success: "Verified with IIIT Sri City"
```


***

### **8.3.3 Organization Directory**

**URL:** `/community/[domain]` (e.g., `/community/iiits.in`)

**Features:**

- List all verified members
- Filter by interests, role, year
- Search members
- See mutual connections
- Send connection requests
- Organization stats

**UI Layout:**

```
┌────────────────────────────────────────────┐
│  IIIT SRI CITY                            │
│  324 Members · 12 Online                   │
├────────────────────────────────────────────┤
│  [All] [Students] [Alumni] [Faculty]      │
│                                            │
│  Search: [_______________] [Filter ▾]     │
│                                            │
│  ┌──────────────┐  ┌──────────────┐      │
│  │  @kenji_a    │  │  @sakura_m   │      │
│  │  Photography │  │  Art, Music  │      │
│  │  [Connect]   │  │  [Connected] │      │
│  └──────────────┘  └──────────────┘      │
│                                            │
│  ┌──────────────┐  ┌──────────────┐      │
│  │  @yuki_t     │  │  @hiro_k     │      │
│  │  Coding      │  │  Gaming      │      │
│  │  [Connect]   │  │  [Connect]   │      │
│  └──────────────┘  └──────────────┘      │
└────────────────────────────────────────────┘
```


***

## **8.4 Connections \& Friends System**

### **8.4.1 Two-Tier System**

**Level 1: Connection**

- Send connection request
- Accept/reject
- Can message
- Can see public profile widgets
- No special privileges

**Level 2: Friend**

- Upgrade from connection
- Mutual agreement required
- Can see private profile widgets
- Priority in feeds
- Special friend-only content

***

### **8.4.2 Connection Flow**

```
User A                    System                   User B
  │                         │                        │
  │  Send Connection        │                        │
  │  Request                │                        │
  ├────────────────────────►│                        │
  │                         │  Create Connection     │
  │                         │  (status: pending)     │
  │                         │                        │
  │                         │  Notification          │
  │                         ├───────────────────────►│
  │                         │                        │
  │                         │  Accept/Reject         │
  │                         │◄───────────────────────┤
  │                         │                        │
  │                         │  Update Connection     │
  │                         │  (status: accepted)    │
  │                         │                        │
  │  Notification           │                        │
  │◄────────────────────────┤                        │
  │                         │                        │
```


***

### **8.4.3 Friend Upgrade Flow**

**Requirements:**

- Must already be connected (status: accepted)
- Either party can initiate upgrade
- Other party must confirm

**UI:**

```
Profile → [Connected ✓] → [Upgrade to Friend]
                              ↓
                    "Send friend request to @username?"
                              ↓
                         [Confirm] [Cancel]
                              ↓
                    Notification to other user
                              ↓
                    Other user accepts
                              ↓
                    Status: Friends 👥
```


***

## **8.5 Circles (Future Phase 4)**

### **8.5.1 Circle Types**

1. **Study Circles** - Academic collaboration
2. **Project Circles** - Team projects
3. **Habit Circles** - Accountability groups
4. **Interest Circles** - Hobby communities

### **8.5.2 Circle Features**

- Create/join circles
- Circle feed \& chat
- Shared goals \& challenges
- Member roles (admin, moderator, member)
- Circle analytics
- Private/public visibility

***

## **8.6 Feed \& Posts (Future Phase 3)**

### **8.6.1 Feed Types**

1. **Global Feed** - Curated content from all users
2. **Interest Feed** - Based on user interests
3. **Organization Feed** - From org members
4. **Friends Feed** - Friends-only content
5. **Circle Feed** - Circle-specific posts

### **8.6.2 Post Types**

- **Text Post** - Simple text content
- **Image Post** - Photo with caption
- **Link Post** - Shared link with preview
- **Achievement Post** - Milestone celebration
- **Question Post** - Asking for advice

***

# **9. User Flows**

## **9.1 Onboarding Flow**

```
1. Landing Page
   ↓
2. Click "Sign in with Google"
   ↓
3. Google OAuth (select account)
   ↓
4. Backend creates user + profile
   ↓
5. Auto-detect organization from email
   ↓
6. Username Setup Page
   ↓
7. Enter desired username
   ↓
8. Initialize dashboard & profile with default widgets
   ↓
9. Redirect to Personal Dashboard
   ↓
10. Show onboarding tour (optional)
```


***

## **9.2 Daily User Flow**

```
1. User opens Minsoto
   ↓
2. Lands on Dashboard (/dashboard)
   ↓
3. Reviews "Today's Focus"
   ↓
4. Checks off completed habits
   ↓
5. Updates task status
   ↓
6. Checks notifications
   ↓
7. Optional: Browse organization directory
   ↓
8. Optional: Check feed for updates
   ↓
9. Optional: Customize profile
   ↓
10. Log out or close app
```


***

## **9.3 Connection Flow**

```
1. User discovers someone in org directory
   ↓
2. Views their public profile
   ↓
3. Clicks "Connect"
   ↓
4. Optional: Add message
   ↓
5. Sends connection request
   ↓
6. Other user receives notification
   ↓
7. Other user views profile & decides
   ↓
8. Accept: Now connected ✓
   Reject: Request dismissed
   ↓
9. (Later) Upgrade to friend (mutual)
   ↓
10. Now friends 👥 (can see private widgets)
```


***

## **9.4 Organization Verification Flow**

```
1. User with personal email (Gmail)
   ↓
2. Goes to Settings → Organizations
   ↓
3. Clicks "Add Organization"
   ↓
4. Clicks "Verify with College Email"
   ↓
5. Google OAuth popup (forced account selection)
   ↓
6. User selects college email (@iiits.in)
   ↓
7. Backend verifies token
   ↓
8. Extracts domain & creates membership
   ↓
9. Success: "Verified with IIIT Sri City ✓"
   ↓
10. User now has org badge & directory access
```


***

# **10. Design System**

## **10.1 Color Palette**

### **Base Colors**

```css
--black: #000000;
--white: #FFFFFF;
--gray-50: rgba(255, 255, 255, 0.05);
--gray-100: rgba(255, 255, 255, 0.10);
--gray-200: rgba(255, 255, 255, 0.20);
--gray-300: rgba(255, 255, 255, 0.30);
--gray-400: rgba(255, 255, 255, 0.40);
--gray-500: rgba(255, 255, 255, 0.50);
--gray-600: rgba(255, 255, 255, 0.60);
--gray-700: rgba(255, 255, 255, 0.70);
--gray-800: rgba(255, 255, 255, 0.80);
--gray-900: rgba(255, 255, 255, 0.90);
```


### **Accent Colors**

```css
--green: #10B981;   /* Success, verified */
--red: #EF4444;     /* Error, delete */
--blue: #3B82F6;    /* Info, links */
--yellow: #F59E0B;  /* Warning */
```


### **Theme Variations**

```css
/* Dark Theme (Default) */
--bg-primary: #000000;
--text-primary: #FFFFFF;
--border: rgba(255, 255, 255, 0.20);

/* Light Theme */
--bg-primary: #FFFFFF;
--text-primary: #000000;
--border: rgba(0, 0, 0, 0.20);
```


***

## **10.2 Typography**

### **Font Stack**

```css
--font-sans: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', 'Courier New', monospace;
```


### **Type Scale**

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```


### **Font Weights**

```css
--font-thin: 100;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```


***

## **10.3 Spacing System**

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```


***

## **10.4 Component Patterns**

### **Border Box Pattern**

```jsx
<div className="relative border border-white p-8">
  {/* Decorative corners */}
  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white" />
  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white" />
  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white" />
  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white" />
  
  {/* Content */}
</div>
```


### **Kanji Decoration**

```jsx
<div className="flex items-center gap-4">
  <div className="h-px bg-white w-12 opacity-20" />
  <span className="text-xs opacity-30">静</span>
  <div className="h-px bg-white w-12 opacity-20" />
</div>
```


### **Button Styles**

```jsx
{/* Primary */}
<button className="px-8 py-3 border border-white hover:bg-white hover:text-black transition-colors">
  BUTTON TEXT
</button>

{/* Secondary */}
<button className="px-6 py-3 border border-gray-600 text-gray-400 hover:border-white hover:text-white transition-colors">
  BUTTON TEXT
</button>
```


***

## **10.5 Animation Principles**

**Timing:**

- Duration: 200-400ms for most transitions
- Easing: `ease-out` for entrances, `ease-in` for exits
- Use `cubic-bezier(0.4, 0, 0.2, 1)` for natural motion

**What to Animate:**

- ✅ Opacity changes
- ✅ Border colors
- ✅ Scale (subtle: 0.95-1.05)
- ✅ Position (small movements)
- ❌ Avoid rotating elements
- ❌ No bouncy animations

***

# **11. Security \& Privacy**

## **11.1 Authentication Security**

### **JWT Token Management**

- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- HttpOnly cookies for refresh tokens (future)
- Token rotation on refresh
- Automatic logout on token expiry


### **Google OAuth Security**

- Server-side token verification
- Token cannot be faked
- Email verification via Google
- Separate verification for organization emails

***

## **11.2 Data Privacy**

### **Widget Visibility System**

- Default: Public
- User explicitly marks widgets as private
- Private widgets only visible to owner
- Friends can see private widgets (future feature)


### **Profile Privacy Controls**

- Hide from organization directory
- Hide organization badge
- Control who can send connection requests
- Block users


### **Data Ownership**

- Users own all their data
- Export data option (future)
- Delete account permanently
- GDPR compliance

***

## **11.3 Security Best Practices**

### **Backend Security**

```python
# CSRF Protection
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True

# CORS
CORS_ALLOWED_ORIGINS = [...]
CORS_ALLOW_CREDENTIALS = True

# Database
# - Parameterized queries (Django ORM)
# - No raw SQL except with parameters
# - Atomic transactions for critical operations

# Rate Limiting (future)
# - 100 requests/minute per user
# - 10 requests/minute for auth endpoints
```


### **Frontend Security**

- XSS Prevention: React auto-escapes
- No `dangerouslySetInnerHTML` without sanitization
- HTTPS only in production
- No sensitive data in localStorage (except tokens)

***

# **12. Development Roadmap**

## **12.1 Phase Breakdown**

### **Phase 0: Foundation** ✅ (Complete)

- Google OAuth authentication
- User model \& profile
- Profile customization
- Widget system
- Basic API structure

**Duration:** 2 weeks
**Status:** ✅ Complete

***

### **Phase 1: Authentication \& Profiles** ✅ (Complete)

- Username setup
- Profile picture upload
- Bio \& interests
- Theme customization
- Email system

**Duration:** 1 week
**Status:** ✅ Complete

***

### **Phase 2A: Organizations \& Connections** 🚧 (In Progress)

- Organization models
- Auto-detection from email
- Manual verification flow
- Organization directory
- Connection system (basic)

**Duration:** 2 weeks
**Status:** 🚧 80% Complete

***

### **Phase 2B: User Dashboard** 📋 (Next)

- Dashboard models
- Dashboard layout system
- Quick actions
- Today's focus
- Analytics widgets
- Cross-device sync

**Duration:** 2 weeks
**Status:** 📋 Planned

***

### **Phase 2C: Friendship System** 📋

- Friend upgrade logic
- Friend-only widget visibility
- Friends list page
- Mutual friend discovery

**Duration:** 1 week
**Status:** 📋 Planned

***

### **Phase 3: Feed \& Posts** 📋

- Post model
- Create post UI
- Feed algorithms
- Comments \& reactions
- Image upload
- Post visibility controls

**Duration:** 3 weeks
**Status:** 📋 Planned

***

### **Phase 4: Circles** 📋

- Circle models
- Create/join circles
- Circle feed
- Circle chat
- Shared goals
- Admin controls

**Duration:** 3 weeks
**Status:** 📋 Planned

***

### **Phase 5: Messaging** 📋

- Direct messages
- Group chats
- Real-time with WebSockets
- Rich media support
- Read receipts

**Duration:** 3 weeks
**Status:** 📋 Planned

***

### **Phase 6: Extensions \& API** 📋

- Public API
- Developer documentation
- Plugin system
- Marketplace
- OAuth for third-party apps

**Duration:** 4 weeks
**Status:** 📋 Planned

***

## **12.2 Timeline Overview**

```
Phase 0-1:  Week 1-3    ✅ Complete
Phase 2A:   Week 4-5    🚧 In Progress
Phase 2B:   Week 6-7    📋 Next
Phase 2C:   Week 8      📋 Planned
Phase 3:    Week 9-11   📋 Planned
Phase 4:    Week 12-14  📋 Planned
Phase 5:    Week 15-17  📋 Planned
Phase 6:    Week 18-21  📋 Planned

Total: ~5 months for full v1.0
```


***

# **13. Deployment \& Infrastructure**

## **13.1 Current Infrastructure**

### **Frontend (Vercel)**

```yaml
Service: Vercel
Framework: Next.js 15
Build Command: npm run build
Output Directory: .next
Environment Variables:
  - NEXT_PUBLIC_API_URL
  - NEXT_PUBLIC_GOOGLE_CLIENT_ID
Domain: minsoto.app
SSL: Automatic (Let's Encrypt)
CDN: Vercel Edge Network
```


### **Backend (Render)**

```yaml
Service: Render Web Service
Framework: Django 4.2
Build Command: ./build.sh
Start Command: gunicorn minsoto_backend.wsgi:application
Environment Variables:
  - SECRET_KEY
  - DEBUG
  - DATABASE_URL
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - FRONTEND_URL
Domain: api.minsoto.app (via custom domain)
SSL: Automatic
```


### **Database (Neon PostgreSQL)**

```yaml
Service: Neon Serverless PostgreSQL
Version: PostgreSQL 15
Region: US East
Tier: Free (5 GB storage)
Upgrade Path: Scale tier when needed
Backup: Automatic daily backups
```


***

## **13.2 Scaling Strategy**

### **Current Capacity**

- Frontend: Unlimited (Vercel serverless)
- Backend: 1 instance (Render free tier)
- Database: 5 GB (Neon free tier)

**Estimated Capacity:**

- ~1,000 concurrent users
- ~10,000 registered users
- ~100,000 API requests/day


### **Phase 1 Scaling (10K users)**

```yaml
Backend:
  - Upgrade to Render Standard ($7/month)
  - 512 MB RAM → 2 GB RAM
  - Auto-scaling: 1-3 instances

Database:
  - Upgrade to Neon Scale ($20/month)
  - 5 GB → 50 GB storage
  - Connection pooling enabled

Caching:
  - Add Redis (Render Redis $10/month)
  - Cache user profiles
  - Cache feed data
  - Session storage
```


### **Phase 2 Scaling (100K users)**

```yaml
Backend:
  - Multiple instances with load balancer
  - Celery for background tasks
  - Separate API and worker services

Database:
  - Neon Pro tier
  - Read replicas for scaling reads
  - Query optimization

CDN:
  - Cloudflare for static assets
  - Image CDN (Cloudinary)
  - Video CDN (future)

Monitoring:
  - Sentry for error tracking
  - PostHog for analytics
  - Datadog for performance
```


***

## **13.3 CI/CD Pipeline**

### **Current Setup**

```yaml
Frontend:
  - Push to GitHub main branch
  - Vercel auto-deploys
  - Preview deployments for PRs

Backend:
  - Push to GitHub main branch
  - Render auto-deploys
  - Manual deploy option
```


### **Future Enhanced Pipeline**

```yaml
GitHub Actions:
  - Run tests on PR
  - Lint code
  - Type checking
  - Build preview

Staging Environment:
  - Separate Render service
  - Test before production

Production:
  - Manual approval required
  - Blue-green deployment
  - Automatic rollback on error
```


***

## **13.4 Monitoring \& Logging**

### **Current Logging**

```python
# Django logs
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}
```


### **Future Monitoring**

- **Sentry**: Error tracking \& performance
- **PostHog**: User analytics \& feature flags
- **Datadog**: Infrastructure monitoring
- **LogRocket**: Frontend session replay

***

# **14. Testing Strategy**

## **14.1 Backend Testing**

### **Unit Tests**

```python
# Example: Test connection request
def test_send_connection_request(self):
    user1 = User.objects.create_user(...)
    user2 = User.objects.create_user(...)
    
    connection = Connection.objects.create(
        from_user=user1,
        to_user=user2,
        status='pending'
    )
    
    assert connection.status == 'pending'
    assert Connection.objects.filter(from_user=user1).count() == 1
```


### **Integration Tests**

```python
# Example: Test API endpoint
def test_accept_connection_api(self):
    # Create connection request
    # Call accept endpoint
    # Assert status changed
    # Assert notification created
```


### **Test Coverage Target**

- Critical paths: 100%
- Overall: 80%+
- Models: 100%
- Views: 90%+
- Utilities: 80%+

***

## **14.2 Frontend Testing**

### **Component Tests**

```typescript
// Example: Widget component test
describe('TasksWidget', () => {
  it('renders tasks correctly', () => {
    render(<TasksWidget tasks={mockTasks} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });
  
  it('handles widget deletion', async () => {
    const onDelete = jest.fn();
    render(<TasksWidget onDelete={onDelete} />);
    
    await userEvent.click(screen.getByTitle('Delete Widget'));
    expect(onDelete).toHaveBeenCalled();
  });
});
```


### **E2E Tests (Playwright/Cypress)**

```typescript
// Example: User flow test
test('user can send connection request', async ({ page }) => {
  await page.goto('/discover');
  await page.click('button:has-text("Connect")');
  await page.fill('textarea[name="message"]', 'Hello!');
  await page.click('button:has-text("Send Request")');
  
  await expect(page.locator('.toast')).toContainText('Request sent');
});
```


***

## **14.3 Testing Tools**

```json
{
  "backend": [
    "pytest",
    "pytest-django",
    "factory_boy",
    "coverage"
  ],
  "frontend": [
    "@testing-library/react",
    "@testing-library/jest-dom",
    "jest",
    "playwright",
    "cypress"
  ]
}
```


***

# **15. Performance Requirements**

## **15.1 Target Metrics**

### **Frontend Performance**

```yaml
First Contentful Paint (FCP): < 1.5s
Largest Contentful Paint (LCP): < 2.5s
Time to Interactive (TTI): < 3.5s
Cumulative Layout Shift (CLS): < 0.1
First Input Delay (FID): < 100ms
```


### **Backend Performance**

```yaml
API Response Time:
  - p50: < 200ms
  - p95: < 500ms
  - p99: < 1000ms

Database Queries:
  - Average: < 50ms
  - Max: < 200ms

Concurrent Users: 1000+ (current infrastructure)
```


***

## **15.2 Optimization Strategies**

### **Frontend Optimizations**

```typescript
// Code splitting
const ProfilePage = dynamic(() => import('./profile/[username]/page'), {
  loading: () => <LoadingSpinner />,
});

// Image optimization
import Image from 'next/image';
<Image src={url} width={200} height={200} alt="..." priority />

// API call optimization
const { data } = useSWR('/api/profile/me', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000, // 1 minute
});
```


### **Backend Optimizations**

```python
# Query optimization
users = User.objects.select_related('profile').prefetch_related('interests')

# Database indexing
class Meta:
    indexes = [
        models.Index(fields=['user_id', 'status']),
    ]

# Caching (future)
from django.core.cache import cache
profile = cache.get(f'profile:{user_id}')
if not profile:
    profile = Profile.objects.get(user_id=user_id)
    cache.set(f'profile:{user_id}', profile, 3600)
```


***

# **16. API Rate Limiting (Future)**

## **16.1 Rate Limit Strategy**

```yaml
Authenticated Users:
  - General: 1000 requests/hour
  - Write operations: 100 requests/hour
  - Auth endpoints: 10 requests/hour

Unauthenticated:
  - Auth endpoints only: 20 requests/hour
  - All other endpoints: Blocked

Organization Directory:
  - 50 requests/minute per user

Connection Requests:
  - 20 requests/day per user
```


***

# **Appendix A: Glossary**

| **Term** | **Definition** |
| :-- | :-- |
| **Connection** | Basic relationship between users |
| **Friend** | Upgraded connection with extended privileges |
| **Organization** | Company, college, or community group |
| **Widget** | Modular UI component on profile/dashboard |
| **Circle** | Group/community for collaboration |
| **Dashboard** | Private productivity hub for user |
| **Profile** | Public-facing customizable user page |
| **Kanji** | Japanese characters used in design |
| **Zen Design** | Minimalist aesthetic philosophy |


***

# **Appendix B: Development Commands**

## **Backend Commands**

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Run tests
pytest

# Seed sample data
python manage.py create_sample_data username
```


## **Frontend Commands**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm test
```


***

# **Appendix C: Environment Variables**

## **Backend (.env)**

```bash
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
FRONTEND_URL=https://minsoto.app
ALLOWED_HOSTS=api.minsoto.app,.onrender.com
CORS_ALLOWED_ORIGINS=https://minsoto.app,https://www.minsoto.app
```


## **Frontend (.env.local)**

```bash
NEXT_PUBLIC_API_URL=https://api.minsoto.app/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```


***

# **Document Revision History**

| **Version** | **Date** | **Changes** | **Author** |
| :-- | :-- | :-- | :-- |
| 1.0 | Dec 13, 2024 | Initial comprehensive documentation | Minsoto Team |


***

# **Contact \& Support**

**Project Repository:** github.com/Minsoto/Minsoto
**Technical Docs:** docs.minsoto.app
**Developer Discord:** discord.gg/minsoto
**Email:** dev@minsoto.app

***

**END OF DOCUMENTATION**

This documentation is a living document and will be updated as the project evolves. All senior developers should refer to this as the single source of truth for Minsoto's technical architecture and product vision.

