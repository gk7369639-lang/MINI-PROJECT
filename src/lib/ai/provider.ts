export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
}

export interface LLMResponse {
  text: string;
  provider: string;
  model: string;
  isFallback: boolean;
}

export class AIProviderService {
  private provider: string;
  private apiKey?: string;
  private modelName: string;

  constructor() {
    this.provider = process.env.AI_PROVIDER || "local-fallback";
    this.apiKey = process.env.AI_API_KEY;
    this.modelName = process.env.AI_MODEL_NAME || "gemini-1.5-flash";
  }

  public isAIConfigured(): boolean {
    return Boolean(
      this.apiKey &&
      !this.apiKey.includes("your-") &&
      !this.apiKey.includes("here")
    );
  }

  public async complete(
    messages: LLMMessage[],
    options: LLMCompletionOptions = {}
  ): Promise<LLMResponse> {
    if (!this.isAIConfigured()) {
      return {
        text: "",
        provider: "local-fallback",
        model: "deterministic-nlp-engine",
        isFallback: true,
      };
    }

    try {
      if (this.provider === "gemini") {
        return await this.callGemini(messages, options);
      } else if (this.provider === "openai") {
        return await this.callOpenAI(messages, options);
      } else {
        return {
          text: "",
          provider: "local-fallback",
          model: "deterministic-nlp-engine",
          isFallback: true,
        };
      }
    } catch (err: any) {
      console.warn("[AIProviderService] Remote LLM call failed, engaging fallback engine:", err?.message || err);
      return {
        text: "",
        provider: "local-fallback",
        model: "deterministic-nlp-engine",
        isFallback: true,
      };
    }
  }

  private async callGemini(messages: LLMMessage[], options: LLMCompletionOptions): Promise<LLMResponse> {
    const systemPrompt = messages.find((m) => m.role === "system")?.content || "";
    const userPrompt = messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: options.maxTokens ?? 1024,
          responseMimeType: options.responseFormat === "json" ? "application/json" : "text/plain",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      text: candidateText,
      provider: "gemini",
      model: this.modelName,
      isFallback: false,
    };
  }

  private async callOpenAI(messages: LLMMessage[], options: LLMCompletionOptions): Promise<LLMResponse> {
    const endpoint = "https://api.openai.com/v1/chat/completions";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName || "gpt-4o-mini",
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 1024,
        response_format: options.responseFormat === "json" ? { type: "json_object" } : undefined,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";

    return {
      text: content,
      provider: "openai",
      model: this.modelName,
      isFallback: false,
    };
  }
}

export const aiProvider = new AIProviderService();
