import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// This API route will generate our story
export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    console.log('📚 Generating story for prompt:', prompt);

    const result = await generateText({
      model: openai('gpt-4o-mini'), // Fast and cost-effective model
      messages: [
        {
          role: 'system',
          content: `You are a creative storyteller. Create engaging stories with dialogue and multiple characters.

IMPORTANT RULES:
1. Include 3-4 different characters with names
2. Use clear dialogue format: Character: "dialogue text"
3. Include a narrator voice for descriptions
4. Keep stories 200-400 words
5. Make it suitable for audio (descriptive but not too long)
6. End with a satisfying conclusion

Format your response exactly like this:
CHARACTERS: Character1, Character2, Character3, Narrator

STORY:
[Your story here with clear character dialogue]`
        },
        {
          role: 'user',
          content: `Create a story about: ${prompt}`
        }
      ],
    });

    // Parse the response to extract characters and story
    const content = result.text;
    const charactersMatch = content.match(/CHARACTERS: (.+)/);
    const storyMatch = content.match(/STORY:\s*([\s\S]+)/);

    if (!charactersMatch || !storyMatch) {
      throw new Error('Failed to parse story format');
    }

    const characters = charactersMatch[1].split(', ').map(char => char.trim());
    const story = storyMatch[1].trim();

    console.log('✅ Story generated successfully');
    console.log('👥 Characters:', characters);

    return Response.json({
      story,
      characters,
      wordCount: story.split(' ').length
    });

  } catch (error) {
    console.error('❌ Error generating story:', error);
    
    return Response.json(
      { 
        error: 'Failed to generate story',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
