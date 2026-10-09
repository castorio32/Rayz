# RAYZ Ultra Smooth Scroll

This version changes the hero from video seeking to a pre-rendered 300-frame canvas sequence.

Why:
HTML5 `video.currentTime` scrubbing can visibly stutter when the browser seeks rapidly through an H.264 file. A canvas frame sequence gives deterministic frame-by-frame rendering, so the complete 10-second / 300-frame sequence follows scroll consistently.

Included:
- 300 frames at 30fps, grouped into 15 sprite sheets
- Canvas frame rendering
- GSAP ScrollTrigger
- Lenis smooth scrolling
- Smooth target-frame interpolation
- 3D camera/parallax layers
- Mouse parallax
- Cinematic text transitions
- Strong final camera pull-back so the final wearer is visible within the full video frame
- Responsive mobile layout

Run with VS Code Live Server or:
python -m http.server 8080


### Feedback deck
The final Feedback section is a five-card book/page-turn deck. Replace the placeholder `feedbackData` entries at the bottom of `script.js` with the real comments and image paths when supplied. The section supports autoplay, previous/next controls, touch pause, and a page-turn animation.
