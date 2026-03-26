

## Plan: Add Animated Hero Visual to Onboarding Welcome Screen

Add an eye-catching animated graphic above the welcome text using Framer Motion. Since the app is about leads and follow-ups, create an animated "network/connections" illustration built with motion-animated SVG circles and lines that draw themselves in, plus a pulsing central icon.

### What gets built

**Animated hero graphic** in Step 1 of `src/components/Onboarding.tsx`:
- A central circular icon (target/crosshair motif) that scales in with a spring animation
- 3-4 orbiting dots that fade in sequentially with staggered delays, connected by animated lines
- Subtle gradient glow behind the central element
- All built with inline SVG + Framer Motion (no external assets needed)
- Uses the app's primary blue and accent colors
- Total animation sequence: ~1.5s, smooth and premium feeling

### Technical details

- **File changed**: `src/components/Onboarding.tsx` only
- Add a new `WelcomeHero` component within the file using `motion.div`, `motion.svg`, `motion.circle`, `motion.path`
- Animations: `pathLength` for line drawing, `scale`/`opacity` for elements appearing, `rotate` for subtle orbital motion
- Renders above the "Follow Through App" heading
- Responsive: sized relative to container, works on 390px mobile viewport

