# elIT Solutions — Website

Marketing website for **elIT Solutions**, a Microsoft Solutions Partner delivering
AI integration (Microsoft Copilot & Agentic AI) and process automation (Power Platform),
alongside cloud, migration, on-premises, cybersecurity, and consulting services.

## Stack
Static site — plain HTML, CSS, and JavaScript. No build step, no backend.
Booking is handled by an embedded Microsoft Outlook Bookings scheduler.

## Structure
```
index.html        Home
solutions.html    Solutions (full portfolio)
about.html        About / Why us
contact.html      Contact (Outlook Bookings embed)
css/styles.css    Design system + light/dark themes
js/main.js        Theme toggle, scroll animations, neural-network canvas
assets/           Favicon + social share image
```

## Run locally
Any static server works, e.g.:
```
python -m http.server 5500
```
Then open http://localhost:5500

## Deploy
Publishes as-is to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).
For GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.
