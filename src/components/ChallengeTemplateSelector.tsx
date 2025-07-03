import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  Hand, 
  User, 
  Eye, 
  Activity,
  Camera,
  Clock,
  Target,
  Circle
} from 'lucide-react';

interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  pose_instructions: string[];
  points_per_photo: number;
  default_duration: number;
  difficulty_level: string;
}

const getBodyPartIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('hand')) return Hand;
  if (lowerName.includes('leg') || lowerName.includes('knee')) return Circle;
  if (lowerName.includes('arm') || lowerName.includes('elbow')) return Activity;
  if (lowerName.includes('torso') || lowerName.includes('chest')) return User;
  if (lowerName.includes('face')) return Eye;
  if (lowerName.includes('scalp') || lowerName.includes('hair')) return Circle;
  if (lowerName.includes('foot') || lowerName.includes('ankle')) return Circle;
  if (lowerName.includes('back') || lowerName.includes('shoulder')) return Activity;
  return Camera;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'advanced': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

interface ChallengeTemplateSelectorProps {
  onTemplateSelected: (template: ChallengeTemplate) => void;
  trigger?: React.ReactNode;
}

export const ChallengeTemplateSelector = ({ onTemplateSelected, trigger }: ChallengeTemplateSelectorProps) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ChallengeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load challenge templates.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async (template: ChallengeTemplate) => {
    if (!user) return;

    setCreating(template.id);
    try {
      const { data, error } = await supabase
        .from('photo_challenges')
        .insert({
          user_id: user.id,
          title: template.name,
          description: template.description,
          challenge_type: 'symptom_tracking',
          target_area: template.name.toLowerCase().split(' ')[0],
          target_days: template.default_duration,
          pose_guide_url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400'
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Create initial progress entry
        await supabase
          .from('user_challenge_progress')
          .insert({
            user_id: user.id,
            challenge_id: data.id,
            current_streak: 0,
            longest_streak: 0,
            total_photos: 0,
            points_earned: 0
          });

        toast({
          title: "Challenge Created!",
          description: `Your ${template.name} challenge is ready to start.`
        });

        onTemplateSelected(template);
        setOpen(false);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCreating(null);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button>Choose Challenge Type</Button>}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Challenge Type</DialogTitle>
            <DialogDescription>Loading challenge templates...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Choose Challenge Type</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Challenge Type</DialogTitle>
          <DialogDescription>
            Choose which body part you want to track. Each challenge is designed for one-handed phone operation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-4 py-4">
          {templates.map((template) => {
            const Icon = getBodyPartIcon(template.name);
            
            return (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={getDifficultyColor(template.difficulty_level || 'beginner')}
                          >
                            {template.difficulty_level || 'Beginner'}
                          </Badge>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span>{template.points_per_photo} points per photo</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{template.default_duration} days</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">One-handed instructions:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {template.pose_instructions.slice(0, 3).map((instruction, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                            {instruction}
                          </li>
                        ))}
                        {template.pose_instructions.length > 3 && (
                          <li className="text-muted-foreground/60">
                            + {template.pose_instructions.length - 3} more instructions
                          </li>
                        )}
                      </ul>
                    </div>

                    <Button 
                      onClick={() => createChallenge(template)}
                      disabled={creating === template.id}
                      className="w-full"
                      size="sm"
                    >
                      {creating === template.id ? 'Creating...' : 'Start This Challenge'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};