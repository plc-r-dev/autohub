/**
 * Extension point for outbound Flex messages triggered from chat flows.
 * DO NOT implement Flex Message API here.
 */
export type FlexMessageTemplate =
  | "serviceStore_card"
  | "booking_confirmation"
  | "nearby_shops"
  | "booking_reminder";

export type FlexMessageContext = {
  lineUserId: string;
  template: FlexMessageTemplate;
  payload: Record<string, unknown>;
};

export interface LineFlexMessageDispatcher {
  send(context: FlexMessageContext): Promise<void>;
}

export const lineFlexMessageDispatcher: LineFlexMessageDispatcher = {
  async send() {
    throw new Error("LINE_FLEX_DISPATCHER_NOT_IMPLEMENTED");
  },
};
