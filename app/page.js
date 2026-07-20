'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

function sr(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const GAP = 14; // minimum pixel gap between photos

function buildLayout(n, vw, vh) {
  const cw = vw * 1.6;
  const ch = vh * 1.6;

  const cols = Math.max(1, Math.ceil(Math.sqrt(n * (cw / ch))));
  const rows = Math.ceil(n / cols);
  const cellW = cw / cols;
  const cellH = ch / rows;

  // Initial zone-based placement with jitter
  const photos = Array.from({ length: n }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx  = (col + 0.5) * cellW;
    const cy  = (row + 0.5) * cellH;
    const jx  = (sr(i * 5)     - 0.5) * cellW * 0.76;
    const jy  = (sr(i * 5 + 1) - 0.5) * cellH * 0.76;

    const cls = sr(i * 11 + 9);
    const w   = cls < 0.35
      ? 130 + sr(i * 7 + 2) * 60
      : cls < 0.78
      ? 200 + sr(i * 7 + 2) * 80
      : 290 + sr(i * 7 + 2) * 90;
    const h   = w * (0.66 + sr(i * 7 + 3) * 0.22);

    const x = Math.max(GAP, Math.min(cw - w - GAP, cx + jx - w / 2));
    const y = Math.max(GAP, Math.min(ch - h - GAP, cy + jy - h / 2));
    return { x, y, w, h, z: Math.floor(sr(i * 13 + 6) * 40) };
  });

  // Iteratively push overlapping pairs apart until none remain
  for (let iter = 0; iter < 120; iter++) {
    let moved = false;
    for (let i = 0; i < photos.length; i++) {
      for (let j = i + 1; j < photos.length; j++) {
        const a = photos[i], b = photos[j];
        // Overlap depths on each axis (positive = overlapping by that many px)
        const rx = a.x + a.w + GAP - b.x;
        const lx = b.x + b.w + GAP - a.x;
        const dn = a.y + a.h + GAP - b.y;
        const up = b.y + b.h + GAP - a.y;
        if (rx <= 0 || lx <= 0 || dn <= 0 || up <= 0) continue;
        moved = true;
        const ox = Math.min(rx, lx);
        const oy = Math.min(dn, up);
        if (ox < oy) {
          const s = ox / 2 + 0.5;
          if (a.x + a.w / 2 < b.x + b.w / 2) { a.x -= s; b.x += s; }
          else                                  { a.x += s; b.x -= s; }
        } else {
          const s = oy / 2 + 0.5;
          if (a.y + a.h / 2 < b.y + b.h / 2) { a.y -= s; b.y += s; }
          else                                  { a.y += s; b.y -= s; }
        }
        a.x = Math.max(GAP, Math.min(cw - a.w - GAP, a.x));
        a.y = Math.max(GAP, Math.min(ch - a.h - GAP, a.y));
        b.x = Math.max(GAP, Math.min(cw - b.w - GAP, b.x));
        b.y = Math.max(GAP, Math.min(ch - b.h - GAP, b.y));
      }
    }
    if (!moved) break;
  }

  return { photos, cw, ch };
}

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [layout,   setLayout]   = useState([]);
  const [cSize,    setCSize]    = useState({ w: 0, h: 0 });
  const [off,      setOff]      = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const cRef    = useRef({ w: 0, h: 0 });
  const offRef  = useRef({ x: 0, y: 0 });
  const isDown  = useRef(false);
  const startP  = useRef({ x: 0, y: 0 });
  const velRef  = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const rafRef  = useRef(null);

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(setSessions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sessions.length) return;
    function compute() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const { photos, cw, ch } = buildLayout(sessions.length, vw, vh);
      cRef.current = { w: cw, h: ch };
      setCSize({ w: cw, h: ch });
      setLayout(photos);
      // Center the view so photos surround the initial position
      const init = { x: -(cw / 2 - vw / 2), y: -(ch / 2 - vh / 2) };
      offRef.current = init;
      setOff(init);
    }
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [sessions.length]);

  function stopMomentum() {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }

  function startMomentum(vx, vy) {
    stopMomentum();
    let velX = vx, velY = vy;
    function tick() {
      velX *= 0.93;
      velY *= 0.93;
      if (Math.abs(velX) < 0.08 && Math.abs(velY) < 0.08) { rafRef.current = null; return; }
      const { w: cw, h: ch } = cRef.current;
      const vw = window.innerWidth, vh = window.innerHeight;
      const nx = Math.max(-(cw - vw), Math.min(0, offRef.current.x + velX));
      const ny = Math.max(-(ch - vh), Math.min(0, offRef.current.y + velY));
      offRef.current = { x: nx, y: ny };
      setOff({ x: nx, y: ny });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    stopMomentum();
    isDown.current  = true;
    didDrag.current = false;
    startP.current  = { x: e.clientX - offRef.current.x, y: e.clientY - offRef.current.y };
    velRef.current  = { x: 0, y: 0 };
    setDragging(true);
  }

  function onPointerMove(e) {
    if (!isDown.current) return;
    const { w: cw, h: ch } = cRef.current;
    const vw = window.innerWidth, vh = window.innerHeight;
    const nx = Math.max(-(cw - vw), Math.min(0, e.clientX - startP.current.x));
    const ny = Math.max(-(ch - vh), Math.min(0, e.clientY - startP.current.y));
    const dx = Math.abs(nx - offRef.current.x) + Math.abs(ny - offRef.current.y);
    if (dx > 3) didDrag.current = true;
    velRef.current = { x: e.movementX, y: e.movementY };
    offRef.current = { x: nx, y: ny };
    setOff({ x: nx, y: ny });
  }

  function onPointerUp() {
    if (!isDown.current) return;
    isDown.current = false;
    setDragging(false);
    startMomentum(velRef.current.x * 5, velRef.current.y * 5);
  }

  return (
    <main
      className={styles.viewport}
      style={{ cursor: dragging ? 'grabbing' : 'default' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className={styles.lava} aria-hidden="true">
        <div className={`${styles.blob} ${styles.b1}`} />
        <div className={`${styles.blob} ${styles.b2}`} />
        <div className={`${styles.blob} ${styles.b3}`} />
        <div className={`${styles.blob} ${styles.b4}`} />
        <div className={`${styles.blob} ${styles.b5}`} />
        <div className={`${styles.blob} ${styles.b6}`} />
      </div>

      <span className={styles.name}>KIVILCIM S. GÜNGÖRÜN</span>

      <div
        className={styles.canvas}
        style={{
          width:     cSize.w || '100%',
          height:    cSize.h || '100%',
          transform: `translate(${off.x}px, ${off.y}px)`,
        }}
      >
        {sessions.map((session, i) => {
          const p = layout[i];
          if (!p) return null;
          return (
            <Link
              key={session.slug}
              href={`/session/${session.slug}`}
              className={styles.photo}
              draggable={false}
              onClick={(e) => { if (didDrag.current) e.preventDefault(); }}
              style={{
                left:   p.x,
                top:    p.y,
                width:  p.w,
                height: p.h,
                zIndex: p.z,
              }}
            >
              <img src={session.cover} alt={session.title} draggable={false} />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
