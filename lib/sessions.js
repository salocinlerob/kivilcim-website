import { readdir } from 'fs/promises';
import { join } from 'path';

const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp|avif|heic)$/i;

const DEMO = [
  { slug: 'istanbul-beyoglu',      title: 'Istanbul — Beyoğlu',         seed: 200, count: 8 },
  { slug: 'new-york-brooklyn',     title: 'New York — Brooklyn',         seed: 210, count: 6 },
  { slug: 'paris-montmartre',      title: 'Paris — Montmartre',          seed: 220, count: 7 },
  { slug: 'tokyo-shinjuku',        title: 'Tokyo — Shinjuku',            seed: 230, count: 5 },
  { slug: 'berlin-mitte',          title: 'Berlin — Mitte',              seed: 240, count: 9 },
  { slug: 'barcelona-gothic',      title: 'Barcelona — Gothic Quarter',  seed: 250, count: 4 },
  { slug: 'amsterdam-jordaan',     title: 'Amsterdam — Jordaan',         seed: 260, count: 6 },
  { slug: 'rome-trastevere',       title: 'Rome — Trastevere',           seed: 270, count: 8 },
  { slug: 'london-hackney',        title: 'London — Hackney',            seed: 280, count: 5 },
  { slug: 'seoul-hongdae',         title: 'Seoul — Hongdae',             seed: 290, count: 7 },
  { slug: 'lisbon-alfama',         title: 'Lisbon — Alfama',             seed: 300, count: 6 },
  { slug: 'mexico-city-roma',      title: 'Mexico City — Roma Norte',    seed: 310, count: 5 },
  { slug: 'athens-exarcheia',      title: 'Athens — Exarcheia',          seed: 320, count: 7 },
  { slug: 'havana-centro',         title: 'Havana — Centro',             seed: 330, count: 4 },
  { slug: 'buenos-aires-palermo',  title: 'Buenos Aires — Palermo',      seed: 340, count: 8 },
  { slug: 'nairobi-westlands',     title: 'Nairobi — Westlands',         seed: 350, count: 5 },
  { slug: 'mumbai-bandra',         title: 'Mumbai — Bandra',             seed: 360, count: 6 },
  { slug: 'cairo-zamalek',         title: 'Cairo — Zamalek',             seed: 370, count: 7 },
  { slug: 'kyoto-gion',            title: 'Kyoto — Gion',                seed: 380, count: 5 },
  { slug: 'marrakech-medina',      title: 'Marrakech — Medina',          seed: 390, count: 6 },
  { slug: 'prague-vinohrady',      title: 'Prague — Vinohrady',          seed: 400, count: 4 },
  { slug: 'shanghai-xintiandi',    title: 'Shanghai — Xintiandi',        seed: 410, count: 7 },
  { slug: 'tbilisi-old-town',      title: 'Tbilisi — Old Town',          seed: 420, count: 5 },
  { slug: 'bogota-chapinero',      title: 'Bogotá — Chapinero',          seed: 430, count: 6 },
  { slug: 'cape-town-woodstock',   title: 'Cape Town — Woodstock',       seed: 440, count: 8 },
  { slug: 'tehran-tajrish',        title: 'Tehran — Tajrish',            seed: 450, count: 5 },
  { slug: 'sofia-lozenets',        title: 'Sofia — Lozenets',            seed: 460, count: 4 },
  { slug: 'lima-miraflores',       title: 'Lima — Miraflores',           seed: 470, count: 6 },
  { slug: 'accra-labadi',          title: 'Accra — Labadi',              seed: 480, count: 5 },
  { slug: 'beirut-hamra',          title: 'Beirut — Hamra',              seed: 490, count: 7 },
];

function demoPhotos(seed, count) {
  return Array.from({ length: count }, (_, i) =>
    `https://picsum.photos/seed/${seed + i}/800/600`
  );
}

export async function getSessions() {
  try {
    const dir = join(process.cwd(), 'public', 'photos');
    const entries = await readdir(dir, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory());

    if (!folders.length) return demoCoverList();

    const sessions = await Promise.all(folders.map(async folder => {
      const slug = folder.name;
      const files = await readdir(join(dir, slug));
      const photos = files.filter(f => IMAGE_RE.test(f)).sort();
      if (!photos.length) return null;
      return { slug, title: prettifySlug(slug), cover: `/photos/${slug}/${photos[0]}` };
    }));

    const real = sessions.filter(Boolean);
    return real.length ? real : demoCoverList();
  } catch {
    return demoCoverList();
  }
}

export async function getSession(slug) {
  try {
    const dir = join(process.cwd(), 'public', 'photos', slug);
    const files = await readdir(dir);
    const photos = files.filter(f => IMAGE_RE.test(f)).sort();
    if (photos.length) {
      return { slug, title: prettifySlug(slug), photos: photos.map(f => `/photos/${slug}/${f}`) };
    }
  } catch {}

  const demo = DEMO.find(d => d.slug === slug);
  if (demo) {
    return { slug: demo.slug, title: demo.title, photos: demoPhotos(demo.seed, demo.count) };
  }
  return null;
}

function demoCoverList() {
  return DEMO.map(d => ({
    slug: d.slug,
    title: d.title,
    cover: `https://picsum.photos/seed/${d.seed}/600/400`,
  }));
}

function prettifySlug(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
