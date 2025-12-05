import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const { prompt, name, personality, backstory } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const falKey = process.env.FAL_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!falKey && !openaiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image generation not available. Please configure FAL_KEY or OPENAI_API_KEY.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build enhanced prompt with context
    let enhancedPrompt = prompt;
    if (name || personality || backstory) {
      const contextParts: string[] = [];
      if (name) contextParts.push(name);
      if (personality) contextParts.push(personality.slice(0, 100));
      enhancedPrompt = `${prompt}. ${contextParts.join('. ')}`;
    }

    const finalPrompt = `Professional portrait photo of ${name || 'a person'}. ${enhancedPrompt}. High quality, natural lighting, friendly expression, realistic photographic style.`;

    // Use Fal if available (preferred - faster and better quality with streaming)
    if (falKey) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const { fal } = await import('@fal-ai/client');
            
            console.log('Using Fal.stream() for real-time image generation');
            
            fal.config({ credentials: falKey });

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', message: 'Starting generation...' })}\n\n`));

            const falStream = await fal.stream('fal-ai/flux/krea', {
              input: {
                prompt: finalPrompt,
                image_size: 'square',
                num_inference_steps: 28,
                guidance_scale: 3.5,
              },
            });

            for await (const event of falStream) {
              if (event.images?.[0]?.url) {
                const intermediateUrl = event.images[0].url;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'image', imageUrl: intermediateUrl })}\n\n`));
              }
            }

            const result = await falStream.done();
            const imageUrl = result.images?.[0]?.url;

            if (!imageUrl) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'No image URL in response' })}\n\n`));
              controller.close();
              return;
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', imageUrl })}\n\n`));
            controller.close();
          } catch (error) {
            console.error('Fal streaming error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Generation failed';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Fallback to OpenAI DALL-E (non-streaming)
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: finalPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: 'Unknown error' };
      }
      console.error('DALL-E API error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate photo' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'No image generated' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, imageUrl }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating photo:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to generate photo' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

