'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen, Users, Play, Volume2, Pause, Settings, Sparkles, Zap, Download } from 'lucide-react';
import { VoiceGenerator, AudioSegment } from '@/lib/voice-generator';
import { AIVoiceGenerator, AIAudioSegment } from '@/lib/ai-voice-generator';
import { VoiceDebugger } from './voice-debugger';

// TypeScript interface for our story data
interface StoryData {
  story: string;
  characters: string[];
  wordCount: number;
}

// Audio data interface
interface AudioData {
  segments: AudioSegment[];
  storyScript: string;
}

export function StoryGenerator() {
  // React state to manage our component
  const [prompt, setPrompt] = useState('');
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // Voice generation state
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState('');
  
  // Voice generator instances
  const voiceGeneratorRef = useRef<VoiceGenerator | null>(null);
  const aiVoiceGeneratorRef = useRef<AIVoiceGenerator | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // AI Voice generation state
  const [aiAudioData, setAiAudioData] = useState<{segments: AIAudioSegment[]; combinedMp3: string} | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState({ current: 0, total: 0 });
  const [aiError, setAiError] = useState('');
  const [voiceMode, setVoiceMode] = useState<'browser' | 'ai'>('browser');

  // Function to call our API and generate story
  const generateStory = async () => {
    if (!prompt.trim()) {
      setError('Please enter a story prompt');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      console.log('🚀 Generating story...');
      
      // Call our API endpoint
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      setStoryData(data);
      console.log('✅ Story generated successfully!');

    } catch (err) {
      console.error('❌ Error:', err);
      setError('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate voice audio for the story (Browser TTS)
  const generateAudio = async () => {
    if (!storyData) {
      setAudioError('No story available to convert to audio');
      return;
    }

    setIsGeneratingAudio(true);
    setAudioError('');

    try {
      // Initialize voice generator if not already done
      if (!voiceGeneratorRef.current) {
        voiceGeneratorRef.current = new VoiceGenerator();
      }

      console.log('🎙️ Starting browser audio generation...');
      
      const audioResult = await voiceGeneratorRef.current.generateAudiobook(
        storyData.story,
        storyData.characters
      );

      setAudioData(audioResult);
      console.log('✅ Browser audio generation complete!');

    } catch (err) {
      console.error('❌ Audio generation error:', err);
      setAudioError('Failed to generate audio. Please check if your browser supports Web Speech API.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Generate AI voice audio (ElevenLabs FREE)
  const generateAIAudio = async () => {
    if (!storyData) {
      setAiError('No story available to convert to audio');
      return;
    }

    setIsGeneratingAI(true);
    setAiError('');
    setAiProgress({ current: 0, total: 0 });

    try {
      // Initialize AI voice generator
      if (!aiVoiceGeneratorRef.current) {
        aiVoiceGeneratorRef.current = new AIVoiceGenerator();
      }

      console.log('🤖 Starting AI voice generation...');
      
      // Parse story into segments first
      if (!voiceGeneratorRef.current) {
        voiceGeneratorRef.current = new VoiceGenerator();
      }
      
      const storySegments = voiceGeneratorRef.current.parseStorySegments(
        storyData.story,
        storyData.characters
      );

      const aiResult = await aiVoiceGeneratorRef.current.generateAIAudiobook(
        storySegments,
        (current, total) => setAiProgress({ current, total })
      );

      setAiAudioData(aiResult);
      console.log('✅ AI voice generation complete!');

    } catch (err) {
      console.error('❌ AI voice generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setAiError(`Failed to generate AI voices: ${errorMessage}`);
    } finally {
      setIsGeneratingAI(false);
      setAiProgress({ current: 0, total: 0 });
    }
  };

  // Play/pause browser audio
  const toggleAudio = async () => {
    if (!audioData || !voiceGeneratorRef.current) return;

    if (isPlaying) {
      voiceGeneratorRef.current.stopAudiobook();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      try {
        await voiceGeneratorRef.current.playAudiobook(audioData.segments);
        setIsPlaying(false);
      } catch (error) {
        console.error('Playback error:', error);
        setIsPlaying(false);
      }
    }
  };

  // Play/pause AI audio
  const toggleAIAudio = async () => {
    if (!aiAudioData || !aiVoiceGeneratorRef.current) return;

    if (isPlaying) {
      // Stop current playback (we'll add proper stop functionality)
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      try {
        await aiVoiceGeneratorRef.current.playAIAudiobook(aiAudioData.segments);
        setIsPlaying(false);
      } catch (error) {
        console.error('AI playback error:', error);
        setIsPlaying(false);
      }
    }
  };

  // Download AI-generated MP3
  const downloadAIAudio = () => {
    if (!aiAudioData || !aiVoiceGeneratorRef.current) return;
    aiVoiceGeneratorRef.current.downloadAudiobook(aiAudioData.segments, 'ai-audiobook');
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) {
      generateStory();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          🎙️ AI Voice Story Generator
        </h1>
        <p className="text-muted-foreground">
          Generate engaging stories with multiple characters, then convert to audio
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Story Prompt
          </CardTitle>
          <CardDescription>
            Describe the story you want to create. The AI will generate characters and dialogue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="e.g., A detective solving a mystery, A friendship between a robot and a child"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isGenerating}
              className="flex-1"
            />
            <Button 
              onClick={generateStory} 
              disabled={isGenerating || !prompt.trim()}
              className="min-w-[120px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Story Display */}
      {storyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Generated Story
              </span>
              <div className="flex gap-2">
                <Badge variant="secondary">{storyData.wordCount} words</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {storyData.characters.length} characters
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Characters List */}
            <div>
              <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Characters:</h3>
              <div className="flex flex-wrap gap-2">
                {storyData.characters.map((character, index) => (
                  <Badge key={index} variant="outline">
                    {character}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Story Text */}
            <div>
              <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Story:</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                  {storyData.story}
                </pre>
              </div>
            </div>

            {/* Voice Generation Options */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">🎙️ Voice Generation Options</h3>
                
                {/* Browser TTS Option */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Browser Voices (Free)</h4>
                  </div>
                  
                  <div className="flex gap-3 mb-3">
                    <Button 
                      onClick={generateAudio} 
                      disabled={isGeneratingAudio}
                      className="flex-1"
                      variant="outline"
                    >
                      {isGeneratingAudio ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4 mr-2" />
                          Generate Browser Audio
                        </>
                      )}
                    </Button>
                    
                    {audioData && (
                      <Button onClick={toggleAudio} variant="outline" size="sm">
                        {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                    )}
                  </div>

                  {audioError && (
                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md mb-3">
                      {audioError}
                    </div>
                  )}

                  {audioData && (
                    <div className="bg-white border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-800 mb-1">
                        ✅ <strong>Browser Audio Ready!</strong> {audioData.segments.length} voice segments
                      </p>
                      <p className="text-xs text-blue-700">Uses different pitch/speed for each character</p>
                    </div>
                  )}
                </div>

                {/* AI Voice Option */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium text-purple-800">AI Voices (Premium Quality - FREE Tier)</h4>
                    <Badge variant="outline" className="text-xs">10k chars/month</Badge>
                  </div>
                  
                  <div className="flex gap-3 mb-3">
                    <Button 
                      onClick={generateAIAudio} 
                      disabled={isGeneratingAI}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Generating AI Voices... ({aiProgress.current}/{aiProgress.total})
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate AI Voices
                        </>
                      )}
                    </Button>
                    
                    {aiAudioData && (
                      <>
                        <Button onClick={toggleAIAudio} variant="outline" size="sm">
                          {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                          {isPlaying ? 'Pause' : 'Play'}
                        </Button>
                        <Button onClick={downloadAIAudio} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          MP3
                        </Button>
                      </>
                    )}
                  </div>

                  {aiError && (
                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md mb-3">
                      {aiError}
                      {aiError.includes('API key') && (
                        <p className="mt-1 text-xs">Add ELEVENLABS_API_KEY to your .env.local file</p>
                      )}
                    </div>
                  )}

                  {aiAudioData && (
                    <div className="bg-white border border-purple-200 rounded p-3">
                      <p className="text-sm text-purple-800 mb-1">
                        🤖 <strong>AI Audiobook Ready!</strong> {aiAudioData.segments.length} premium voice segments
                      </p>
                      <div className="text-xs text-purple-700 space-y-1">
                        <p>• Professional AI voices (Adam, Antoni, Arnold, Charlotte, Charlie)</p>
                        <p>• Complete MP3 download available</p>
                        <p>• Character voices automatically assigned</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-purple-200 rounded p-3 mt-3">
                    <p className="text-xs text-purple-700">
                      <strong>🆓 Free Setup:</strong> free API key at <strong>elevenlabs.io</strong> (10,000 characters/month)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Prompts */}
      {!storyData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Try these story ideas:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "A magical forest where animals can talk",
                "Two friends building a treehouse",
                "A detective solving a missing cake mystery", 
                "A robot learning about human emotions",
                "Pirates searching for hidden treasure",
                "A superhero's first day at school"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start h-auto p-3"
                  onClick={() => setPrompt(suggestion)}
                  disabled={isGenerating}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
