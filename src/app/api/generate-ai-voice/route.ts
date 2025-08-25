import { NextRequest } from 'next/server';

// ElevenLabs API integration for FREE high-quality voice generation
export async function POST(req: NextRequest) {
  try {
    const { text, character, voiceId } = await req.json();

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    if (!ELEVENLABS_API_KEY) {
      return Response.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    console.log(`🎙️ Generating AI voice for ${character}: "${text.substring(0, 50)}..."`);

    // ElevenLabs voice generation API call
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1', // Free model
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ElevenLabs API error:', errorData);
      
      if (response.status === 401) {
        return Response.json(
          { error: 'Invalid ElevenLabs API key' },
          { status: 401 }
        );
      }
      
      if (response.status === 429) {
        return Response.json(
          { error: 'ElevenLabs quota exceeded. Try again later or upgrade plan.' },
          { status: 429 }
        );
      }
      
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get the audio data as arrayBuffer
    const audioBuffer = await response.arrayBuffer();
    
    console.log(`✅ Generated ${audioBuffer.byteLength} bytes of audio for ${character}`);

    // Return audio data as base64 for frontend handling
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return Response.json({
      success: true,
      character,
      audioData: base64Audio,
      audioSize: audioBuffer.byteLength,
      format: 'mp3'
    });

  } catch (error) {
    console.error('❌ AI voice generation error:', error);
    
    return Response.json(
      { 
        error: 'Failed to generate AI voice',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
