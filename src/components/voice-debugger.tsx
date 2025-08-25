'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Volume2, AlertCircle } from 'lucide-react';
import { VoiceGenerator, CHARACTER_VOICES } from '@/lib/voice-generator';

export function VoiceDebugger() {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [voiceGenerator, setVoiceGenerator] = useState<VoiceGenerator | null>(null);

  useEffect(() => {
    // Initialize voice generator and load voices
    const initVoices = async () => {
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const vg = new VoiceGenerator();
          setVoiceGenerator(vg);
          
          // Wait a bit for voices to load
          setTimeout(() => {
            const voices = vg.getAvailableVoices();
            setAvailableVoices(voices);
            console.log('🎙️ Voice debugger loaded voices:', voices);
          }, 500);
        }
      } catch (error) {
        console.error('Voice debugger initialization error:', error);
      }
    };

    initVoices();
  }, []);

  const testVoice = async (voice: SpeechSynthesisVoice) => {
    if (!voiceGenerator || isPlaying) return;

    setIsPlaying(voice.name);
    
    try {
      const testText = `Hello, I am ${voice.name}. This is how I sound.`;
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.voice = voice;
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        setIsPlaying(null);
      };

      utterance.onerror = () => {
        setIsPlaying(null);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Test voice error:', error);
      setIsPlaying(null);
    }
  };

  const testCharacterVoice = async (voiceConfig: any) => {
    if (!voiceGenerator || isPlaying) return;

    setIsPlaying(voiceConfig.name);
    
    try {
      const testText = `I am the ${voiceConfig.character}. Listen to my unique voice settings.`;
      
      // Find the best available voice
      const voices = voiceGenerator.getAvailableVoices();
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      const selectedVoice = englishVoices[0] || voices[0];
      
      if (selectedVoice) {
        const utterance = new SpeechSynthesisUtterance(testText);
        utterance.voice = selectedVoice;
        utterance.pitch = voiceConfig.pitch;
        utterance.rate = voiceConfig.rate;
        utterance.volume = voiceConfig.volume;

        utterance.onend = () => {
          setIsPlaying(null);
        };

        utterance.onerror = () => {
          setIsPlaying(null);
        };

        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Test character voice error:', error);
      setIsPlaying(null);
    }
  };

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Speech API Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support the Web Speech API. Try using Chrome, Edge, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Voices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Available System Voices ({availableVoices.length})
          </CardTitle>
          <CardDescription>
            These are the voices available on your system. Click to test each one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableVoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading voices...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableVoices.map((voice, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{voice.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {voice.lang} {voice.default && '(default)'}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testVoice(voice)}
                    disabled={isPlaying !== null}
                  >
                    {isPlaying === voice.name ? (
                      'Playing...'
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Character Voice Configurations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎭 Character Voice Configurations
          </CardTitle>
          <CardDescription>
            These are the voice settings used for different character types. 
            Each uses different pitch and rate for distinction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHARACTER_VOICES.map((config, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{config.character}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testCharacterVoice(config)}
                    disabled={isPlaying !== null}
                  >
                    {isPlaying === config.name ? (
                      'Playing...'
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Pitch:</span>
                    <Badge variant="outline">{config.pitch}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <Badge variant="outline">{config.rate}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <Badge variant="outline">{config.volume}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Tips */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <h4 className="font-semibold text-blue-800">Voice Troubleshooting Tips:</h4>
            <ul className="text-blue-700 space-y-1 list-disc list-inside text-xs">
              <li>If you only see one voice, your system may have limited TTS voices installed</li>
              <li>Even with one voice, you should hear different pitch and speed for each character</li>
              <li>Chrome and Edge typically have the best voice support</li>
              <li>macOS has excellent built-in voices, Windows may be more limited</li>
              <li>The character voices use pitch (0.6-1.8) and rate (0.6-1.2) for differentiation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
