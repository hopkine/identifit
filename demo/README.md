# identifit — Portfolio Demo

A web-based portfolio demo for the identifit app. Showcase the full app experience in the browser.

## Quick Start

```bash
# 1. Build the web app and copy to demo folder
npm run demo:build

# 2. Serve locally (opens at http://localhost:3000)
npm run demo:serve
```

Then open **http://localhost:3000** — you'll see the portfolio landing page with a "Try Live Demo" button that launches the full app.

## Deploy to Your Portfolio

### Option A: Vercel (recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. From project root: `cd demo && vercel`
3. Deploy — you'll get a URL like `identifit-demo.vercel.app`

### Option B: Netlify

1. Drag and drop the `demo` folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Or connect your repo and set build output to `demo`

### Option C: GitHub Pages

1. Push the demo folder to a repo
2. In Settings → Pages, set source to the branch containing `demo/`
3. Set root to `/demo` or use a custom domain

## Structure

```
demo/
├── index.html      # Portfolio landing page
├── app/            # Expo web build (gitignored — run demo:build to generate)
└── README.md
```

## Updating the Demo

After making changes to the app:

```bash
npm run demo:build
```

This rebuilds the web app and copies it to `demo/app/`. That folder is not committed — Vercel runs `demo:build` on deploy (`vercel.json`).
