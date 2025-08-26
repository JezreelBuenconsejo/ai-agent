import { StoryGenerator } from "@/components/story-generator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Brain,
  MessageSquare,
  Camera,
  Users,
  Zap,
  Target,
  Palette,
  BarChart3,
  GitBranch,
  Clock,
  BrainCogIcon,
  Music,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <StoryGenerator />
    
      {/* Upcoming Features Section */}
      <div className="max-w-5xl mx-auto p-6 mt-12">
        <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-purple-800">
              <Brain className="h-6 w-6" />
              🚀 Evolution to AI Agent
            </CardTitle>
            <CardDescription className="text-lg text-purple-700">
              Our roadmap to becoming a comprehensive AI storytelling agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Phase Headers with organized features */}
            <div className="space-y-8">
              {/* Phase 1: Agent Foundation - High Priority */}
              <div>
                <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                  🎯 Phase 1: Agent Foundation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Conversational Interface */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">
                        Chat Interface
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      AI writing partner with conversational story development
                      and character brainstorming
                    </p>
                  </div>

                  {/* Memory System */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">
                        Story Memory
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Persistent character, world, and plot tracking across
                      multiple story sessions
                    </p>
                  </div>

                  {/* Autonomous Behavior */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">
                        Story Continuation
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      AI proactively suggests story continuations and develops
                      plot threads independently
                    </p>
                  </div>
                </div>
              </div>

              {/* Phase 2: Advanced Agent Capabilities - Medium Priority */}
              <div>
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  🛠 Phase 2: Advanced Capabilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Visual Content */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Camera className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">
                        Visual Storytelling
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Planning
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      AI-generated character portraits, scene illustrations, and
                      background music
                    </p>
                  </div>

                  {/* Music & Effects */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Music className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">
                        Audio & Effects
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Planning
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Background music, sound effects, and immersive audio experiences for stories
                    </p>
                  </div>
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">
                        External Tools
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Planning
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Wikipedia research, fact-checking, Web Scrapers
                    </p>
                  </div>

                  {/* Intelligent Decisions */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <GitBranch className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">
                        Branching Narratives
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Planning
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Create choose-your-own-adventure stories with multiple
                      paths and endings
                    </p>
                  </div>
                </div>
              </div>

              {/* Phase 3: Advanced Intelligence - Long-term */}
              <div>
                <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                  🚀 Phase 3: Advanced Intelligence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Collaborative Features */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">
                        Collaborative Creation
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Future
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Multi-user story collaboration, community sharing, and
                      version control for story branches
                    </p>
                  </div>

                  {/* Learning & Adaptation */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">
                        Story Analytics
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Future
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Insights into story engagement, character development, and
                      narrative structure
                    </p>
                  </div>

                  {/* Live Events */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">
                        Live Story Events
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Future
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Participate in live storytelling events and community
                      challenges
                    </p>
                  </div>

                  {/* Advanced Voice */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Palette className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">
                        Custom Voice Cloning
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Future
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Clone your own voice or create unique character voices
                      with advanced AI models
                    </p>
                  </div>

                  {/* Multi-AI Integration */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">
                        Multi-AI Integration
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Future
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Seamless integration with multiple AI models for enhanced
                      creativity and capabilities
                    </p>
                  </div>

                  {/* Smart Personalization */}
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <BrainCogIcon className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">
                        Smart Personalization
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Future
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      AI learns your preferences and suggests personalized story
                      themes, characters, and writing styles
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6">
                <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <p className="text-purple-700 mb-4">
                  We&apos;re building the future of AI-powered storytelling.
                </p>

                {/* GitHub Repository Link */}
                <div className="mb-4">
                  <a
                    href="https://github.com/JezreelBuenconsejo/ai-agent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <GitBranch className="h-4 w-4" />
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
