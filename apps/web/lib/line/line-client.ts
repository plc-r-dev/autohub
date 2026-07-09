type PushMessagePayload = {
  to: string;
  messages: Array<Record<string, unknown>>;
};

export type LineApiResult = {
  ok: boolean;
  status: number;
  body: string;
};

class LineClient {
  private readonly accessToken: string | undefined;

  constructor() {
    this.accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.LINE_CHANNEL_ACCESS_TOKEN &&
        process.env.LINE_CHANNEL_SECRET &&
        process.env.LINE_CHANNEL_ID,
    );
  }

  async pushMessage(payload: PushMessagePayload): Promise<LineApiResult> {
    if (!this.accessToken) {
      return {
        ok: false,
        status: 0,
        body: "LINE channel access token is not configured.",
      };
    }

    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const body = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      body,
    };
  }
}

let singleton: LineClient | null = null;

export function getLineClient(): LineClient {
  if (!singleton) {
    singleton = new LineClient();
  }
  return singleton;
}
