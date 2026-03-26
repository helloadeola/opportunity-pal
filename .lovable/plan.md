

## Plan: First-Time App Tour Pop-up

Add a guided tour overlay that shows first-time users how the app works, right after onboarding completes. It will highlight the three key areas of the app in a simple step-through dialog.

### What the user sees

A modal overlay with 3 steps, each with a title, short description, and an icon/illustration:

1. **"Today's Follow-Ups"** — "Your most urgent leads show up here. Overdue and due-today items appear first."
2. **"Quick Capture"** — "Tap Add Lead to capture someone new in seconds — from an event, a call, or a conversation."
3. **"All Leads"** — "See everything in one place. Filter, search, and track what converts."

Each step has a "Next" button (and "Skip" on all steps). The final step has a "Got It" button. Dismissal saves `hasSeenAppTour` to localStorage so it only shows once.

### Changes

**1. Create `src/components/AppTour.tsx`**
- A multi-step modal component using `Dialog` (or a custom overlay with `framer-motion` like the existing About modal pattern)
- 3 tour steps with icon, title, and description
- Step indicator dots (reuse the pattern from Onboarding)
- Skip / Next / Got It buttons
- On dismiss: set `localStorage.setItem("hasSeenAppTour", "true")`
- Only renders when `hasSeenAppTour` is not `"true"`

**2. Update `src/pages/HomePage.tsx`**
- Import and render `<AppTour />` inside the HomePage
- It will auto-show on first visit after onboarding

### Technical details
- Uses the same `motion.div` overlay pattern already in HomePage (About modal)
- Stores tour completion in localStorage (consistent with onboarding pattern)
- No new dependencies needed

