import { useCallback, useEffect, useState } from "react";
import type { Brief, GeneratedOffer, OfferProject } from "./offer-schema";

const KEY = "lowticket-ai.projects.v1";
const listeners = new Set<() => void>();

function read(): OfferProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OfferProject[]) : [];
  } catch {
    return [];
  }
}

function write(projects: OfferProject[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(projects));
  listeners.forEach((listener) => listener());
}

export function createProject(brief: Brief, offer: GeneratedOffer): OfferProject {
  const project: OfferProject = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    favorite: false,
    archived: false,
    brief,
    offer,
  };
  write([project, ...read()]);
  return project;
}

export function updateProject(id: string, patch: Partial<OfferProject>) {
  write(read().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function updateOffer(id: string, patch: Partial<GeneratedOffer>) {
  write(read().map((p) => (p.id === id ? { ...p, offer: { ...p.offer, ...patch } } : p)));
}

export function deleteProject(id: string) {
  write(read().filter((p) => p.id !== id));
}

export function duplicateProject(id: string) {
  const source = read().find((p) => p.id === id);
  if (!source) return;
  write([
    {
      ...source,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      offer: { ...source.offer, productName: `${source.offer.productName} (cópia)` },
    },
    ...read(),
  ]);
}

export function useProjects() {
  const [projects, setProjects] = useState<OfferProject[]>([]);

  useEffect(() => {
    const sync = () => setProjects(read());
    sync();
    listeners.add(sync);
    window.addEventListener("storage", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return projects;
}

export function useProject(id: string) {
  const projects = useProjects();
  return projects.find((p) => p.id === id);
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
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
