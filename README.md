# Photo Site

A photography portfolio built with [Next.js](https://nextjs.org). The home page shows a
grid of photo "sessions" (galleries); clicking one opens all the photos in that session.

## Running it locally

You need [Node.js](https://nodejs.org) (v20+) installed.

```bash
npm install      # install dependencies (creates node_modules/)
npm run dev      # start the dev server
```

Then open <http://localhost:3000>.

> **Note:** Out of the box the site shows **demo placeholder images** (random photos from
> picsum.photos). That's expected — it falls back to demo galleries whenever no real photos
> have been added yet. Add your own photos to replace them (see below).

## Deploying (and owning) the site

Deploy from your own machine with your own [Vercel](https://vercel.com) account so the
project, URL, and billing are all yours:

```bash
npx vercel        # logs into YOUR account, creates a preview deployment
npx vercel --prod # publishes the public production URL you control
```

The first `vercel` run asks a few setup questions — the defaults are fine (don't link to an
existing project, project name as you like, directory `./`).

## Adding your own photos

Photos live in **`public/photos/`**. The site builds galleries automatically from what it
finds there — no code changes needed.

**Each subfolder = one gallery ("session").**

```
public/
└── photos/
    ├── istanbul-trip/          ← one gallery
    │   ├── 01-street.jpg
    │   ├── 02-cafe.jpg
    │   └── 03-bridge.jpg
    └── wedding-may/            ← another gallery
        ├── a.jpg
        └── b.jpg
```

Rules the site follows:

- **Folder name → gallery title.** The folder name is shown as the title, with dashes turned
  into spaces and each word capitalized. So `istanbul-beyoglu` becomes "Istanbul Beyoglu".
  Use lowercase words separated by dashes.
- **Cover image.** Files are sorted alphabetically; the **first** one becomes the cover shown
  on the home page. Prefix filenames with `01-`, `02-`, … to control the order and pick the
  cover.
- **Supported formats:** `.jpg` `.jpeg` `.png` `.gif` `.webp` `.avif` `.heic`
- **Empty folders are ignored.** A subfolder with no images won't appear.

### Steps to add a gallery

1. Create a new folder inside `public/photos/`, e.g. `public/photos/my-shoot/`.
2. Copy your image files into it.
3. (Optional) Rename files like `01-...`, `02-...` to set their order; the first is the cover.
4. Restart `npm run dev` (or redeploy) to see them.

As soon as you add at least one real gallery, the demo placeholder images disappear and your
own photos take over.
