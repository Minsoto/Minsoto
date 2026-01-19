<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# **MINSOTO: Achievements, XP \& Guild System - Detailed Ideation Document**

**Version:** 1.0
**Last Updated:** December 13, 2024
**Document Type:** Feature Ideation \& Design
**Feature Status:** Conceptual Phase

***

# **Table of Contents**

1. [Vision \& Philosophy](#1-vision--philosophy)
2. [Core Mechanics Overview](#2-core-mechanics-overview)
3. [Experience Points (XP) System](#3-experience-points-xp-system)
4. [Achievement System](#4-achievement-system)
5. [Title \& Rank System](#5-title--rank-system)
6. [Guild Integration with Circles](#6-guild-integration-with-circles)
7. [Competitive \& Collaborative Mechanics](#7-competitive--collaborative-mechanics)
8. [Progression Pathways](#8-progression-pathways)
9. [UI/UX Design Considerations](#9-uiux-design-considerations)
10. [Balance \& Economy](#10-balance--economy)
11. [Social Dynamics](#11-social-dynamics)
12. [Anti-Gaming Measures](#12-anti-gaming-measures)
13. [Future Extensions](#13-future-extensions)

***

# **1. Vision \& Philosophy**

## **1.1 Core Concept**

Transform Minsoto from a **passive social productivity platform** into an **active growth game** where users earn XP, unlock achievements, gain titles, and collaborate in guilds—all while maintaining the platform's mindful, anti-addiction philosophy.

**Key Philosophy:**
> *"Gamify growth, not addiction. Reward progress, not just presence."*

***

## **1.2 Design Principles**

### **Principle 1: Meaningful Progress Over Vanity Metrics**

- XP rewards actual productivity (tasks completed, habits maintained)
- NOT rewarded: Time spent scrolling, passive engagement
- Every XP point represents real-world accomplishment


### **Principle 2: Collaboration Over Competition**

- Guild achievements matter more than individual rankings
- Shared goals create accountability
- Competition is friendly and opt-in


### **Principle 3: Transparency \& Fairness**

- Clear XP sources
- No pay-to-win mechanics
- Equal opportunity for all users
- Visible progression system


### **Principle 4: Zen Aesthetics**

- Subtle, non-intrusive notifications
- Beautiful but minimalist progress indicators
- No flashy animations or overwhelming effects
- Clean numerical displays (e.g., "2,840 XP" not "Level 42 Ninja Master!!!")

***

## **1.3 Why This Matters for Minsoto**

**Current State:**

- Users complete tasks/habits → No recognition
- Circles exist → No collective goals
- Profile customization → No progression incentive

**With XP/Achievements:**

- Clear progression system → User retention
- Guild competitions → Active circles
- Titles → Status \& identity
- Achievements → Goals \& milestones
- Social proof → Network effects

***

# **2. Core Mechanics Overview**

## **2.1 The Three Pillars**

```
┌─────────────────────────────────────────────────────────┐
│                    PROGRESSION SYSTEM                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│  │   XP SYSTEM  │───►│ ACHIEVEMENTS │───►│  TITLES  │ │
│  │              │    │              │    │          │ │
│  │ • Earn XP    │    │ • Complete   │    │ • Unlock │ │
│  │ • Level up   │    │   challenges │    │   ranks  │ │
│  │ • Track      │    │ • Show off   │    │ • Display│ │
│  └──────┬───────┘    └──────┬───────┘    └────┬─────┘ │
│         │                   │                  │       │
│         └───────────────────┴──────────────────┘       │
│                            │                           │
│                            ▼                           │
│                   ┌─────────────────┐                  │
│                   │  GUILD SYSTEM   │                  │
│                   │                 │                  │
│                   │ • Pool XP       │                  │
│                   │ • Team goals    │                  │
│                   │ • Competitions  │                  │
│                   └─────────────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```


***

## **2.2 High-Level Flow**

```
User completes task
        ↓
    +50 XP earned
        ↓
XP added to personal total & guild pool
        ↓
Check for achievement unlocks
        ↓
Check for level-up / title unlock
        ↓
Update user profile & guild stats
        ↓
Notify user (subtle, Zen-style)
```


***

# **3. Experience Points (XP) System**

## **3.1 XP Sources**

### **Primary XP Sources (Productivity)**

| **Action** | **XP Reward** | **Frequency** | **Notes** |
| :-- | :-- | :-- | :-- |
| **Complete Task** | 10-50 XP | Per task | Based on priority |
| **Maintain Habit Streak** | 5 XP/day | Daily | Bonus at milestones |
| **Complete Daily Goals** | 100 XP | Daily | All daily tasks done |
| **Complete Weekly Goals** | 500 XP | Weekly | Consistency bonus |
| **Log 7-day Habit Streak** | 50 XP | Per streak | Momentum reward |
| **Log 30-day Habit Streak** | 250 XP | Per milestone | Major milestone |
| **Complete Project** | 200-1000 XP | Per project | Based on scope |
| **Achieve Personal Best** | 100 XP | Per PB | New record |

### **Secondary XP Sources (Social \& Community)**

| **Action** | **XP Reward** | **Frequency** | **Notes** |
| :-- | :-- | :-- | :-- |
| **Create Meaningful Post** | 20 XP | Per post | Quality > quantity |
| **Help Someone (verified)** | 50 XP | Per help | Peer-verified |
| **Complete Circle Goal** | 100 XP | Per goal | Team achievement |
| **Organize Study Session** | 75 XP | Per session | Leadership |
| **Contribute to Circle** | 25 XP | Per contribution | Active participation |
| **Mentor New User** | 200 XP | One-time | Onboarding help |
| **Create Tutorial/Guide** | 150 XP | Per guide | Community content |

### **Tertiary XP Sources (Platform Engagement)**

| **Action** | **XP Reward** | **Frequency** | **Notes** |
| :-- | :-- | :-- | :-- |
| **Complete Profile** | 100 XP | One-time | Initial setup |
| **Add 5 Interests** | 50 XP | One-time | Profile richness |
| **Verify Organization** | 100 XP | Per org | Community building |
| **Make 10 Connections** | 100 XP | Milestone | Network growth |
| **Join First Circle** | 50 XP | One-time | Community entry |
| **Enable 2FA** | 50 XP | One-time | Security bonus |


***

## **3.2 XP Scaling \& Leveling**

### **Level Progression Curve**

**Formula:** XP required for level N = `100 × N × (N + 1) / 2`

```
Level 1:    0 XP     (Starting point)
Level 2:    100 XP   (Easy early progress)
Level 3:    300 XP   
Level 4:    600 XP   
Level 5:    1,000 XP (First major milestone)
Level 10:   5,000 XP
Level 15:   11,000 XP
Level 20:   20,000 XP (Serious dedication)
Level 30:   45,000 XP
Level 50:   125,000 XP (Elite status)
Level 100:  500,000 XP (Legendary - possible but rare)
```

**Progression Feel:**

- Levels 1-5: Fast (1-2 weeks casual use)
- Levels 5-15: Moderate (1-2 months regular use)
- Levels 15-30: Slow (3-6 months dedicated use)
- Levels 30+: Very slow (long-term commitment)

***

## **3.3 XP Decay \& Maintenance**

**Philosophy:** No harsh decay, but incentivize consistency

### **Streak Bonuses**

```
7-day active streak:  +5% XP multiplier
14-day streak:        +10% XP multiplier
30-day streak:        +15% XP multiplier
90-day streak:        +20% XP multiplier (max)
```


### **Inactivity (No Decay)**

- No XP loss for being inactive
- Multiplier resets after 7 days of inactivity
- Gentle reminder notification (not punishing)

**Rationale:** Minsoto is anti-addiction. We don't punish users for taking breaks.

***

## **3.4 XP Display \& Visualization**

### **Profile Display**

```
┌──────────────────────────────────────┐
│  @kenji_a                            │
│  Level 23 · 22,840 / 27,600 XP      │
│  ████████████░░░░ 83%                │
│  Title: Zen Master 禅                │
└──────────────────────────────────────┘
```


### **Dashboard Widget**

```
┌──────────────────────────────────────┐
│  TODAY'S PROGRESS                    │
│  +385 XP earned                      │
│                                      │
│  ▪ Completed 5 tasks (+150 XP)      │
│  ▪ 7-day habit streak (+50 XP)      │
│  ▪ Helped @yuki_t (+50 XP)          │
│  ▪ Daily goal complete (+100 XP)    │
│                                      │
│  Streak: 14 days · +10% multiplier  │
└──────────────────────────────────────┘
```


***

# **4. Achievement System**

## **4.1 Achievement Categories**

### **1. Productivity Achievements**

**Task Mastery:**

- **Task Novice** - Complete 10 tasks (50 XP)
- **Task Warrior** - Complete 100 tasks (200 XP)
- **Task Legend** - Complete 1,000 tasks (1,000 XP)
- **Zero Inbox** - Have 0 pending tasks (100 XP)
- **Speed Demon** - Complete 20 tasks in one day (250 XP)
- **Night Owl** - Complete task after 11 PM (25 XP)
- **Early Bird** - Complete task before 6 AM (25 XP)

**Habit Consistency:**

- **First Steps** - Log first habit (10 XP)
- **Week Warrior** - Maintain 7-day streak (100 XP)
- **Month Master** - Maintain 30-day streak (500 XP)
- **Century Club** - Maintain 100-day streak (2,000 XP)
- **Unbreakable** - Maintain 365-day streak (10,000 XP) ⭐
- **Multi-Tasker** - Maintain 5 habits simultaneously for 7 days (300 XP)
- **Perfect Week** - Complete all habits for 7 days straight (500 XP)

**Goal Achievement:**

- **Goal Setter** - Set your first goal (25 XP)
- **Goal Crusher** - Complete 10 goals (250 XP)
- **Visionary** - Complete a 90-day goal (1,000 XP)
- **Dream Achiever** - Complete a 1-year goal (5,000 XP) ⭐

***

### **2. Social Achievements**

**Connection Building:**

- **First Contact** - Make your first connection (25 XP)
- **Social Butterfly** - Connect with 25 people (150 XP)
- **Network Builder** - Connect with 100 people (500 XP)
- **Community Leader** - Have 10+ mutual connections (300 XP)
- **Organization Ambassador** - Connect with 50 people from your org (400 XP)

**Friendship:**

- **Best Friend** - Upgrade first connection to friend (50 XP)
- **Circle of Trust** - Have 10 friends (250 XP)
- **Friendship Goals** - Complete 10 goals with friends (500 XP)

**Helping Others:**

- **Good Samaritan** - Help 5 people (100 XP)
- **Mentor** - Guide 3 new users through onboarding (300 XP)
- **Teacher** - Create 5 helpful tutorials (500 XP)
- **Guru** - Get 100+ upvotes on helpful content (1,000 XP) ⭐

***

### **3. Circle/Guild Achievements**

**Circle Participation:**

- **Circle Initiate** - Join your first circle (50 XP)
- **Active Member** - Participate in circle 30 days (200 XP)
- **Core Member** - Be in top 10% active members (500 XP)
- **Circle Founder** - Create a circle with 10+ members (300 XP)
- **Circle Leader** - Lead a circle to complete 10 goals (1,000 XP)

**Team Achievements:**

- **Team Player** - Contribute to 10 circle goals (250 XP)
- **Carry** - Be MVP in circle for a month (500 XP)
- **Synergy** - Complete goal with all circle members (300 XP)
- **Guild War Champion** - Win circle competition (1,000 XP) ⭐

***

### **4. Mastery Achievements**

**Specialization:**

- **Productivity Master** - Earn 10,000 XP from tasks (Title: "Taskmaster")
- **Habit Sage** - Earn 10,000 XP from habits (Title: "Habit Guru")
- **Social Butterfly** - Earn 10,000 XP from social actions (Title: "Connector")
- **Circle Champion** - Earn 10,000 XP from circles (Title: "Guild Master")

**Rare Achievements:**

- **Early Adopter** ⭐ - Join in first 1,000 users (1,000 XP)
- **Perfectionist** ⭐ - Complete 100 tasks with 0 missed deadlines (2,000 XP)
- **Ironman** ⭐ - Log habits manually for 365 days (5,000 XP)
- **Zen Master** ⭐ - Reach Level 50 (10,000 XP)
- **Legendary** ⭐ - Reach Level 100 (50,000 XP)

***

## **4.2 Achievement Design**

### **Achievement Structure**

```javascript
{
  id: "task_legend",
  name: "Task Legend",
  description: "Complete 1,000 tasks",
  category: "productivity",
  rarity: "rare",
  xp_reward: 1000,
  requirements: {
    type: "count",
    metric: "tasks_completed",
    target: 1000
  },
  icon: "⚔️",
  unlocks: {
    title: "Legend",
    badge: true
  }
}
```


### **Achievement Tiers**

```
Common:    Bronze border, 10-50 XP
Uncommon:  Silver border, 50-200 XP
Rare:      Gold border, 200-1000 XP
Epic:      Platinum border, 1000-5000 XP
Legendary: Diamond border ⭐, 5000+ XP
```


### **Achievement Display**

```
┌─────────────────────────────────────────┐
│         ACHIEVEMENT UNLOCKED!           │
├─────────────────────────────────────────┤
│                                         │
│              ⚔️                          │
│         TASK LEGEND                     │
│                                         │
│  "Complete 1,000 tasks"                 │
│                                         │
│  +1,000 XP                              │
│  Title unlocked: "Legend"               │
│                                         │
│  Progress: █████████░ 90% to next tier  │
└─────────────────────────────────────────┘
```


***

## **4.3 Hidden Achievements**

**Secret Achievements** (not shown until unlocked):

- **Night Shifter** - Complete 100 tasks between 12 AM - 5 AM
- **Minimalist** - Maintain profile with only 3 widgets for 30 days
- **Zen Mode** - Go 7 days without checking feed (only dashboard)
- **Perfect Month** - Complete all daily goals for 30 days straight
- **Social Recluse** - Reach Level 20 with <5 connections (solo mastery)
- **Popular** - Get 100 connection requests in one month
- **Ghost** - Don't post for 90 days but complete all tasks

**Easter Eggs:**

- **Konami Code** - Enter secret sequence on profile (fun reward)
- **Birthday Bonus** - Log in on your birthday (special badge)
- **365 Club** - Use Minsoto for 365 consecutive days
- **Midnight Mystery** - Complete task at exactly 12:00:00 AM

***

# **5. Title \& Rank System**

## **5.1 Title Philosophy**

**Titles represent:**

1. **Level milestones** (general progression)
2. **Specialization** (what you're good at)
3. **Achievements** (rare accomplishments)
4. **Guild roles** (circle positions)

**User can display:**

- **1 primary title** (shown on profile)
- **Multiple badges** (small icons below name)

***

## **5.2 Level-Based Titles**

### **Main Progression Titles**

| **Level Range** | **Title** | **Japanese** | **Theme** |
| :-- | :-- | :-- | :-- |
| 1-4 | Novice | 初心者 (Shoshinsha) | Beginner |
| 5-9 | Apprentice | 見習い (Minarai) | Learning |
| 10-14 | Practitioner | 実践者 (Jissensha) | Practicing |
| 15-19 | Adept | 熟練者 (Jukurensha) | Skilled |
| 20-24 | Expert | 専門家 (Senmonka) | Expert |
| 25-29 | Master | 達人 (Tatsujin) | Master |
| 30-34 | Sage | 賢者 (Kenja) | Wise |
| 35-39 | Virtuoso | 名人 (Meijin) | Virtuoso |
| 40-44 | Grandmaster | 宗師 (Soshi) | Grandmaster |
| 45-49 | Enlightened | 悟り (Satori) | Enlightened |
| 50-59 | Zen Master | 禅師 (Zenshi) | Zen master |
| 60-69 | Legendary | 伝説 (Densetsu) | Legendary |
| 70-79 | Transcendent | 超越者 (Choetsusha) | Beyond |
| 80-89 | Immortal | 不滅 (Fumetsu) | Immortal |
| 90-99 | Divine | 神聖 (Shinsei) | Divine |
| 100+ | Eternal | 永遠 (Eien) | Eternal |


***

## **5.3 Specialization Titles**

**Unlocked by earning 10,000+ XP in specific category:**

### **Productivity Specializations**

- **Taskmaster** - Task completion focus
- **Habit Guru** - Habit consistency focus
- **Goal Crusher** - Goal achievement focus
- **Time Wizard** - Schedule optimization
- **Productivity Monk** - Overall productivity balance


### **Social Specializations**

- **Connector** - Networking focus
- **Mentor** - Helping others focus
- **Community Builder** - Organization engagement
- **Content Creator** - Posting \& sharing
- **Influencer** - High engagement


### **Circle Specializations**

- **Guild Master** - Circle leadership
- **Team Captain** - Team coordination
- **Circle MVP** - Top contributor
- **Strategist** - Planning \& organization
- **Motivator** - Team encouragement


### **Mastery Specializations**

- **Zen Scholar** - All-around balance
- **Completionist** - Achievement hunter
- **Streak Legend** - Long-term consistency
- **Pioneer** - Early adopter + innovation
- **Perfectionist** - Quality over quantity

***

## **5.4 Achievement-Based Titles**

**Rare titles from specific achievements:**

- **Unbreakable** - 365-day habit streak
- **Ironman** - Manual logging for 365 days
- **Champion** - Win 10 circle competitions
- **Philanthropist** - Help 100 users
- **Legend** - Complete 1,000 tasks
- **Eternal** - Reach Level 100
- **Early Adopter** - First 1,000 users

***

## **5.5 Circle/Guild Titles**

**Role-Based Titles (within circles):**

- **Guild Leader** - Circle creator/admin
- **Officer** - Circle moderator
- **Veteran** - 100+ days in circle
- **Recruit** - New member
- **Champion** - Monthly MVP

**Competition Titles (temporary, 30 days):**

- **Tournament Victor** 🏆
- **Season Champion** 🥇
- **Runner-Up** 🥈
- **Bronze Medalist** 🥉

***

## **5.6 Title Display System**

### **Profile Header**

```
┌────────────────────────────────────────┐
│  @kenji_a                              │
│  Zen Master 禅 · Level 52              │
│  ⭐ Taskmaster · 🏆 Champion           │
│                                        │
│  "The journey is the reward"           │
└────────────────────────────────────────┘
```


### **Title Selection UI**

```
┌────────────────────────────────────────┐
│  SELECT PRIMARY TITLE                  │
├────────────────────────────────────────┤
│                                        │
│  ⦿ Zen Master (Level 52)               │
│  ○ Taskmaster (Specialization)         │
│  ○ Champion (Achievement)              │
│  ○ Early Adopter (Rare)                │
│                                        │
│  [Save Changes]                        │
└────────────────────────────────────────┘
```


***

# **6. Guild Integration with Circles**

## **6.1 Circles → Guilds Transformation**

**Current Circles:** Simple groups for collaboration
**Enhanced Guilds:** Competitive + collaborative teams with XP system

### **Guild Features**

```
Circle/Guild = Existing Circle Structure + Guild Mechanics

Guild Mechanics:
├── Collective XP Pool
├── Guild Level
├── Guild Achievements
├── Competitions & Tournaments
├── Guild Rewards
└── Guild Leaderboards
```


***

## **6.2 Guild XP System**

### **How Guild XP Works**

**Individual Contribution:**

```
User earns 100 XP
    ↓
75 XP → User's personal total
25 XP → Guild's collective pool
    ↓
Both user and guild benefit
```

**Contribution Ratio:**

- 75% to personal XP
- 25% to guild XP
- User can choose higher contribution (50/50 or 100% guild)


### **Guild Level Progression**

```
Guild Level = Total Guild XP / 10,000

Level 1:  10,000 XP   (10 active members, 1 month)
Level 5:  50,000 XP   (Good activity)
Level 10: 100,000 XP  (Very active guild)
Level 20: 200,000 XP  (Elite guild)
Level 50: 500,000 XP  (Legendary guild)
```


***

## **6.3 Guild Achievements**

### **Collective Achievements**

**Formation \& Growth:**

- **Guild Founded** - Create a guild (500 XP)
- **Growing Family** - Reach 10 members (1,000 XP)
- **Large Guild** - Reach 50 members (5,000 XP)
- **Mega Guild** - Reach 100 members (10,000 XP)

**Activity Milestones:**

- **Active Week** - 100+ guild XP in 7 days (500 XP)
- **Power Month** - 1,000+ guild XP in 30 days (2,000 XP)
- **Guild Dynasty** - 6 months of continuous activity (10,000 XP)

**Team Achievements:**

- **United Front** - All members online same day (1,000 XP)
- **Taskforce** - Complete 100 tasks in 24 hours (2,000 XP)
- **Habit Champions** - All members maintain streak for 7 days (3,000 XP)
- **Perfect Harmony** - 30 days with 0 missed guild goals (5,000 XP)

***

## **6.4 Guild Competitions**

### **Competition Types**

**1. XP Sprint (Weekly)**

```
Duration: 7 days
Goal: Earn most guild XP
Rewards:
  1st Place: 5,000 XP + "Champion" title (7 days)
  2nd Place: 3,000 XP
  3rd Place: 2,000 XP
  Top 10: 1,000 XP
```

**2. Task Marathon (Monthly)**

```
Duration: 30 days
Goal: Complete most tasks as a guild
Rewards:
  Winner: "Task Masters" guild badge
  All members: +10% XP multiplier for 30 days
```

**3. Habit Challenge (Monthly)**

```
Duration: 30 days
Goal: Highest average habit completion rate
Rewards:
  Winner: "Consistency Kings" guild badge
  All members: Exclusive "Unbreakable" theme
```

**4. Goal Rush (Quarterly)**

```
Duration: 90 days
Goal: Complete most collective goals
Rewards:
  Winner: Permanent "Legendary Guild" badge
  Guild hall customization unlocked
```


***

## **6.5 Guild Roles \& Permissions**

### **Role Hierarchy**

**Guild Master:**

- Create/disband guild
- Promote/demote officers
- Set guild goals
- Manage competitions
- Customize guild profile

**Officers:**

- Invite/remove members
- Set weekly goals
- Post announcements
- Moderate guild chat

**Veterans (30+ days):**

- Propose guild goals
- Vote on guild decisions
- Access guild archive

**Members:**

- Contribute XP
- Participate in goals
- View guild stats
- Basic chat access

**Recruits (< 7 days):**

- Limited contribution (50% guild XP)
- Read-only chat
- Can't vote

***

## **6.6 Guild Rewards**

### **Unlockable Perks**

**Level 5:**

- Custom guild banner
- Guild color scheme
- +5% XP bonus for all members

**Level 10:**

- Guild hall (dedicated page)
- Private voice channels (future)
- Guild leaderboards

**Level 20:**

- Custom guild emoji
- Guild-exclusive challenges
- +10% XP bonus for all members

**Level 50:**

- Legendary guild badge
- Featured on homepage
- Guild legacy system (permanent record)

***

## **6.7 Guild Profile \& Stats**

### **Guild Profile Display**

```
┌────────────────────────────────────────────────┐
│  ZEN WARRIORS 禅の戦士                         │
│  Level 23 · 234,500 Guild XP                   │
│  Founded: Jan 2024 · 45 Members · 12 Online    │
│                                                │
│  🏆 Champion x3 · ⭐ Legendary Guild           │
│                                                │
│  "Mindful productivity through collaboration"  │
│                                                │
│  ┌────────────────┐  ┌─────────────────────┐  │
│  │  THIS WEEK     │  │  ALL-TIME           │  │
│  │  +8,450 XP     │  │  Top Contributors   │  │
│  │  Rank: #3      │  │  1. @kenji_a        │  │
│  │                │  │  2. @sakura_m       │  │
│  │  [View Goals]  │  │  3. @yuki_t         │  │
│  └────────────────┘  └─────────────────────┘  │
│                                                │
│  [Join Guild] [Challenge Guild] [Guild Chat]  │
└────────────────────────────────────────────────┘
```


***

# **7. Competitive \& Collaborative Mechanics**

## **7.1 Individual Leaderboards**

### **Global Leaderboards**

**1. XP Rankings (Overall)**

```
┌─────────────────────────────────────┐
│  GLOBAL XP LEADERBOARD              │
├─────────────────────────────────────┤
│  1. @kenji_a        52,840 XP  🥇  │
│  2. @sakura_m       48,220 XP  🥈  │
│  3. @yuki_t         45,100 XP  🥉  │
│  ...                                │
│  42. You           12,345 XP        │
│  ...                                │
└─────────────────────────────────────┘
```

**Leaderboard Categories:**

- Overall XP (all-time)
- Weekly XP (resets Monday)
- Monthly XP (resets 1st)
- Tasks Completed
- Longest Habit Streak
- Guild Contributions

**Privacy Options:**

- Opt-in to global leaderboards
- Show only to friends
- Show only to guild
- Completely private

***

## **7.2 Organization Leaderboards**

**Within-Organization Rankings:**

```
┌─────────────────────────────────────┐
│  IIIT SRI CITY LEADERBOARD          │
├─────────────────────────────────────┤
│  1. @kenji_a        52,840 XP       │
│  2. @hiro_k         38,500 XP       │
│  3. @yuki_t         35,200 XP       │
│  ...                                │
└─────────────────────────────────────┘
```

**Friendly Competition:**

- See how you rank among classmates/colleagues
- Department-based sub-rankings
- Year-based rankings (for colleges)

***

## **7.3 Collaborative Goals**

### **Guild Goal Structure**

```javascript
{
  goal_id: "guild_goal_123",
  guild_id: "zen_warriors",
  type: "collective",
  target: {
    metric: "tasks_completed",
    count: 500,
    timeframe: "7 days"
  },
  progress: {
    current: 342,
    contributors: [
      {user: "@kenji_a", contribution: 87},
      {user: "@sakura_m", contribution: 65},
      // ...
    ]
  },
  rewards: {
    guild_xp: 5000,
    member_xp: 200,
    achievement: "Task Force"
  }
}
```


### **Goal Types**

**1. Collective Goals** (team total)

- Complete 500 tasks as a guild
- Earn 10,000 guild XP this week
- Maintain 50 habit streaks collectively

**2. Threshold Goals** (individual thresholds)

- All members complete 5 tasks this week
- 80% of members maintain habit streak
- Every member earns 100 XP minimum

**3. Challenge Goals** (competition within guild)

- Race to 1,000 XP first
- Most tasks completed wins
- Friendly internal competition

***

## **7.4 Inter-Guild Competition**

### **Guild Wars (Monthly Event)**

**Format:**

```
Duration: 7 days
Participants: All guilds opt-in
Objective: Earn most guild XP

Tiers:
  - Diamond (Level 30+ guilds)
  - Platinum (Level 20-29)
  - Gold (Level 10-19)
  - Silver (Level 5-9)
  - Bronze (Level 1-4)

Rewards scale by tier
```

**Real-time Battle Board:**

```
┌────────────────────────────────────────┐
│  GUILD WARS - PLATINUM TIER            │
│  Time Remaining: 2d 14h 23m            │
├────────────────────────────────────────┤
│  🥇 1. Zen Warriors    18,450 XP       │
│  🥈 2. Task Masters    17,220 XP       │
│  🥉 3. Flow State      15,800 XP       │
│     4. Deep Work       14,300 XP       │
│     5. Productivity++  12,890 XP       │
│     ...                                │
│     12. Your Guild      8,540 XP       │
│     ...                                │
└────────────────────────────────────────┘
```


***

## **7.5 Cooperative Events**

### **Server-Wide Events** (Quarterly)

**Example: "Global Productivity Day"**

```
Duration: 24 hours
Goal: Community completes 100,000 tasks
Progress: ████████░░ 85,340 / 100,000

Rewards (if goal met):
  - All users: +500 XP bonus
  - All guilds: +5,000 guild XP
  - Platform unlocks: New widget type
  - Exclusive "GPD 2024" badge
```

**Event Types:**

- Productivity Marathon (task focus)
- Habit Harmony (habit focus)
- Connection Festival (social focus)
- Knowledge Share (content creation)

***

# **8. Progression Pathways**

## **8.1 Player Archetypes**

### **The Achiever (Completionist)**

```
Focus: Unlock all achievements
Gameplay: Task completion, streaks, milestones
Rewards: Titles, badges, rare achievements
Progress: Achievement % tracker
```


### **The Competitor (Leaderboard Chaser)**

```
Focus: Top rankings
Gameplay: High XP gains, efficiency optimization
Rewards: Leaderboard positions, temporary titles
Progress: Rank changes, percentile tracking
```


### **The Socialite (Community Builder)**

```
Focus: Connections & guild success
Gameplay: Helping others, guild contributions
Rewards: Social badges, guild titles
Progress: Connection count, guild rank
```


### **The Specialist (Mastery Seeker)**

```
Focus: Deep expertise in one area
Gameplay: Consistent habits or tasks
Rewards: Specialization titles, mastery badges
Progress: Category-specific XP
```


### **The Zen Monk (Balanced Approach)**

```
Focus: Holistic growth
Gameplay: Balance across all activities
Rewards: "Zen" themed titles, balance badges
Progress: Category balance chart
```


***

## **8.2 Progress Visualization**

### **Personal Progress Dashboard Widget**

```
┌────────────────────────────────────────┐
│  PROGRESSION OVERVIEW                  │
├────────────────────────────────────────┤
│                                        │
│  Level: 23 ████████░░ 83% to Level 24 │
│  Total XP: 22,840                      │
│                                        │
│  ┌────────────┐  ┌────────────┐       │
│  │ CATEGORY   │  │ XP EARNED  │       │
│  │ Tasks      │  │ ████░ 8,450│       │
│  │ Habits     │  │ █████ 9,200│       │
│  │ Social     │  │ ██░░░ 3,100│       │
│  │ Guild      │  │ ███░░ 2,090│       │
│  └────────────┘  └────────────┘       │
│                                        │
│  Achievements: 47 / 120 (39%)         │
│  Next Milestone: Level 25 (Zen Master)│
│                                        │
└────────────────────────────────────────┘
```


### **Guild Progress Tracking**

```
┌────────────────────────────────────────┐
│  GUILD PROGRESS                        │
├────────────────────────────────────────┤
│  Zen Warriors · Level 23               │
│  ████████████░░░ 87% to Level 24       │
│                                        │
│  Weekly Goal: Complete 500 tasks       │
│  Progress: ████████░░ 342 / 500        │
│                                        │
│  Top Contributors This Week:           │
│  1. @kenji_a      87 tasks             │
│  2. @sakura_m     65 tasks             │
│  3. @yuki_t       58 tasks             │
│                                        │
└────────────────────────────────────────┘
```


***

# **9. UI/UX Design Considerations**

## **9.1 Zen Aesthetic Integration**

### **XP Gain Notification**

```
┌─────────────────────┐
│  +50 XP            │  ← Subtle, top-right corner
│  Task completed    │  ← Fades after 2 seconds
└─────────────────────┘
```

**Design Principles:**

- Small, unobtrusive notifications
- Fade in/out smoothly
- No loud sounds or flashy effects
- Black background with white text
- Minimal border


### **Achievement Unlock (Subtle)**

```
┌────────────────────────────────┐
│  Achievement Unlocked          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│           ⚔️                    │
│      TASK LEGEND               │
│   Complete 1,000 tasks         │
│                                │
│      +1,000 XP earned          │
│                                │
│  [View Details] [Dismiss]     │
└────────────────────────────────┘
```

**Key Features:**

- Center screen modal (not popup)
- Smooth fade-in animation
- Clean typography
- Minimal decoration (just border + icon)
- Can be dismissed quickly

***

## **9.2 Dashboard Integration**

### **XP Widget (Always Visible)**

```
┌────────────────────────────────┐
│  LEVEL 23 禅                   │
│  22,840 / 27,600 XP            │
│  ████████████░░░░ 83%          │
│                                │
│  Today: +385 XP                │
│  Streak: 14 days · +10% boost  │
└────────────────────────────────┘
```


### **Achievement Progress Widget**

```
┌────────────────────────────────┐
│  ACHIEVEMENT PROGRESS          │
├────────────────────────────────┤
│  47 / 120 unlocked (39%)       │
│                                │
│  In Progress:                  │
│  ⚔️ Task Legend  ██████░ 850   │
│  🔥 Month Master ████░░░ 24d   │
│  👥 Network     ████░░░ 73     │
│                                │
│  [View All]                    │
└────────────────────────────────┘
```


***

## **9.3 Profile Display**

### **Badges \& Titles Section**

```
┌──────────────────────────────────────┐
│  @kenji_a                            │
│  Zen Master 禅 · Level 52            │
├──────────────────────────────────────┤
│  52,840 XP · 14-day streak           │
│  ⭐ Taskmaster · 🏆 Champion x3      │
│  🔥 Unbreakable · 👑 Early Adopter   │
└──────────────────────────────────────┘
```

**Badge Display Rules:**

- Max 6 badges visible
- User selects which to display
- Hover to see badge description
- Click to view achievement details

***

## **9.4 Guild Hall Design**

### **Guild Main Page**

```
┌────────────────────────────────────────────────┐
│                                                │
│         ZEN WARRIORS 禅の戦士                   │
│  Level 23 · 234,500 Guild XP · 45 Members     │
│                                                │
│  "Mindful productivity through collaboration"  │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────┐│
│  │  THIS WEEK   │  │ LEADERBOARD  │  │ GOALS││
│  │  +8,450 XP   │  │ @kenji_a     │  │ 3/5  ││
│  │  Rank: #3    │  │ @sakura_m    │  │ Done ││
│  └──────────────┘  └──────────────┘  └──────┘│
│                                                │
│  [Activity Feed] [Members] [Achievements]     │
│                                                │
└────────────────────────────────────────────────┘
```


***

## **9.5 Leaderboard Design**

### **Leaderboard Page**

```
┌────────────────────────────────────────┐
│  LEADERBOARDS                          │
├────────────────────────────────────────┤
│  [Global] [Organization] [Guild]       │
│  [All Time] [Monthly] [Weekly]         │
│                                        │
│  Global XP - All Time                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                        │
│  🥇 1. @kenji_a      52,840 XP  ▲2    │
│  🥈 2. @sakura_m     48,220 XP  ▼1    │
│  🥉 3. @yuki_t       45,100 XP  ▬     │
│     4. @hiro_k       42,500 XP  ▲3    │
│     5. @mei_l        40,100 XP  ▼2    │
│     ...                                │
│     42. You         12,345 XP   ▲5    │
│     ...                                │
│                                        │
│  [Privacy Settings]                    │
└────────────────────────────────────────┘
```

**Features:**

- Rank change indicators (▲▼▬)
- Personal rank highlighted
- Filter by timeframe
- Privacy controls

***

# **10. Balance \& Economy**

## **10.1 XP Economy Principles**

### **Core Balance Goals:**

1. **Effort = Reward** - XP proportional to actual work
2. **No Pay-to-Win** - Cannot buy XP
3. **Sustainable Progression** - Avoid burnout
4. **Fair Competition** - Everyone has equal opportunity

### **XP Inflation Prevention**

- Fixed XP values (no % increases)
- Diminishing returns on repetitive actions
- Daily/weekly caps on certain actions
- Quality over quantity (verified contributions)

***

## **10.2 Daily XP Expectations**

### **Casual User (1 hour/day)**

```
Activity:
  - Complete 3 tasks (30-150 XP)
  - Log 3 habits (15 XP)
  - Check-in daily (5 XP)
  - Minor social interaction (20 XP)

Total: ~100-200 XP/day
Monthly: 3,000-6,000 XP
Level Progress: ~1 level/month (early levels)
```


### **Active User (2-3 hours/day)**

```
Activity:
  - Complete 8 tasks (80-400 XP)
  - Log 5 habits (25 XP)
  - Daily goal completion (100 XP)
  - Guild contributions (50 XP)
  - Social engagement (50 XP)

Total: ~300-600 XP/day
Monthly: 9,000-18,000 XP
Level Progress: ~1-2 levels/month
```


### **Power User (4+ hours/day)**

```
Activity:
  - Complete 15+ tasks (150-750 XP)
  - Log 8+ habits (40 XP)
  - Daily + weekly goals (600 XP)
  - Heavy guild participation (200 XP)
  - Content creation (150 XP)
  - Help others (100 XP)

Total: ~800-1,500 XP/day
Monthly: 24,000-45,000 XP
Level Progress: ~2-4 levels/month
```


***

## **10.3 Anti-Exploit Measures**

### **Rate Limiting**

```
Task Creation & Completion:
  - Max 50 tasks created/day
  - Max 30 tasks completed/day
  - Suspicious patterns flagged

Habit Logging:
  - Can only log today's habits
  - Cannot backfill > 7 days
  - Suspicious streaks reviewed

Social Actions:
  - Max 100 connection requests/day
  - Max 50 posts/day
  - Quality score required for XP
```


### **Verification Systems**

**Task Verification:**

- Tasks with descriptions earn more XP
- Tasks with due dates earn more XP
- Random spot-checks for suspicious patterns

**Habit Verification:**

- Photo proof option (future)
- Guild accountability (members verify)
- Streak challenges require proof

**Social Verification:**

- Peer upvotes required for "help" XP
- Content must have engagement for full XP
- Spam detection algorithms

***

## **10.4 Guild Balance**

### **Guild Size vs. XP Balance**

**Problem:** Large guilds have unfair advantage

**Solution: Normalized Guild XP**

```
Guild Level = Total Guild XP / (Members × 100)

Example:
  Guild A: 50 members, 50,000 XP → Level 10
  Guild B: 10 members, 10,000 XP → Level 10
  
Both equally ranked despite size difference
```

**Competition Tiers:**

- Guilds compete within size brackets
- Small (1-10 members)
- Medium (11-30 members)
- Large (31-50 members)
- Mega (51+ members)

***

# **11. Social Dynamics**

## **11.1 Positive Social Mechanics**

### **Collaborative XP Bonuses**

```
Work with Friends:
  - Complete task with friend tag: +10% XP
  - Complete guild goal together: +15% XP
  - Maintain parallel streaks: +5% XP
```


### **Mentorship System**

```
Mentor Rewards:
  - Help new user complete first task: +50 XP
  - Mentee reaches Level 5: +200 XP
  - Mentee reaches Level 10: +500 XP
  
Mentee Benefits:
  - +20% XP for first 30 days
  - Guidance from experienced user
  - Faster progression
```


***

## **11.2 Preventing Toxicity**

### **Anti-Competitive Design**

**What We DON'T Do:**

- ❌ Public shaming of low performers
- ❌ Forced competition
- ❌ XP loss for inactivity
- ❌ Penalty for leaving guilds
- ❌ Public "worst performers" lists

**What We DO:**

- ✅ Opt-in leaderboards
- ✅ Private progress tracking
- ✅ Celebrate everyone's wins
- ✅ Focus on personal growth
- ✅ Guild support systems


### **Guild Management**

**Inactive Member Handling:**

- Grace period: 30 days inactivity
- Automatic "inactive" status (no kick)
- Can rejoin without penalty
- Guild XP contributed remains

**Toxic Member Prevention:**

- Reporting system
- Moderator tools
- Warning → suspension → ban
- Guild leaders can remove members
- Platform-wide bans for severe cases

***

## **11.3 Encouraging Healthy Competition**

### **Friendly Rivalry Features**

**Challenge Friends:**

```
@kenji_a challenges @yuki_t

Challenge: Complete 10 tasks first
Duration: 24 hours
Reward: Bragging rights + 100 XP

[Accept] [Decline] [Modify]
```

**Guild vs. Guild Battles:**

```
Zen Warriors challenges Task Masters

Battle: Most habits completed this week
Duration: 7 days
Stakes: Winner gets "Weekly Champions" badge

[Accept] [Counter-Offer] [Decline]
```


***

# **12. Anti-Gaming Measures**

## **12.1 Bot Detection**

### **Patterns Flagged:**

- Tasks created \& completed in < 1 minute
- Perfect timing patterns (every X seconds)
- Impossible completion rates
- Duplicate task descriptions
- API abuse patterns


### **Response:**

- Automatic review flagging
- Temporary XP freeze
- Manual review required
- Rollback of suspicious XP
- Account suspension if confirmed

***

## **12.2 Fake Engagement Prevention**

### **Social XP Verification**

```
Peer Review System:
  - "Help" XP requires recipient confirmation
  - Content XP requires genuine engagement
  - Upvotes weighted by user reputation
  - Suspicious voting patterns flagged
```


### **Guild XP Verification**

```
Contribution Verification:
  - Guild admins can review contributions
  - Suspicious spikes investigated
  - Retroactive XP adjustment possible
  - Repeat offenders removed
```


***

## **12.3 Time-Based Safeguards**

### **Realistic Progression Caps**

```
Daily Caps:
  - Max 2,000 XP from tasks/day
  - Max 500 XP from social/day
  - Max 1,000 XP from guild/day
  - Total daily cap: ~3,500 XP

Weekly Caps:
  - Max 20,000 XP/week
  - Prevents marathon grinding
  - Encourages consistent daily use
```


***

# **13. Future Extensions**

## **13.1 Advanced Features (Phase 2)**

### **Seasonal Competitions**

```
3-Month Seasons:
  - Seasonal leaderboards
  - Exclusive seasonal achievements
  - Season rewards (titles, badges)
  - Reset rankings each season
  - Keep XP/levels (never reset)
```


### **Prestige System (Post-Level 100)**

```
Prestige Mechanics:
  - Reach Level 100 → Option to prestige
  - Reset level to 1 (keep achievements)
  - Gain "Prestige" counter (★★★)
  - +10% XP multiplier per prestige
  - Exclusive prestige titles
  - Permanent "Eternal" badge
```


### **Guild Housing**

```
Customizable Guild Halls:
  - Unlock furniture with guild achievements
  - Virtual space for guild identity
  - Display trophies & awards
  - Guild-specific themes
  - Meeting rooms (future voice/video)
```


***

## **13.2 Monetization (Ethical)**

**What We WON'T Sell:**

- ❌ XP boosts
- ❌ Achievement unlocks
- ❌ Leaderboard positions
- ❌ Title purchases
- ❌ Any progression shortcuts

**What We CAN Sell:**

- ✅ Cosmetic profile themes
- ✅ Custom guild banners
- ✅ Profile customization options
- ✅ Additional widget slots
- ✅ Premium analytics/insights
- ✅ Early access to new features

**Philosophy:** Pay for aesthetics \& convenience, never progression

***

## **13.3 Integration Opportunities**

### **Third-Party Tools**

```
API for:
  - Fitness apps (Strava, Fitbit) → Habit XP
  - Study apps (Anki, Notion) → Task XP
  - Time tracking (Toggl, RescueTime) → Productivity XP
  - Code commits (GitHub) → Developer XP
```


### **Real-World Rewards (Future)**

```
XP Redemption:
  - Partner with brands for discounts
  - Educational platform discounts
  - Productivity tool subscriptions
  - Charity donations
  - Real-world badges/merchandise
```


***

# **14. Implementation Roadmap**

## **Phase 1: Core XP \& Achievements (2 months)**

- [x] Basic XP system
- [x] Achievement framework
- [x] Level progression
- [x] Title system
- [x] Profile badges
- [x] Simple leaderboards


## **Phase 2: Guild Integration (1 month)**

- [ ] Guild XP pooling
- [ ] Guild achievements
- [ ] Guild levels
- [ ] Basic guild competitions
- [ ] Guild stats dashboard


## **Phase 3: Competitive Features (1 month)**

- [ ] Weekly/monthly competitions
- [ ] Organization leaderboards
- [ ] Challenge system
- [ ] Guild wars
- [ ] Seasonal events


## **Phase 4: Polish \& Balance (ongoing)**

- [ ] Anti-cheat systems
- [ ] Balance adjustments
- [ ] Community feedback integration
- [ ] Achievement expansion
- [ ] New guild features

**Total Timeline:** 4-5 months for full system

***

# **15. Success Metrics**

## **KPIs to Track**

### **Engagement Metrics**

- Daily Active Users (DAU)
- Average session time
- Tasks completed/day
- Habits logged/day
- XP earned/day per user


### **Social Metrics**

- Guild participation rate
- Competition participation rate
- Leaderboard opt-in rate
- Friend challenges sent
- Guild vs. guild battles


### **Progression Metrics**

- Average user level
- Achievement completion rate
- Title diversity
- Prestige users
- Level 50+ users


### **Retention Metrics**

- 7-day retention
- 30-day retention
- Guild retention (vs. solo)
- Competition participants retention
- Churn rate by level

***

# **16. Risk Mitigation**

## **Potential Risks \& Solutions**

### **Risk 1: Addiction/Burnout**

**Mitigation:**

- Daily XP caps
- "Take a break" reminders
- No punishment for inactivity
- Anti-grind mechanics
- Focus on sustainable habits


### **Risk 2: Gaming the System**

**Mitigation:**

- Bot detection
- Manual reviews
- Community reporting
- XP rollback capability
- Permanent bans for abuse


### **Risk 3: Toxic Competition**

**Mitigation:**

- Opt-in leaderboards
- Private progress options
- Focus on collaboration
- Positive reinforcement only
- Strong moderation


### **Risk 4: Power User Dominance**

**Mitigation:**

- Seasonal resets (leaderboards only)
- Multiple leaderboard categories
- Recognition for all levels
- Normalized guild rankings
- Diverse achievement paths

***

# **Conclusion**

This XP, achievement, and guild system transforms Minsoto from a **productivity tool** into a **productivity game**—maintaining its mindful philosophy while adding engaging progression mechanics.

**Core Thesis:**
> *"Make productivity rewarding, not just necessary. Make growth visible, not just felt. Make community powerful, not just present."*

By gamifying **real accomplishments** rather than **time spent**, Minsoto can drive engagement without sacrificing its anti-addiction values. Users will stay because they're **genuinely growing**, not because they're **addicted to notifications**.

The guild system transforms circles from passive groups into **active communities** with shared goals, friendly competition, and collective achievements—all while maintaining the Zen aesthetic and mindful approach that defines Minsoto.

***

**Next Steps:**

1. Validate concepts with core users
2. Design detailed database schema
3. Create mockups for new UI elements
4. Build MVP (basic XP + achievements)
5. Iterate based on feedback
6. Scale to full guild system

***

**Document Status:** Ready for Review \& Feedback
**Last Updated:** December 13, 2024
**Author:** Minsoto Product Team

