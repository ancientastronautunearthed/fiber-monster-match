import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CameraCapture } from '@/components/CameraCapture';
import { usePoints } from '@/hooks/usePoints';
import { ChallengeTemplateSelector } from '@/components/ChallengeTemplateSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Camera, 
  Trophy, 
  Calendar,
  Target,
  Flame
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  target_area: string;
  pose_guide_url: string;
  target_days: number;
  status: string;
}

interface Progress {
  current_streak: number;
  longest_streak: number;
  total_photos: number;
  points_earned: number;
  last_photo_date: string;
}

const PhotoChallenge = () => {
  const { user } = useAuth();
  const { awardLight } = usePoints();
  const navigate = useNavigate();
  const [showCamera, setShowCamera] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const { data: challengesData, error: challengesError } = await supabase
        .from('photo_challenges')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (challengesError) throw challengesError;

      const { data: progressData, error: progressError } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (progressError) throw progressError;

      setChallenges(challengesData || []);
      
      const progressMap = (progressData || []).reduce((acc, p) => {
        acc[p.challenge_id] = p;
        return acc;
      }, {} as Record<string, Progress>);
      setProgress(progressMap);

    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load challenges. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelected = () => {
    // Refresh challenges after template selection
    fetchChallenges();
  };

  const getInstructionsForChallenge = async (challengeId: string) => {
    try {
      // Get the challenge details
      const { data: challengeData, error: challengeError } = await supabase
        .from('photo_challenges')
        .select('title')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      // Find matching template based on challenge title
      const { data: templateData, error: templateError } = await supabase
        .from('challenge_templates')
        .select('pose_instructions')
        .ilike('name', `%${challengeData.title.split(' ')[0]}%`)
        .limit(1)
        .single();

      if (templateError || !templateData) {
        // Return default instructions if template not found
        return [
          "Position yourself consistently each day",
          "Use good lighting for clear photos", 
          "Hold your phone steady with one hand",
          "Take the photo from the same angle daily"
        ];
      }

      return templateData.pose_instructions;
    } catch (error) {
      console.error('Error fetching instructions:', error);
      return [
        "Position yourself consistently each day",
        "Use good lighting for clear photos",
        "Hold your phone steady with one hand", 
        "Take the photo from the same angle daily"
      ];
    }
  };

  const startCamera = async (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowCamera(true);
  };

  const handlePhotoTaken = async (photo: Blob, dayNumber: number) => {
    if (!selectedChallenge || !user) return;

    try {
      // Upload photo to storage
      const fileName = `${user.id}/${selectedChallenge.id}/day-${dayNumber}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('challenge-photos')
        .upload(fileName, photo);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('challenge-photos')
        .getPublicUrl(fileName);

      // Create challenge entry
      const { error: entryError } = await supabase
        .from('challenge_entries')
        .insert({
          challenge_id: selectedChallenge.id,
          user_id: user.id,
          image_url: publicUrl,
          day_number: dayNumber,
          ai_feedback: 'Great job staying consistent with your tracking!',
          ai_sentiment: 'proud'
        });

      if (entryError) throw entryError;

      // Update progress
      const currentProgress = progress[selectedChallenge.id];
      const newStreak = currentProgress ? currentProgress.current_streak + 1 : 1;
      const newTotal = currentProgress ? currentProgress.total_photos + 1 : 1;
      const newPoints = currentProgress ? currentProgress.points_earned + 10 : 10;

      const { error: progressError } = await supabase
        .from('user_challenge_progress')
        .upsert({
          user_id: user.id,
          challenge_id: selectedChallenge.id,
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, currentProgress?.longest_streak || 0),
          total_photos: newTotal,
          points_earned: newPoints,
          last_photo_date: new Date().toISOString().split('T')[0]
        });

      if (progressError) throw progressError;

      // Award Light for photo challenge completion
      const isFirstPhoto = newTotal === 1;
      const basePoints = 15; // Base points for daily photo
      const bonusPoints = isFirstPhoto ? 10 : 0; // Bonus for starting challenge
      const streakBonus = newStreak > 1 ? Math.min(newStreak * 2, 20) : 0; // Streak bonus
      
      const totalLightEarned = basePoints + bonusPoints + streakBonus;
      
      await awardLight(
        'daily_photo_capture',
        totalLightEarned,
        selectedChallenge.id,
        'photo_challenge',
        {
          challenge_type: selectedChallenge.target_area,
          day_number: dayNumber,
          streak: newStreak,
          is_first_photo: isFirstPhoto,
          base_points: basePoints,
          bonus_points: bonusPoints,
          streak_bonus: streakBonus
        }
      );

      // Refresh data
      await fetchChallenges();

    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
  };

  const getNextDayNumber = (challengeId: string): number => {
    const challengeProgress = progress[challengeId];
    return challengeProgress ? challengeProgress.total_photos + 1 : 1;
  };

  const getProgressPercentage = (challengeId: string): number => {
    const challenge = challenges.find(c => c.id === challengeId);
    const challengeProgress = progress[challengeId];
    if (!challenge || !challengeProgress) return 0;
    return Math.min((challengeProgress.total_photos / challenge.target_days) * 100, 100);
  };

  if (showCamera && selectedChallenge) {
    return (
      <CameraCapture
        challengeId={selectedChallenge.id}
        dayNumber={getNextDayNumber(selectedChallenge.id)}
        guideImageUrl={selectedChallenge.pose_guide_url}
        title={`${selectedChallenge.title} Guide`}
        instructions={[
          "Position yourself consistently each day",
          "Use good lighting for clear photos",
          "Hold your phone steady with one hand",
          "Take the photo from the same angle daily"
        ]}
        onPhotoTaken={handlePhotoTaken}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <header className="bg-background/80 backdrop-blur border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
              <Camera className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Photo Challenges</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading challenges...</p>
          </div>
        ) : challenges.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No Active Challenges</CardTitle>
              <CardDescription>
                Start your first photo challenge to track your progress over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChallengeTemplateSelector 
                onTemplateSelected={handleTemplateSelected}
                trigger={
                  <Button className="w-full">
                    Create New Challenge
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Active Challenges</h2>
              <ChallengeTemplateSelector 
                onTemplateSelected={handleTemplateSelected}
                trigger={
                  <Button variant="outline">
                    New Challenge
                  </Button>
                }
              />
            </div>

            <div className="grid gap-6">
              {challenges.map((challenge) => {
                const challengeProgress = progress[challenge.id];
                const progressPercentage = getProgressPercentage(challenge.id);
                const nextDay = getNextDayNumber(challenge.id);

                return (
                  <Card key={challenge.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {challenge.title}
                            <Badge variant="outline">
                              {challenge.target_area}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{challenge.description}</CardDescription>
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-primary">
                              <Flame className="h-4 w-4" />
                              <span className="text-lg font-bold">
                                {challengeProgress?.current_streak || 0}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">streak</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-primary">
                              <Trophy className="h-4 w-4" />
                              <span className="text-lg font-bold">
                                {challengeProgress?.points_earned || 0}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">
                            {challengeProgress?.total_photos || 0} / {challenge.target_days} days
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>

                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Day {nextDay}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{challenge.target_days - (challengeProgress?.total_photos || 0)} days left</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => startCamera(challenge)}
                        className="w-full"
                        size="lg"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Take Day {nextDay} Photo
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PhotoChallenge;