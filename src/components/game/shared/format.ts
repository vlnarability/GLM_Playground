"use client";

import { RESOURCES, RESOURCE_MAP } from "@/game/data/resources";

export function formatNumber(n: number, digits = 1): string {
  if (n === undefined || n === null || isNaN(n)) return "0";
  const abs = Math.abs(n);
  if (abs < 1) return n.toFixed(digits);
  if (abs < 1000) return n.toFixed(abs < 10 ? digits : 0);
  if (abs < 1e6) return (n / 1e3).toFixed(digits) + "K";
  if (abs < 1e9) return (n / 1e6).toFixed(digits) + "M";
  if (abs < 1e12) return (n / 1e9).toFixed(digits) + "B";
  if (abs < 1e15) return (n / 1e12).toFixed(digits) + "T";
  return n.toExponential(2);
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h < 24) return `${h}h ${mm}m`;
  const d = Math.floor(h / 24);
  const hh = h % 24;
  return `${d}d ${hh}h`;
}

export function resourceColor(id: string): string {
  return RESOURCE_MAP[id]?.color || "#cbd5e1";
}

export function resourceIcon(id: string): string {
  return RESOURCE_MAP[id]?.icon || "❓";
}

export function resourceName(id: string): string {
  return RESOURCE_MAP[id]?.name || id;
}
