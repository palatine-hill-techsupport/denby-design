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
- `work-with-me.html` — services and contact form
- `blog.html` — searchable post archive
- `posts/` — individual articles
- `site.css` and `site.js` — shared presentation and behaviour
- `images/` and `fonts/` — static assets
- `rss.xml` — blog feed

## Publishing checklist

When adding a post, keep these in sync:

1. Add the article under `posts/`.
2. Add it to the homepage writing section in `index.html`.
3. Add it to the archive in `blog.html`.
4. Add it to `rss.xml` and update the feed build date.
5. Verify local links and run `node --check site.js`.

The custom domain is configured by `CNAME`.
