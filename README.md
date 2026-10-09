# RAYZ Eyewear — GitHub / Vercel Ready

This folder is the deployable website root. **`index.html` must stay at the repository root.**

## Deploy with GitHub + Vercel
1. Create a new GitHub repository.
2. Upload the **contents of this folder**, not the outer ZIP/folder itself.
3. Confirm GitHub shows `index.html`, `style.css`, `script.js`, and `assets/` at the top level.
4. Import the repository into Vercel.
5. Framework Preset: **Other** (or leave Vercel to detect it).
6. Build Command: **empty**.
7. Output Directory: **`.`** / repository root.
8. Deploy.

## Important
- All RAYZ images, feedback photos, product photography, frame sheets, and both ad videos are included locally under `assets/`.
- The site uses relative paths such as `assets/products/...`, so it does not depend on `/mnt/data` or a local computer path.
- Both ad videos are included in the repository. Each is below GitHub's 100 MB individual-file limit.
- GSAP, ScrollTrigger, Lenis, and Google Fonts are loaded from public CDNs. The site's media assets do not depend on those CDNs.
