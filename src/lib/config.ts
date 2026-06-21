/**
 * Runtime configuration — read exclusively from the environment (.env.local).
 * Nothing here is hard-coded; see .env.local.example for the full list of keys.
 * Helpers throw a clear error (at call time, not import time) when a key is missing,
 * so misconfiguration fails loudly instead of silently using a baked-in default.
 */

export function env(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required env var: ${name} (see .env.local.example)`);
  }
  return value;
}

export function envNum(name: string): number {
  const n = Number(env(name));
  if (Number.isNaN(n)) {
    throw new Error(`Env var ${name} must be a number (see .env.local.example)`);
  }
  return n;
}
