import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { MONSTER_KEYWORDS, type KeywordCategory } from '@/data/keywords';
import { Heart, Sparkles, ArrowLeft, Wand2 } from 'lucide-react';

const MonsterCreator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedKeywords, setSelectedKeywords] = useState<Partial<Record<KeywordCategory, string>>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = Object.keys(MONSTER_KEYWORDS) as KeywordCategory[];
  const isComplete = categories.every(category => selectedKeywords[category]);

  const handleKeywordSelect = (category: KeywordCategory, keyword: string) => {
    setSelectedKeywords(prev => ({
      ...prev,
      [category]: keyword
    }));
  };

  const handleCreateMonster = async () => {
    if (!user || !isComplete) return;

    setIsGenerating(true);

    try {
      const keywordsArray = Object.values(selectedKeywords) as string[];
      
      // Save keywords to profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          monster_keywords: keywordsArray
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Monster Created!",
        description: "Your unique Romantic Morgellons Monster keywords have been saved."
      });

      // Navigate after a short delay to ensure toast is shown
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error creating monster:', error);
      toast({
        title: "Error",
        description: "Failed to create your monster. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryDescription = (category: KeywordCategory): string => {
    const descriptions = {
      "My Journey's Mark": "Keywords that acknowledge the physical and emotional reality of your condition",
      "My Shield & Strategy": "How you navigate your challenges and cope with difficulties", 
      "My Hidden Superpower": "Your challenges reframed as sources of profound strength",
      "My World of Wonders": "What brings you joy and engagement outside of your condition",
      "My Quirks & Comforts": "Light-hearted, specific details that make you uniquely you"
    };
    return descriptions[category];
  };

  const getCategoryIcon = (category: KeywordCategory) => {
    const icons = {
      "My Journey's Mark": "🎭",
      "My Shield & Strategy": "🛡️", 
      "My Hidden Superpower": "⚡",
      "My World of Wonders": "🌟",
      "My Quirks & Comforts": "🎨"
    };
    return icons[category];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-pink-500" />
              <h1 className="text-xl font-bold">Monster Creator</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">
              {Object.keys(selectedKeywords).length}/5 selected
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Create Your Romantic Morgellons Monster</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Choose one keyword from each of the five pillars to create your unique monster persona. 
            This playful representation will help you connect with others who share similar experiences.
          </p>
        </div>

        <div className="space-y-8">
          {categories.map((category) => (
            <Card key={category} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100">
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  <span>{category}</span>
                  {selectedKeywords[category] && (
                    <Badge variant="secondary" className="ml-auto">
                      Selected: {selectedKeywords[category]}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-base">
                  {getCategoryDescription(category)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {MONSTER_KEYWORDS[category].map((keyword) => {
                    const isSelected = selectedKeywords[category] === keyword;
                    return (
                      <Button
                        key={keyword}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`text-sm h-auto py-3 px-4 whitespace-normal text-left justify-start ${
                          isSelected 
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white" 
                            : "hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50"
                        }`}
                        onClick={() => handleKeywordSelect(category, keyword)}
                      >
                        {keyword}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <Wand2 className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-xl font-semibold mb-2">Ready to Create?</h3>
              <p className="text-muted-foreground mb-6">
                {isComplete 
                  ? "You've selected all 5 keywords! Your monster is ready to come to life."
                  : `Select ${5 - Object.keys(selectedKeywords).length} more keyword${5 - Object.keys(selectedKeywords).length === 1 ? '' : 's'} to complete your monster.`
                }
              </p>
              <Button 
                onClick={handleCreateMonster}
                disabled={!isComplete || isGenerating}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Creating Your Monster...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Create My Monster
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MonsterCreator;