import type { LineWebhookEvent } from "@/lib/messaging/types";

export type LineWebhookHandler = (event: LineWebhookEvent) => Promise<void>;

const handlers = new Map<string, LineWebhookHandler>();

/** Register a handler for a webhook event type (extension point). */
export function registerLineWebhookHandler(
  eventType: string,
  handler: LineWebhookHandler,
): void {
  handlers.set(eventType, handler);
}

/** Dispatch an inbound event to a registered handler (extension point). */
export async function dispatchLineWebhookEvent(event: LineWebhookEvent): Promise<void> {
  const handler = handlers.get(event.type);
  if (!handler) {
    return;
  }
  await handler(event);
}
