import { getDb } from "./index";
import { cloudflareContext } from "../context";

export function getDatabase(context?: any) {
  if (context) {
    if (typeof context.get === "function") {
      try {
        const cf = context.get(cloudflareContext);
        if (cf?.env?.DB) {
          return getDb(cf.env.DB);
        }
      } catch {}
    }
    if (context.cloudflare?.env?.DB) {
      return getDb(context.cloudflare.env.DB);
    }
    if (context.env?.DB) {
      return getDb(context.env.DB);
    }
  }

  const g = globalThis as any;
  if (g.DB) {
    return getDb(g.DB);
  }
  if (g.__env?.DB) {
    return getDb(g.__env.DB);
  }
  if (g.cloudflare?.env?.DB) {
    return getDb(g.cloudflare.env.DB);
  }

  return null;
}
