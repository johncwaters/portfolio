/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  posthog?: { capture: (eventName: string, properties?: Record<string, unknown>) => void };
}
