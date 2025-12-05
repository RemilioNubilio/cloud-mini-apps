import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai-provider';

export async function POST(req: NextRequest) {
  try {
    const { fieldName, currentValue, context } = await req.json();

    if (!fieldName) {
      return NextResponse.json(
        { success: false, error: 'Field name required' },
        { status: 400 }
      );
    }

    let provider: ReturnType<typeof getAIProvider>;
    try {
      provider = getAIProvider();
    } catch (error) {
      console.error('AI provider configuration error:', error);
      const hasGroq = !!process.env.GROQ_API_KEY;
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      
      if (!hasGroq && !hasOpenAI) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'AI service not configured. Please set GROQ_API_KEY or OPENAI_API_KEY environment variable.' 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'AI service configuration error. Please check your API keys.' },
        { status: 500 }
      );
    }

    const prompt = buildPromptForField(fieldName, currentValue, context);

    const systemPrompt = fieldName === 'name' 
      ? 'You are a helpful assistant that generates realistic, natural character descriptions and dialogue. Be concise and authentic.'
      : `You are a helpful assistant that generates realistic, natural character descriptions and dialogue. Be concise and authentic.

IMPORTANT: You are working with a SINGLE character. The character's name may have changed from previous context, but it's still the SAME person. If the name in the current context differs from previous descriptions, USE THE NEW NAME and rewrite/adapt the content for that character as if that was always their name. Maintain consistency with their personality, appearance, and traits, just update any name references.`;

    const response = await fetch(provider.chatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.chatModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`${provider.name} API error:`, errorData);
      return NextResponse.json(
        { success: false, error: 'Failed to generate field' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedValue = data.choices[0]?.message?.content?.trim() || '';

    const cleanedValue = generatedValue.replace(/^["']|["']$/g, '');

    return NextResponse.json({
      success: true,
      value: cleanedValue,
    });
  } catch (error) {
    console.error('Error generating field:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate field' },
      { status: 500 }
    );
  }
}

function buildPromptForField(
  fieldName: string,
  currentValue: string | undefined,
  context: Record<string, string | undefined>
): string {
  const hasContext = Object.values(context).some((v) => v && v.length > 0);
  const hasCurrentValue = currentValue && currentValue.length > 0;

  let contextSummary = '';
  if (context.name) contextSummary += `Name: ${context.name}\n`;
  if (context.personality) contextSummary += `Personality: ${context.personality}\n`;
  if (context.backstory) contextSummary += `Backstory: ${context.backstory}\n`;

  switch (fieldName) {
    case 'name':
      if (hasCurrentValue) {
        return `Suggest a better or alternative name${hasContext ? ` based on:\n${contextSummary}` : ''}. Just return the name, nothing else.`;
      }
      return `Generate a realistic first name${hasContext ? ` based on:\n${contextSummary}` : ''}. Just return the name, nothing else.`;

    case 'personality':
      if (hasCurrentValue) {
        return `Complete or enhance this personality description:\n"${currentValue}"\n${
          contextSummary ? `\nContext:\n${contextSummary}` : ''
        }\nProvide a natural, complete description (2-3 sentences). Just return the enhanced text, no quotes or explanations.`;
      }
      return `Write a brief, natural personality description (2-3 sentences)${hasContext ? ` based on:\n${contextSummary}` : ''}. Be warm and descriptive. Just return the description, no quotes or explanations.`;

    case 'backstory':
      if (hasCurrentValue) {
        return `Complete or enhance this backstory:\n"${currentValue}"\n${
          contextSummary ? `\nContext:\n${contextSummary}` : ''
        }\nWrite from the user's perspective about meeting ${context.name || 'this person'}. Just return the enhanced text, no quotes or explanations.`;
      }
      return `Write a brief, natural story (2-3 sentences) about how THE USER met ${context.name || 'a person'}${
        context.personality ? `. ${context.name || 'They'} is described as: ${context.personality}` : ''
      }. Write from the user's perspective. Make it realistic and relatable. Just return the story, no quotes or explanations.`;

    default:
      return `Generate a value for ${fieldName}${hasContext ? ` using this context:\n${contextSummary}` : ''}.`;
  }
}

