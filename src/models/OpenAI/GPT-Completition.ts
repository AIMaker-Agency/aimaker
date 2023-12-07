class MessageData {
  type: string = "text";
  image_url?: { url: string; detail?: string };
  text?: string;

  constructor({ type, image_url, text }: MessageData) {
    this.type = type;
    this.image_url = image_url;
    this.text = text;
  }
}

interface GPTCompletition {
  context?: string;
  model: string;
  isVisionEnable?: boolean;
  messages?: Array<Message>;
  maxTokens: number;
}

class Message {
  private role: string;
  private content: Array<MessageData>;

  constructor(role: string, content: Array<MessageData>) {
    this.role = role;
    this.content = content;
  }

  addImage(imageUrl: string, detail?: string) {
    this.content.push(
      new MessageData({
        type: "image_url",
        image_url: { detail: detail, url: imageUrl },
      })
    );
  }

  getContent(): Array<MessageData> {
    return this.content;
  }

  getRole(): string {
    return this.role;
  }
}

export class GPTChat {
  model: string;
  messages: Message[] | undefined;
  maxTokens: number;
  isVisionEnable: boolean | undefined;
  context: string | undefined;

  constructor({
    context,
    messages = [],
    isVisionEnable = false,
    maxTokens = 1024,
    model,
  }: GPTCompletition) {
    this.context = context;
    this.model = model;
    if (model === "gpt-4-vision-preview") {
      this.isVisionEnable = isVisionEnable;
    }
    this.messages = messages;
    this.maxTokens = maxTokens;
  }

  generatePrompt(): string {
    var prompt: string = "";

    prompt = `
    "model": "${this.model}",
    "messages": [
      ${
        this.context
          ? `{"role": "system", "content": [{"type": "text, "text": "${this.context}"}]},`
          : ""
      }{
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What’s in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": f"data:image/jpeg;base64,{base64_image}"
            }
          }
        ]
      }
    `;

    return prompt;
  }
}
