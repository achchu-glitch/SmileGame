# SmileGame – Unique Features

These features make SmileGame stand out beyond basic score, timer, and rounds.

---

## 1. **Time bonus**
- **What:** Extra points for solving quickly. For every 5 seconds left on the clock when you answer correctly, you get +1 point.
- **Where:** Web game (login-app.js). Score line shows “+X time bonus” in the feedback.
- **Effect:** Encourages fast, accurate play; higher scores for quick solvers.

---

## 2. **Combo multiplier**
- **What:** Consecutive correct answers multiply your base point: 1st = 1x, 2nd = 2x, 3rd and more = 3x (capped at 3x).
- **Where:** Web game. A “2x” / “3x” badge appears in the game meta when you have a combo; feedback says “2x combo!” or “3x combo!”.
- **Effect:** Rewards consistency and builds momentum.

---

## 3. **“Explain my mistake”**
- **What:** After a **wrong** answer, the game tells you whether the correct digit is higher or lower than what you chose (without giving the answer).
- **Where:** Web game (feedback text). PHP: `AchievementService::explainMistake($answered, $correct)` in `src/Service/AchievementService.php`.
- **Effect:** Learning feedback instead of a plain “wrong”; helps improve without spoiling the puzzle.

---

## 4. **Extra time power-up**
- **What:** Once per game, you can add **+15 seconds** to the current round’s timer. Button: “⏱ +15s”.
- **Where:** Web game. Button appears below the round/timer line and hides after use (or when the game ends).
- **Effect:** One strategic save per game; adds a simple resource decision.

---

## 5. **Achievements**
- **What:** Five achievements unlock based on how you play. They are checked at **game over** and shown in a single line (e.g. “🏆 First Steps · Combo Master”).
- **Definitions:**
  - **First Steps** – Complete a game (at least one round finished).
  - **Perfect 10** – Score 10/10 correct.
  - **Combo Master** – Reach a 3x combo in one game.
  - **Time Saver** – Earn 20+ time bonus points in one game.
  - **Speedster** – Finish the last round with 30+ seconds left on the clock.
- **Where:** Web: `login-app.js` (ACHIEVEMENTS array + `getUnlockedAchievements()`). PHP: `AchievementService::getAllDefinitions()` and `getUnlocked()` in `src/Service/AchievementService.php` for use on the PHP game or leaderboard.
- **Effect:** Gives goals and something to show off (e.g. on a profile or results screen).

---

## Summary

| Feature           | Web (JS) | PHP                          |
|-------------------|----------|------------------------------|
| Time bonus        | ✅       | Can add in game.php scoring  |
| Combo multiplier  | ✅       | Can add in session + scoring |
| Explain mistake  | ✅       | ✅ AchievementService        |
| Extra time +15s  | ✅       | N/A (timer is JS)            |
| Achievements      | ✅       | ✅ AchievementService        |

To use the PHP achievement/explain logic: in `game.php` on correct/wrong, compute time bonus and combo from session; on game over call `AchievementService::getUnlocked(...)` and pass the result to the template. For “explain my mistake”, call `AchievementService::explainMistake((int)$_POST['answer'], $state['solution'])` when the answer is wrong and show it in the template.
