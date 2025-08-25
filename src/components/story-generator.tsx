'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Users, Play } from 'lucide-react';

// TypeScript interface for our story data
interface StoryData {
  story: string;
  characters: string[];
  wordCount: number;
}

export function StoryGenerator() {
  // React state to manage our component
  const [prompt, setPrompt] = useState('');
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

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

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) {
      generateStory();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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
              onKeyPress={handleKeyPress}
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

            {/* Next Step Preview */}
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                🎤 <strong>Next:</strong> We'll add voice generation to turn this story into an audiobook 
                with different voices for each character!
              </p>
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
