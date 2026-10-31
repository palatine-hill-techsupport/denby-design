# denby.design

Personal UX and digital-design portfolio for [denby.design](https://denby.design).

The site is dependency-free: HTML, CSS, JavaScript, local fonts, and static media are served directly from the repository root.

## Run locally

From the repository root:

```powershell
python -m http.server 8765
```

Then open <http://127.0.0.1:8765/>.

## Structure

- `index.html` — homepage and latest writing
- `portfolio.html` — project grid and modals
- `taixu.html` and `amped.html` — featured case studies
- `work-with-me.html` — services and contact form
- `blog.html` — searchable post archive
- `posts/` — individual articles
- `site.css` and `site.js` — shared presentation and behaviour
- `images/` and `fonts/` — static assets
- `rss.xml` — blog feed

## Background video

The homepage starts with the original full-viewport intro: centred logo,
wordmark, rotating tagline, interactive text ripple, and scroll-down control.
This intro is intentionally separate from the redesigned content and must be
preserved when updating page designs. Wheel, swipe, and page/arrow keys move
between the intro and content; scrolling farther into the content stays normal.
The intro retains its bright backdrop and radial shading. The approved 72%
teal overlay starts at `#home-content` and remains global on the other pages.
Reduced-motion preferences disable the background video and text animation,
tagline rotation, and smooth scroll transitions.
An optional regression check, `node scripts/check-home-intro.cjs`, verifies the
intro and its navigation on desktop/mobile, with and without reduced motion.
It requires Playwright and Chrome; `PLAYWRIGHT_MODULE` can point to an existing
Playwright installation. These are testing tools, not site dependencies.

`images/background.mp4` contains one forward-and-reverse cycle of the original
waves, played with the native HTML `loop` attribute. The frame order is
`0..513, 512..1`, using the first 21.44 seconds of the original footage, so
neither turnaround repeats an endpoint frame. The cycle is approximately
42.79 seconds at the original 1280 x 720 / 23.976 fps.

The reverse section is encoded into the MP4; no JavaScript seeking or negative
playback rate is needed. The MP4 metadata is placed before the video data for
progressive loading. All site pages use the same version query on the source
URL; update it together when replacing this asset so visitors fetch the new clip.
Use the original footage from Git history for future edits, rather than reversing
the already combined cycle again.

## Publishing checklist

### Featured screenshot previews

The original PNG screenshots remain unchanged in `images/evolved/`. Featured
cards use prefiltered, lossless WebP thumbnails through `srcset`, so the browser
does not have to shrink dense interface text directly from a full-screen capture.
Separate sizes support ordinary and high-density displays without upscaling.

After replacing one of these original PNGs, regenerate its thumbnails with
`node scripts/generate-preview-images.cjs`. This optional maintenance script needs
the `sharp` Node module; `SHARP_MODULE` can point to an existing installation.
Neither Node nor `sharp` is needed to serve the site.

### Blog posts

When adding a post, keep these in sync:

1. Add the article under `posts/`.
2. Add it to the homepage writing section in `index.html`.
3. Add it to the archive in `blog.html`.
4. Add it to `rss.xml` and update the feed build date.
5. Verify local links and run `node --check site.js`.

The custom domain is configured by `CNAME`.
