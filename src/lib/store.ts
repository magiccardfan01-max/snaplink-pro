import { promises as fs } from "fs";
import path from "path";

export interface ClickEvent {
  id: string;
  timestamp: number;
  userAgent: string;
  referrer: string;
  ipHash: string;
  country?: string;
}

export interface ShortLink {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: number;
  expiresAt: number | null;
  clicks: ClickEvent[];
  title?: string;
}

const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "links.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

async function readLinks(): Promise<ShortLink[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeLinks(links: ShortLink[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
}

export async function createLink(
  originalUrl: string,
  customSlug?: string,
  expiresInDays?: number
): Promise<ShortLink> {
  const links = await readLinks();
  let slug = customSlug?.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "") || generateSlug();

  // Ensure unique
  while (links.some((l) => l.slug === slug)) {
    slug = generateSlug();
  }

  const now = Date.now();
  const link: ShortLink = {
    id: crypto.randomUUID(),
    slug,
    originalUrl,
    createdAt: now,
    expiresAt: expiresInDays ? now + expiresInDays * 24 * 60 * 60 * 1000 : null,
    clicks: [],
  };

  links.push(link);
  await writeLinks(links);
  return link;
}

export async function getLinkBySlug(slug: string): Promise<ShortLink | null> {
  const links = await readLinks();
  return links.find((l) => l.slug === slug) || null;
}

export async function getAllLinks(): Promise<ShortLink[]> {
  const links = await readLinks();
  return links.sort((a, b) => b.createdAt - a.createdAt);
}

export async function recordClick(
  slug: string,
  userAgent: string,
  referrer: string,
  ip: string
): Promise<ShortLink | null> {
  const links = await readLinks();
  const link = links.find((l) => l.slug === slug);
  if (!link) return null;

  // Check expiry
  if (link.expiresAt && Date.now() > link.expiresAt) {
    return null;
  }

  const click: ClickEvent = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    userAgent,
    referrer: referrer || "direct",
    ipHash: simpleHash(ip),
  };

  link.clicks.push(click);
  await writeLinks(links);
  return link;
}

export async function deleteLink(id: string): Promise<boolean> {
  const links = await readLinks();
  const filtered = links.filter((l) => l.id !== id);
  if (filtered.length === links.length) return false;
  await writeLinks(filtered);
  return true;
}

function generateSlug(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export function getDeviceType(ua: string): string {
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return "Mobile";
  if (/tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

export function getBrowser(ua: string): string {
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  if (/firefox/i.test(ua)) return "Firefox";
  return "Other";
}
