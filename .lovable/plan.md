

## Plan: Fix Mobile Responsiveness and Smooth Scrolling

The app already has a mobile-first layout (max-width 480px) but needs viewport meta tweaks to prevent zoom issues, smooth scrolling, and proper overflow handling on real mobile devices.

### Changes

**1. `index.html` — Lock viewport to prevent zoom-out**
- Update the viewport meta tag to include `maximum-scale=1, user-scalable=no` so the page fills the screen properly on all phones without zooming out.

**2. `src/index.css` — Add smooth scroll and overflow fixes**
- Add `scroll-behavior: smooth` on `html`
- Add `-webkit-overflow-scrolling: touch` on body for iOS momentum scrolling
- Ensure `html, body` have `overflow-x: hidden` to prevent horizontal scroll
- Add `min-height: 100dvh` using dynamic viewport height so content fills the screen on mobile browsers with collapsing address bars

**3. `src/App.css` — Remove legacy constraints**
- Remove the `max-width: 1280px` and `padding: 2rem` on `#root` that may cause layout issues; let Tailwind classes on individual pages handle spacing.

### Result
- App fills the mobile screen edge-to-edge without zooming out
- Smooth, native-feeling scroll with iOS momentum
- No horizontal overflow or layout shifts
- Works correctly with dynamic mobile browser chrome (address bar hide/show)

