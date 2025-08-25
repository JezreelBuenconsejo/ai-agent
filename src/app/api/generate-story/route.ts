import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

// This API route will generate our story
export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    console.log("📚 Generating story for prompt:", prompt);

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY not found in environment variables");
      return Response.json(
        {
          error:
            "Groq API key not configured. Please add GROQ_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    console.log("🔑 Groq API key found, attempting story generation...");

    const result = await generateText({
      model: groq("llama-3.1-8b-instant"), // Current supported free model
      messages: [
        {
          role: "system",
          content: `You are a creative storyteller. Create engaging stories with dialogue and multiple characters for voice generation.

CRITICAL FORMATTING RULES:
1. Include 3-4 different characters with SHORT, CLEAR names (e.g., "Max", "Luna", "Dr. Smith")
2. Use EXACT dialogue format: CharacterName: "exact dialogue text"
3. Include narrator descriptions on separate lines
4. Each character should speak at least 2-3 times
5. Keep each line under 50 words for voice generation
6. Use lots of dialogue, minimal narration

EXAMPLE FORMAT:
CHARACTERS: Max, Luna, Dr. Smith, Narrator

STORY:
Narrator: The laboratory was dark and quiet.
Max: "Did you hear that strange noise?"
Luna: "Yes, it came from the basement."
Dr. Smith: "We should investigate immediately."
Narrator: They walked carefully down the stairs.
Max: "Look at this mysterious device!"

Format your response exactly like this with clear character dialogue.`,
        },
        {
          role: "user",
          content: `Create a story about: ${prompt}`,
        },
      ],
    });

    // Parse the response to extract characters and story
    const content = result.text;
    const charactersMatch = content.match(/CHARACTERS: (.+)/);
    const storyMatch = content.match(/STORY:\s*([\s\S]+)/);

    if (!charactersMatch || !storyMatch) {
      throw new Error("Failed to parse story format");
    }

    const characters = charactersMatch[1]
      .split(", ")
      .map((char) => char.trim());
    const story = storyMatch[1].trim();

    console.log("✅ Story generated successfully");
    console.log("👥 Characters:", characters);

    return Response.json({
      story,
      characters,
      wordCount: story.split(" ").length,
    });
  } catch (error) {
    console.error("❌ Error generating story:", error);

    // If Groq fails, try with a fallback model
    if (
      error instanceof Error &&
      (error.message.includes("Internal Server Error") ||
        error.message.includes("decommissioned") ||
        error.message.includes("model_decommissioned"))
    ) {
      console.log("⚠️ Groq model error, trying fallback model...");

      try {
        const fallbackResult = await generateText({
          model: groq("llama3-8b-8192"), // Different fallback model
          messages: [
            {
              role: "system",
              content: `You are a creative storyteller. Create engaging stories with dialogue and multiple characters for voice generation.

CRITICAL FORMATTING RULES:
1. Include 3-4 different characters with SHORT, CLEAR names (e.g., "Max", "Luna", "Dr. Smith")
2. Use EXACT dialogue format: CharacterName: "exact dialogue text"
3. Include narrator descriptions on separate lines
4. Each character should speak at least 2-3 times
5. Keep each line under 50 words for voice generation
6. Use lots of dialogue, minimal narration

EXAMPLE FORMAT:
CHARACTERS: Max, Luna, Dr. Smith, Narrator

STORY:
Narrator: The laboratory was dark and quiet.
Max: "Did you hear that strange noise?"
Luna: "Yes, it came from the basement."
Dr. Smith: "We should investigate immediately."
Narrator: They walked carefully down the stairs.
Max: "Look at this mysterious device!"

Format your response exactly like this with clear character dialogue.`,
            },
            {
              role: "user",
              content: `Create a story about: ${prompt}`,
            },
          ],
        });

        // Parse the fallback response
        const content = fallbackResult.text;
        const charactersMatch = content.match(/CHARACTERS: (.+)/);
        const storyMatch = content.match(/STORY:\s*([\s\S]+)/);

        if (!charactersMatch || !storyMatch) {
          throw new Error("Failed to parse story format from fallback");
        }

        const characters = charactersMatch[1]
          .split(", ")
          .map((char) => char.trim());
        const story = storyMatch[1].trim();

        console.log("✅ Fallback story generated successfully");
        console.log("👥 Characters:", characters);

        return Response.json({
          story,
          characters,
          wordCount: story.split(" ").length,
          model: "llama-3.1-8b-instant (fallback)",
        });
      } catch (fallbackError) {
        console.error("❌ Fallback model also failed:", fallbackError);

        // Return a mock story if both models fail
        return Response.json({
          story: `Narrator: Detective Smith entered the room.\nDetective Smith: "What happened here?"\nWitness: "I heard a loud noise at midnight."\nDetective Smith: "Can you describe it?"\nWitness: "It sounded like breaking glass."\nNarrator: The detective took careful notes.\nDetective Smith: "Thank you for your help."`,
          characters: ["Detective Smith", "Witness", "Narrator"],
          wordCount: 45,
          model: "fallback-demo",
        });
      }
    }

    return Response.json(
      {
        error: "Failed to generate story",
        message: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Please check your Groq API key in .env.local file",
      },
      { status: 500 }
    );
  }
}
