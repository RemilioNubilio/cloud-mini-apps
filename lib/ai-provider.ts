// AI Provider utilities to switch between OpenAI and Groq

export interface AIProvider {
  name: 'openai' | 'groq';
  apiKey: string;
  chatEndpoint: string;
  imageEndpoint?: string;
  visionModel: string;
  chatModel: string;
  imageModel?: string;
}

export function getAIProvider(): AIProvider {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Prefer Groq if available
  if (groqKey) {
    return {
      name: 'groq',
      apiKey: groqKey,
      chatEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
      visionModel: 'llama-3.2-90b-vision-preview',
      chatModel: 'llama-3.3-70b-versatile',
    };
  }

  if (!openaiKey) {
    throw new Error('No AI API key configured (GROQ_API_KEY or OPENAI_API_KEY)');
  }

  return {
    name: 'openai',
    apiKey: openaiKey,
    chatEndpoint: 'https://api.openai.com/v1/chat/completions',
    imageEndpoint: 'https://api.openai.com/v1/images/generations',
    visionModel: 'gpt-4o-mini',
    chatModel: 'gpt-4o-mini',
    imageModel: 'dall-e-3',
  };
}
