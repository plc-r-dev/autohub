/** Domain port for outbound LINE push notifications (infrastructure implements). */
export type LineNotificationPayload = {
  recipientLineUserId: string;
  title: string;
  body: string;
  deepLinkPath?: string;
};

export interface LineNotificationPort {
  send(payload: LineNotificationPayload): Promise<void>;
}

/** Domain port for Flex message builders (infrastructure implements). */
export type FlexMessagePayload = {
  recipientLineUserId: string;
  altText: string;
  contents: unknown;
};

export interface LineFlexMessagePort {
  send(payload: FlexMessagePayload): Promise<void>;
}
