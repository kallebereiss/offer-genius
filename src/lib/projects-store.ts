import { useCallback, useEffect, useState } from "react";
import type { Brief, GeneratedOffer, OfferProject } from "./offer-schema";
import {
  createOfferRow,
  deleteOfferRow,
  duplicateOfferRow,
  listOffers,
  updateOfferRow,
  updateProjectRow,
} from "./offers-db.functions";

let cache: OfferProject[] = [];
let cacheLoaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

async function ensureLoaded() {
  if (cacheLoaded) return;
  if (!loadPromise) {
    loadPromise = listOffers()
      .then((projects) => {
        cache = projects;
        cacheLoaded = true;
        notify();
      })
      .catch(() => {
        cacheLoaded = true;
        notify();
      });
  }
  await loadPromise;
}

export async function createProject(brief: Brief, offer: GeneratedOffer): Promise<OfferProject> {
  const project: OfferProject = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    favorite: false,
    archived: false,
    brief,
    offer,
  };
  await createOfferRow({ data: { id: project.id, brief, offer } });
  cache = [project, ...cache];
  notify();
  return project;
}

export function updateProject(id: string, patch: Partial<OfferProject>) {
  cache = cache.map((p) => (p.id === id ? { ...p, ...patch } : p));
  notify();
  const { favorite, archived } = patch;
  void updateProjectRow({ data: { id, patch: { favorite, archived } } });
}

export function updateOffer(id: string, patch: Partial<GeneratedOffer>) {
  let merged: GeneratedOffer | undefined;
  cache = cache.map((p) => {
    if (p.id !== id) return p;
    merged = { ...p.offer, ...patch };
    return { ...p, offer: merged };
  });
  notify();
  if (merged) void updateOfferRow({ data: { id, offer: merged } });
}

export function deleteProject(id: string) {
  cache = cache.filter((p) => p.id !== id);
  notify();
  void deleteOfferRow({ data: { id } });
}

export function duplicateProject(id: string) {
  const source = cache.find((p) => p.id === id);
  if (!source) return;
  const newId = crypto.randomUUID();
  const duplicated: OfferProject = {
    ...source,
    id: newId,
    createdAt: new Date().toISOString(),
    offer: { ...source.offer, productName: `${source.offer.productName} (cópia)` },
  };
  cache = [duplicated, ...cache];
  notify();
  void duplicateOfferRow({ data: { sourceId: id, newId } });
}

export function useProjects() {
  const [projects, setProjects] = useState<OfferProject[]>(cache);

  useEffect(() => {
    const sync = () => setProjects(cache);
    sync();
    listeners.add(sync);
    void ensureLoaded();
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return projects;
}

export function useProject(id: string) {
  const projects = useProjects();
  return projects.find((p) => p.id === id);
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(cacheLoaded);

  useEffect(() => {
    if (cacheLoaded) {
      setHydrated(true);
      return;
    }
    const sync = () => setHydrated(cacheLoaded);
    listeners.add(sync);
    void ensureLoaded();
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return hydrated;
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("lowticket-ai.theme");
    const next = stored === "dark" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem("lowticket-ai.theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return { theme, toggle };
}
