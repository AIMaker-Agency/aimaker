import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});

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
  id?: string;
  name?: string;
}

class Message {
  private role: string;
  private content: Array<MessageData> | string;

  constructor(role: string, content: Array<MessageData> | string) {
    this.role = role;
    this.content = content;
  }

  addImage(imageUrl: string, detail?: string) {
    if (this.content instanceof Array) {
      this.content.push(
        new MessageData({
          type: "image_url",
          image_url: detail
            ? { detail: detail, url: imageUrl }
            : { url: imageUrl },
        })
      );
    }
  }

  addText(text: string) {
    if (this.content instanceof Array) {
      this.content.push(
        new MessageData({
          type: "text",
          text: text,
        })
      );
    }
  }

  getContent(): Array<MessageData> | string {
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
  name: string | undefined;
  id: string | undefined;

  constructor({
    context,
    messages = [],
    isVisionEnable = false,
    maxTokens = 1024,
    model,
    name = "Assistant:",
    id = "Default",
  }: GPTCompletition) {
    this.context = context;
    this.model = model;
    if (model === "gpt-4-vision-preview") {
      this.isVisionEnable = isVisionEnable;
    }
    this.messages = messages;
    this.maxTokens = maxTokens;
    this.id = id;
    this.name = name;
  }

  addMessage(message: {
    role: string;
    type: string;
    content: string;
    images?: Array<{ image_url: string; details?: string }>;
  }) {
    var messageAux: Message = new Message(message.role, []);
    messageAux.addText(message.content);

    if (message.type == "image") {
      message.images?.forEach((image) => {
        messageAux.addImage(image.image_url, image.details);
      });
    }

    this.messages?.push(messageAux);
    console.log(this.messages);
  }

  getMessages() {
    return this.messages;
  }

  generatePrompt(): string {
    var prompt: string = "";

    prompt += `
    "model": "${this.model}",
    "messages": [
      ${
        this.context
          ? `{"role": "system", "content": [{"type": "text, "text": "${this.context}"}]},`
          : ""
      }
    `;
    if (this.messages && this.messages.length > 0) {
      this.messages.forEach((message) => {
        var content = message.getContent();
        prompt += `{"role": "${message.getRole()}", "content": `;
        if (content instanceof Array) {
          prompt += "[";
          content.forEach((content) => {
            prompt += `{
              "type": "${content.type}",
              ${
                content.type == "text"
                  ? `"text": "${content.text}"`
                  : `"image_url": { "url": "${content.image_url!.url}"${
                      content.image_url!.detail
                        ? `, "detail": "${content.image_url!.detail}"`
                        : ""
                    }}`
              }
            },`;
          });
          prompt += "]";
        } else {
          prompt += content;
        }
        prompt += "}";
      });
    }
    prompt += "]";

    return prompt;
  }

  async sendPrompt() {
    const messagesCompletion: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      [];
    this.messages?.forEach((message, index) => {
      const messageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] =
        [];
      const content = message.getContent();
      if (content instanceof Array) {
        content.forEach((contentPart, index) => {
          if (contentPart.type === "text") {
            messageContent.push({ type: "text", text: contentPart.text! });
          } else {
            messageContent.push({
              type: "image_url",
              image_url: { url: contentPart.image_url!.url },
            });
          }
        });
      } else {
        messageContent.push({ type: "text", text: content });
      }
      messagesCompletion.push({ role: "user", content: messageContent });
    });

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: messagesCompletion,
        max_tokens: this.maxTokens,
      });
      return { status: 200, response: response };
    } catch (error) {
      return { status: 400, error: error };
    }
  }
}

class Choice {
  index: number;
  message: Message;
  finish_reason: string;

  constructor(index: number, message: Message, finish_reason: string) {
    this.index = index;
    this.message = message;
    this.finish_reason = finish_reason;
  }
}

class Usage {
  prompt_tokens: number;
  completition_tokens: number;
  total_tokens: number;

  constructor(
    prompt_tokens: number,
    completion_tokens: number,
    total_tokens: number
  ) {
    this.prompt_tokens = prompt_tokens;
    this.completition_tokens = completion_tokens;
    this.total_tokens = total_tokens;
  }
}
class GPTCompletitionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  system_fingerprint: string;
  choices: Array<Choice>;
  usage: Usage;

  constructor(
    id: string,
    object: string,
    created: number,
    model: string,
    system_fingerprint: string,
    choices: Array<Choice>,
    usage: Usage
  ) {
    this.id = id;
    this.object = object;
    this.created = created;
    this.model = model;
    this.system_fingerprint = system_fingerprint;
    this.choices = choices;
    this.usage = usage;
  }
}
