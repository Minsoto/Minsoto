# Minsoto XP & Points System Documentation

## Overview

The gamification system provides XP (experience points) for leveling and Points for a personal reward store.

---

## XP System

### XP Sources

| Action | XP Amount |
|--------|-----------|
| Complete low priority task | 10 XP |
| Complete medium priority task | 25 XP |
| Complete high priority task | 40 XP |
| Complete urgent priority task | 50 XP |
| Log habit (base) | 10 XP |
| Log habit (7+ day streak) | +5 XP |
| Log habit (30+ day streak) | +15 XP |

### XP Multiplier (Streak Bonus)

The `UserXP.xp_multiplier` applies to all XP earned based on consecutive day streaks.

### Leveling

Level is calculated using: `level = 1 + floor(total_xp / 100)`

**Daily XP Cap: 500 XP** (anti-spam protection)

---

## Points System

### Earning Points

Users can assign custom point values to tasks and habits:
- **Tasks**: 0-500 points per task
- **Habits**: 0-100 base points per completion

### Streak Multiplier (Habits Only)

| Streak | Multiplier |
|--------|------------|
| 7+ days | +10% |
| 14+ days | +20% |
| 30+ days | +30% |
| 60+ days | +40% |
| 100+ days | +50% (max) |

**Daily Points Cap: 1000 points** (anti-spam protection)

---

## Reward Store

Users create personal rewards with custom costs. Points are spent to "redeem" rewards.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rewards/` | GET | List rewards |
| `/api/rewards/` | POST | Create reward |
| `/api/rewards/{id}/` | PATCH | Update reward |
| `/api/rewards/{id}/` | DELETE | Soft delete |
| `/api/rewards/{id}/redeem/` | POST | Spend points |
| `/api/rewards/history/` | GET | Redemption history |

---

## Anti-Spam Protections

1. **One-time awards**: XP/Points only awarded once per task/habit completion
2. **Daily caps**: 500 XP/day, 1000 Points/day
3. **Value caps**: Tasks max 500 pts, Habits max 100 pts base
4. **Streak cap**: Maximum 50% bonus from streaks

---

## Files Structure

### Backend (`gamification/`)

```
models.py       # UserXP, XPTransaction, Achievement, UserAchievement,
                # UserPoints, PointTransaction, Reward, RewardRedemption
serializers.py  # All API serializers
signals.py      # Auto-XP/Points on task/habit completion
views.py        # API endpoints
urls.py         # URL routing
```

### Frontend

```
types/gamification.ts       # TypeScript types
stores/gamificationStore.ts # Zustand state management
components/widgets/XPProgressWidget.tsx
components/widgets/PointsWidget.tsx
app/rewards/page.tsx        # Reward store page
```

---

## Future: Guild System

Phase 4-5 will add:
- Guild XP distribution
- Guild points pool
- Guild reward polls
- Voting system
