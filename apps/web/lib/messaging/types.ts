/** Inbound LINE webhook event types (architecture stub — not wired). */
export type LineWebhookEventType =
  | "message"
  | "postback"
  | "follow"
  | "unfollow"
  | "beacon"
  | "accountLink"
  | "things";

export type LineInboundMessage = {
  type: "text" | "location" | "image" | "sticker";
  text?: string;
  latitude?: number;
  longitude?: number;
};

export type LineWebhookEvent = {
  type: LineWebhookEventType;
  lineUserId: string;
  replyToken?: string;
  message?: LineInboundMessage;
  postbackData?: string;
  timestamp: number;
};
