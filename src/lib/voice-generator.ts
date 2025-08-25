// Voice Generation using Browser Web Speech API
// 100% Free, no API keys needed!

export interface VoiceConfig {
  name: string;
  character: string;
  pitch: number;      // 0.5 to 2.0
  rate: number;       // 0.5 to 2.0  
  volume: number;     // 0.0 to 1.0
  voiceName?: string; // Specific voice if available
}

export interface AudioSegment {
  character: string;
  text: string;
  utterance: SpeechSynthesisUtterance;
  audioUrl: string | null;
  duration: number;
}

// Predefined character voices for different story characters
// Using dramatic differences to ensure distinct voices even with single voice
export const CHARACTER_VOICES: VoiceConfig[] = [
  {
    name: "Narrator",
    character: "Narrator", 
    pitch: 1.0,
    rate: 0.85,
    volume: 1.0,
    voiceName: "Alex" // Neutral narrator voice
  },
  {
    name: "Hero",
    character: "Hero",
    pitch: 1.4,  // Much higher for distinction
    rate: 1.1,   // Faster, confident
    volume: 1.0,
    voiceName: "Daniel" // Confident, higher pitch
  },
  {
    name: "Villain",
    character: "Villain",
    pitch: 0.6,  // Much lower for menacing effect
    rate: 0.7,   // Slower, more deliberate
    volume: 1.0,
    voiceName: "Fred" // Lower, slower voice
  },
  {
    name: "Child",
    character: "Child", 
    pitch: 1.8,  // Very high for child voice
    rate: 1.2,   // Fast, excited
    volume: 1.0,
    voiceName: "Princess" // Higher, faster voice
  },
  {
    name: "Elder", 
    character: "Elder",
    pitch: 0.7,  // Lower, wiser
    rate: 0.6,   // Much slower, thoughtful
    volume: 0.9,
    voiceName: "Ralph" // Older, slower voice
  }
];

