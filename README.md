# Mae Okada — Cinematic Portfolio

An English-language portfolio with a scroll-driven hero, sections on Mae’s background, expertise, and approach. The site uses HTML, CSS, and JavaScript with no build step.

## Preview locally

From the root of the `dev/cinematic` branch, run `python -m http.server 8000` and open [localhost:8000](http://localhost:8000). You can also open `index.html` directly.

Desktop scrolling controls an apple falling from a branch. On smaller screens the fall plays once when the hero enters view. Reduced-motion users see a still orchard scene.

The tree is drawn locally with Canvas. The apple uses the Web Animations API, and section entrances use CSS keyframes triggered by IntersectionObserver. Portfolio copy comes from `dev/main`.
