// Enhanced voice generation with FREE AI voices (ElevenLabs)

export interface AIVoiceConfig {
  character: string;
  voiceId: string;
  voiceName: string;
  description: string;
}

export interface AIAudioSegment {
  character: string;
  text: string;
  audioData: string; // base64 encoded MP3
  audioUrl: string;  // blob URL for playback
  format: 'mp3';
}

// ElevenLabs FREE voices (these are available on free tier)
export const ELEVENLABS_FREE_VOICES: AIVoiceConfig[] = [
  {
    character: 'Narrator',
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - clear, professional
    voiceName: 'Adam',
    description: 'Professional narrator voice'
  },
  {
    character: 'Hero',
    voiceId: 'ErXwobaYiN019PkySvjV', // Antoni - warm, confident
    voiceName: 'Antoni', 
    description: 'Confident hero voice'
  },
  {
    character: 'Villain',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - deep, dramatic
    voiceName: 'Arnold',
    description: 'Deep, menacing voice'
  },
  {
    character: 'Child',
    voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte - bright, young
    voiceName: 'Charlotte',
    description: 'Young, energetic voice'
  },
  {
    character: 'Elder',
    voiceId: 'IKne3meq5aSn9XLyUdCD', // Charlie - wise, older
    voiceName: 'Charlie',
    description: 'Wise, elderly voice'
  }
];

export class AIVoiceGenerator {
  private audioSegments: AIAudioSegment[] = [];
  private isGenerating: boolean = false;

  // Generate AI voice for a single text segment
  async generateAIVoice(text: string, character: string): Promise<AIAudioSegment> {
    // Find appropriate voice for character
    const voiceConfig = this.getVoiceForCharacter(character);
    
    console.log(`🎙️ Generating AI voice for ${character} using ${voiceConfig.voiceName}`);

    try {
      const response = await fetch('/api/generate-ai-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          character: character,
          voiceId: voiceConfig.voiceId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI voice generation failed');
      }

      const data = await response.json();
      
      // Convert base64 to blob for playback
      const audioData = data.audioData;
      const binaryData = atob(audioData);
      const audioBytes = new Uint8Array(binaryData.length);
      
      for (let i = 0; i < binaryData.length; i++) {
        audioBytes[i] = binaryData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audioSegment: AIAudioSegment = {
        character,
        text,
        audioData,
        audioUrl,
        format: 'mp3'
      };

      console.log(`✅ AI voice generated for ${character} (${data.audioSize} bytes)`);
      return audioSegment;

    } catch (error) {
      console.error(`❌ Failed to generate AI voice for ${character}:`, error);
      throw error;
    }
  }

  // Generate AI voices for complete audiobook
  async generateAIAudiobook(
    storySegments: Array<{character: string, text: string}>,
    onProgress?: (current: number, total: number) => void
  ): Promise<{
    segments: AIAudioSegment[];
    combinedMp3: string; // base64 encoded combined MP3
  }> {
    this.isGenerating = true;
    this.audioSegments = [];

    console.log(`🎬 Starting AI audiobook generation for ${storySegments.length} segments`);

    try {
      // Generate each segment
      for (let i = 0; i < storySegments.length; i++) {
        const segment = storySegments[i];
        onProgress?.(i + 1, storySegments.length);

        const audioSegment = await this.generateAIVoice(segment.text, segment.character);
        this.audioSegments.push(audioSegment);

        // Small delay to respect rate limits
        if (i < storySegments.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log('🎉 AI audiobook generation complete!');
      return {
        segments: this.audioSegments,
        combinedMp3: '' // Not used - real combination happens in downloadAudiobook()
      };

    } catch (error) {
      console.error('❌ AI audiobook generation failed:', error);
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  // Get appropriate voice for character
  private getVoiceForCharacter(character: string): AIVoiceConfig {
    const lowerChar = character.toLowerCase();
    
    // Try to match character type
    if (lowerChar === 'narrator') return ELEVENLABS_FREE_VOICES[0];
    if (lowerChar.includes('hero') || lowerChar.includes('detective') || lowerChar.includes('protagonist')) {
      return ELEVENLABS_FREE_VOICES[1];
    }
    if (lowerChar.includes('villain') || lowerChar.includes('antagonist') || lowerChar.includes('bad')) {
      return ELEVENLABS_FREE_VOICES[2];
    }
    if (lowerChar.includes('child') || lowerChar.includes('kid') || lowerChar.includes('young')) {
      return ELEVENLABS_FREE_VOICES[3];
    }
    if (lowerChar.includes('elder') || lowerChar.includes('old') || lowerChar.includes('wise')) {
      return ELEVENLABS_FREE_VOICES[4];
    }

    // Hash the character name for consistent assignment
    let hash = 0;
    for (let i = 0; i < character.length; i++) {
      const char = character.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return ELEVENLABS_FREE_VOICES[Math.abs(hash) % ELEVENLABS_FREE_VOICES.length];
  }

  // This function was unused - removed the call above
  // Real audio combination happens in downloadAudiobook()

  // Play sequential AI audiobook
  async playAIAudiobook(segments: AIAudioSegment[]): Promise<void> {
    return new Promise((resolve) => {
      let currentIndex = 0;
      
      const playNext = () => {
        if (currentIndex >= segments.length) {
          resolve();
          return;
        }
        
        const segment = segments[currentIndex];
        const audio = new Audio(segment.audioUrl);
        
        audio.onended = () => {
          currentIndex++;
          // Small pause between segments
          setTimeout(playNext, 500);
        };
        
        audio.onerror = () => {
          console.error(`Audio playback error for segment ${currentIndex}`);
          currentIndex++;
          setTimeout(playNext, 100);
        };
        
        console.log(`🔊 Playing AI voice ${currentIndex + 1}/${segments.length}: ${segment.character}`);
        audio.play();
      };
      
      playNext();
    });
  }

  // Download complete audiobook (all segments combined)
  downloadAudiobook(segments: AIAudioSegment[], title: string = 'ai-audiobook'): void {
    if (segments.length === 0) return;

    // Combine all audio segments into one MP3
    const allAudioData: Uint8Array[] = [];
    let totalLength = 0;

    // Convert all base64 segments to binary
    for (const segment of segments) {
      const binaryData = atob(segment.audioData);
      const audioBytes = new Uint8Array(binaryData.length);
      
      for (let i = 0; i < binaryData.length; i++) {
        audioBytes[i] = binaryData.charCodeAt(i);
      }
      
      allAudioData.push(audioBytes);
      totalLength += audioBytes.length;
    }

    // Combine all segments
    const combinedAudio = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const audioData of allAudioData) {
      combinedAudio.set(audioData, offset);
      offset += audioData.length;
    }

    // Create and download combined MP3
    const audioBlob = new Blob([combinedAudio], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(audioBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}-complete-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    console.log(`🎵 Complete audiobook downloaded! (${segments.length} segments combined)`);
  }

  // Clean up audio URLs
  cleanup(): void {
    this.audioSegments.forEach(segment => {
      URL.revokeObjectURL(segment.audioUrl);
    });
    this.audioSegments = [];
  }

  isGeneratingAudio(): boolean {
    return this.isGenerating;
  }
}