export class VoiceGenerator {
  private synthesis: SpeechSynthesis;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
    } else {
      throw new Error('Browser does not support Web Speech API');
    }
  }

  // Load available system voices
  private async loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 10;
      
      const loadVoicesImpl = () => {
        this.availableVoices = this.synthesis.getVoices();
        attempts++;
        
        console.log(`🎙️ Loading voices... attempt ${attempts}, found ${this.availableVoices.length} voices`);
        
        if (this.availableVoices.length > 0) {
          console.log('✅ Available voices:', this.availableVoices.map(v => `${v.name} (${v.lang})`));
          resolve();
        } else if (attempts < maxAttempts) {
          // Some browsers load voices asynchronously
          setTimeout(loadVoicesImpl, 200);
        } else {
          console.warn('⚠️ No voices loaded after maximum attempts');
          resolve(); // Continue anyway
        }
      };

      // Listen for voice loading
      this.synthesis.onvoiceschanged = loadVoicesImpl;
      loadVoicesImpl();
    });
  }

  // Get the best voice for a character
  private getBestVoice(config: VoiceConfig): SpeechSynthesisVoice | null {
    console.log(`🎭 Selecting voice for ${config.character}...`);
    
    // Get English voices first
    const englishVoices = this.availableVoices.filter(voice => 
      voice.lang.startsWith('en')
    );
    
    const voicesToUse = englishVoices.length > 0 ? englishVoices : this.availableVoices;
    
    if (voicesToUse.length === 0) {
      console.warn('⚠️ No voices available');
      return null;
    }

    // Try to find preferred voice by name first
    if (config.voiceName) {
      const preferredVoice = voicesToUse.find(voice => 
        voice.name.toLowerCase().includes(config.voiceName!.toLowerCase())
      );
      if (preferredVoice) {
        console.log(`✅ Found preferred voice for ${config.character}: ${preferredVoice.name}`);
        return preferredVoice;
      }
    }

    // Assign voices by character type and available voices
    let selectedVoice: SpeechSynthesisVoice;
    
    if (voicesToUse.length === 1) {
      // Only one voice available - we'll differentiate using pitch/rate
      selectedVoice = voicesToUse[0];
      console.log(`🎙️ Using single voice ${selectedVoice.name} for ${config.character} (will use pitch/rate for differentiation)`);
    } else {
      // Multiple voices available - assign different ones
      const characterIndex = this.getCharacterIndex(config.character);
      selectedVoice = voicesToUse[characterIndex % voicesToUse.length];
      console.log(`🎭 Assigned voice ${selectedVoice.name} to ${config.character} (index: ${characterIndex})`);
    }
    
    return selectedVoice;
  }

  // Get consistent index for character for voice assignment
  private getCharacterIndex(character: string): number {
    
    // Try to match character type
    const lowerChar = character.toLowerCase();
    
    if (lowerChar === 'narrator') return 0;
    if (lowerChar.includes('hero') || lowerChar.includes('detective') || lowerChar.includes('main')) return 1;
    if (lowerChar.includes('villain') || lowerChar.includes('bad') || lowerChar.includes('evil')) return 2;
    if (lowerChar.includes('child') || lowerChar.includes('kid') || lowerChar.includes('young')) return 3;
    if (lowerChar.includes('elder') || lowerChar.includes('old') || lowerChar.includes('wise')) return 4;
    
    // Hash the character name for consistent assignment
    let hash = 0;
    for (let i = 0; i < character.length; i++) {
      const char = character.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash) % 5;
  }

  // Generate speech for a single text segment (simplified for better reliability)
  async generateSpeech(text: string, config: VoiceConfig): Promise<{
    utterance: SpeechSynthesisUtterance;
    audioUrl: string | null;
  }> {
    await this.loadVoices();

    return new Promise((resolve, reject) => {
      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      const voice = this.getBestVoice(config);
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.pitch = config.pitch;
      utterance.rate = config.rate;
      utterance.volume = config.volume;

      // Configure utterance events
      utterance.onstart = () => {
        console.log(`🎤 Speaking as ${config.character}: "${text.substring(0, 50)}..."`);
      };

      utterance.onend = () => {
        // For now, we'll return the utterance without audio file
        // This allows playback but not download - we'll add download separately
        resolve({ utterance, audioUrl: null });
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        reject(new Error('Speech synthesis failed'));
      };

      // Don't start speaking yet - just prepare the utterance
      resolve({ utterance, audioUrl: null });
    });
  }

  // Parse story text and identify characters
  parseStorySegments(story: string, characters: string[]): Array<{character: string, text: string}> {
    const segments: Array<{character: string, text: string}> = [];
    
    console.log('📖 Parsing story with characters:', characters);
    console.log('📝 Story text preview:', story.substring(0, 200) + '...');
    
    // Split by lines and also by sentences to catch dialogue
    const lines = story.split(/\n/).filter(line => line.trim());
    
    for (const line of lines) {
      let foundCharacter = 'Narrator';
      let text = line.trim();
      let wasDialogue = false;

      console.log(`🔍 Processing line: "${line.substring(0, 50)}..."`);

      // Check for explicit dialogue format: Character: "text" or Character: text
      for (const character of characters) {
        if (character.toLowerCase() === 'narrator') continue;
        
        // Multiple dialogue patterns to catch
        const patterns = [
          new RegExp(`^${character}\\s*:\\s*["'](.+)["']`, 'i'), // Character: "dialogue"
          new RegExp(`^${character}\\s*:\\s*(.+)`, 'i'),        // Character: dialogue
          new RegExp(`^["'](.+)["']\\s*,?\\s*said\\s+${character}`, 'i'), // "dialogue," said Character
          new RegExp(`${character}\\s+said[,:]?\\s*["'](.+)["']`, 'i'),   // Character said: "dialogue"
        ];

        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match) {
            foundCharacter = character;
            text = match[1].trim();
            wasDialogue = true;
            console.log(`🎭 Found dialogue for ${character}: "${text.substring(0, 30)}..."`);
            break;
          }
        }
        
        if (wasDialogue) break;
      }

      // Also check for quoted text without character names (might be dialogue)
      if (!wasDialogue && /^["'](.+)["']/.test(line.trim())) {
        // If we have multiple non-narrator characters, assign to the first one
        const nonNarrators = characters.filter(c => c.toLowerCase() !== 'narrator');
        if (nonNarrators.length > 0) {
          foundCharacter = nonNarrators[0];
          text = line.trim().replace(/^["']|["']$/g, '');
          console.log(`🎬 Assigned quoted text to ${foundCharacter}: "${text.substring(0, 30)}..."`);
        }
      }

      if (text.length > 5) { // Only include meaningful text
        segments.push({ character: foundCharacter, text });
        console.log(`✅ Added segment: ${foundCharacter} - "${text.substring(0, 40)}..."`);
      }
    }

    console.log(`📊 Total segments parsed: ${segments.length}`);
    const characterCounts = segments.reduce((counts, seg) => {
      counts[seg.character] = (counts[seg.character] || 0) + 1;
      return counts;
    }, {} as {[key: string]: number});
    console.log('👥 Character distribution:', characterCounts);

    return segments;
  }

  // Assign voice configs to characters
  assignCharacterVoices(characters: string[]): Map<string, VoiceConfig> {
    const voiceMap = new Map<string, VoiceConfig>();
    
    console.log('🎭 Assigning voices to characters:', characters);
    
    // Always assign narrator
    voiceMap.set('Narrator', CHARACTER_VOICES[0]);
    console.log(`✅ Narrator assigned: pitch=${CHARACTER_VOICES[0].pitch}, rate=${CHARACTER_VOICES[0].rate}`);

    // Assign voices to other characters with distinct configurations
    characters.forEach((character) => {
      if (character.toLowerCase() !== 'narrator') {
        const characterIndex = this.getCharacterIndex(character);
        const voiceConfig = CHARACTER_VOICES[characterIndex % CHARACTER_VOICES.length];
        voiceMap.set(character, voiceConfig);
        console.log(`✅ ${character} assigned voice config: pitch=${voiceConfig.pitch}, rate=${voiceConfig.rate}`);
      }
    });

    console.log(`🎙️ Total voice configurations assigned: ${voiceMap.size}`);
    return voiceMap;
  }

  // Generate complete audiobook from story
  async generateAudiobook(story: string, characters: string[]): Promise<{
    segments: AudioSegment[];
    storyScript: string;
  }> {
    console.log('🎙️ Starting audiobook generation...');
    
    // Parse story into segments
    const storySegments = this.parseStorySegments(story, characters);
    console.log(`📖 Parsed ${storySegments.length} story segments`);

    // Assign voices to characters
    const voiceMap = this.assignCharacterVoices(characters);
    console.log('🎭 Character voice assignments:', Array.from(voiceMap.entries()));

    // Generate speech utterances for each segment
    const audioSegments: AudioSegment[] = [];
    let scriptText = `AI Generated Audiobook Script\n${'='.repeat(40)}\n\n`;
    
    for (let i = 0; i < storySegments.length; i++) {
      const segment = storySegments[i];
      const voiceConfig = voiceMap.get(segment.character) || voiceMap.get('Narrator')!;
      
      try {
        console.log(`🎤 Preparing audio ${i + 1}/${storySegments.length} for ${segment.character}`);
        const speechData = await this.generateSpeech(segment.text, voiceConfig);
        
        audioSegments.push({
          character: segment.character,
          text: segment.text,
          utterance: speechData.utterance,
          audioUrl: speechData.audioUrl,
          duration: 0 // Estimated based on text length
        });

        // Add to script
        scriptText += `${segment.character}: ${segment.text}\n\n`;

      } catch (error) {
        console.error(`❌ Failed to generate audio for segment ${i}:`, error);
      }
    }

    console.log('✅ Audiobook generation complete!');
    return { segments: audioSegments, storyScript: scriptText };
  }

  // Sequential playback of all segments
  async playAudiobook(segments: AudioSegment[]): Promise<void> {
    return new Promise((resolve) => {
      let currentIndex = 0;
      
      const playNext = () => {
        if (currentIndex >= segments.length) {
          resolve();
          return;
        }
        
        const segment = segments[currentIndex];
        const utterance = segment.utterance;
        
        utterance.onend = () => {
          currentIndex++;
          // Small pause between segments
          setTimeout(playNext, 300);
        };
        
        utterance.onerror = () => {
          currentIndex++;
          setTimeout(playNext, 100);
        };
        
        console.log(`🔊 Playing segment ${currentIndex + 1}/${segments.length}: ${segment.character}`);
        this.synthesis.speak(utterance);
      };
      
      playNext();
    });
  }

  // Stop current playback
  stopAudiobook(): void {
    this.synthesis.cancel();
  }

  // Get list of available voices for UI
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices;
  }
}
