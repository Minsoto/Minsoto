# Guild System - Complete Plan

## Overview

Guilds are collaborative groups for shared interests, organizations, or project teams. They feature democratic governance, gamified productivity, and social engagement.

---

## Guild Types & Templates

| Type | Purpose | Auto-Enrollment |
|------|---------|-----------------|
| **Interest** 🎯 | Hobbies, topics, communities | Open join |
| **Organization** 🏛️ | College/company guilds | Via email domain |
| **Project** 🚀 | Goal-oriented teams | Approval required |
| **Custom** ⚡ | Fully customizable | User-defined |

---

## Core Features (Implemented ✅)

### 1. Guild Profile Page
- Widget-based layout (like user profiles)
- Public view for non-members
- Member-only content areas

### 2. Roles & Permissions
| Role | Permissions |
|------|-------------|
| **Owner** | Full control, delete guild, transfer ownership |
| **Admin** | Edit settings, approve changes, manage members |
| **Member** | Vote in polls, suggest changes, contribute XP |

### 3. Democratic Polls
- Admin elections (50%+ required)
- Task/habit approval
- Setting changes
- Custom polls with configurable quorum

### 4. Change Suggestion System
- Members suggest → Admins review
- Preview proposed changes before approval

### 5. Organization Auto-Enrollment
- Detects email domain (e.g., `@iiits.in`)
- Creates organization if not exists
- Auto-adds user as verified member

---

## Gamification Features (New)

### Guild XP System

```
Guild Total XP = Σ (Member Contributions)
```

**XP Sources:**
| Action | XP Earned |
|--------|-----------|
| Member completes personal task | +5 XP to guild |
| Member completes habit | +3 XP to guild |
| Guild task completed | +20 XP |
| Guild habit streak (7 days) | +50 XP |
| Poll participation | +2 XP |
| New member joins | +10 XP |

### Guild Levels

| Level | XP Required | Perks |
|-------|-------------|-------|
| 1 | 0 | Basic features |
| 2 | 500 | Custom banner |
| 3 | 1,500 | Guild events |
| 4 | 3,000 | Increased member cap |
| 5 | 6,000 | Verified badge eligible |
| 10+ | 20,000+ | Leaderboard featured |

### Guild Tasks & Habits

**Shared Tasks:**
- Created via poll approval
- Assigned to multiple members
- Completion requires all assignees OR majority vote
- Higher XP rewards (20-50 XP)

**Guild Habits:**
- Daily/weekly collective habits
- Track participation rate
- Streak bonuses for consistent group participation
- Example: "Team standup" - track who participated daily

### Guild Challenges

Time-limited group challenges:
- "Complete 100 tasks this week"
- "Everyone logs a habit 5 days straight"
- Rewards: Bonus XP, badges, bragging rights

### Guild Leaderboards

**Internal Leaderboard:**
- Top contributors by XP
- Most tasks completed
- Longest habit streaks

**Global Leaderboard:**
- Guilds ranked by total XP
- Monthly/weekly rankings
- Category-specific (Interest guilds, Project guilds, etc.)

### Guild Achievements

| Achievement | Criteria | Reward |
|-------------|----------|--------|
| First Steps | Guild created | Badge |
| Growing Community | 10 members | +100 XP |
| Democratic | 10 polls completed | Badge |
| Productive Week | 50 tasks in 7 days | +200 XP |
| Habit Masters | 90% habit completion rate | Badge |
| Top 10 | Global leaderboard | Special badge |

### Guild Points & Rewards

**Guild Treasury:**
- Collective points pool
- Members contribute via tasks/habits
- Admins can create guild-specific rewards

**Redemption Ideas:**
- Custom roles/titles
- Priority in guild activities
- Real-world rewards (admin-managed)

---

## Collaborative Productivity Features

### 1. Guild Goals
- Shared long-term objectives
- Progress contributed by all members
- Milestone celebrations

### 2. Focus Sessions
- Synchronized co-working sessions
- "Study with me" for guilds
- Leaderboard for session participation

### 3. Accountability Partners
- Pair members for mutual accountability
- Check-in reminders
- Streak tracking between partners

### 4. Guild Calendar
- Shared deadlines
- Event scheduling
- Task due date visualization

### 5. Progress Dashboard
- Real-time guild productivity stats
- Member contribution breakdown
- Weekly/monthly reports

---

## Technical Implementation

### New Models Required

```python
class GuildTask(models.Model):
    guild = FK(Guild)
    title = CharField
    assigned_to = M2M(User)  # Multiple assignees
    point_value = IntField
    is_completed = BoolField
    completion_type = CharField  # 'all' or 'majority'

class GuildHabit(models.Model):
    guild = FK(Guild)
    name = CharField
    frequency = CharField
    point_value = IntField
    
class GuildHabitLog(models.Model):
    habit = FK(GuildHabit)
    user = FK(User)
    completed_at = DateTime

class GuildChallenge(models.Model):
    guild = FK(Guild)
    title = CharField
    target_type = CharField  # 'tasks', 'habits', 'xp'
    target_value = IntField
    current_value = IntField
    deadline = DateTime

class GuildAchievement(models.Model):
    guild = FK(Guild)
    achievement = FK(Achievement)
    unlocked_at = DateTime
```

### New API Endpoints

```
POST /guilds/{slug}/tasks/          # Create guild task
POST /guilds/{slug}/habits/         # Create guild habit
POST /guilds/{slug}/challenges/     # Create challenge
GET  /guilds/{slug}/leaderboard/    # Guild leaderboard
GET  /guilds/leaderboard/           # Global leaderboard
GET  /guilds/{slug}/stats/          # Guild productivity stats
```

---

## UI Components Needed

1. **Guild Dashboard Widget** - Stats overview
2. **Guild Tasks Widget** - Shared task list
3. **Guild Habits Widget** - Collective habits
4. **Guild Leaderboard Widget** - Top contributors
5. **Guild Challenges Widget** - Active challenges
6. **Guild Progress Widget** - XP/Level visualization

---

## Implementation Priority

### Phase 1: Core Gamification
- [ ] Guild XP accumulation from member activity
- [ ] Guild levels with perks
- [ ] Internal leaderboard

### Phase 2: Collaborative Tasks
- [ ] Guild tasks with multi-assignment
- [ ] Guild habits with participation tracking
- [ ] Guild challenges

### Phase 3: Advanced Features
- [ ] Focus sessions
- [ ] Accountability partners
- [ ] Guild calendar
- [ ] Global leaderboard

---

## Success Metrics

1. **Engagement**: Daily active guild participation
2. **Productivity**: Tasks/habits completed via guilds
3. **Retention**: Member retention rate
4. **Growth**: New guild creations, member joins
5. **Collaboration**: Poll participation, shared task completion
