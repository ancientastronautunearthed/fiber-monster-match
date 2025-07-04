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
  Flame,
  Plus
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
  id: string;
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
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);

      const { data: challengesData, error: challengesError } = await supabase
        .from('photo_challenges')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

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
    setShowTemplateSelector(false);
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

      // Update or create progress record
      const currentProgress = progress[selectedChallenge.id];
      const newStreak = currentProgress ? currentProgress.current_streak + 1 : 1;
      const newTotal = currentProgress ? currentProgress.total_photos + 1 : 1;
      const newPoints = currentProgress ? currentProgress.points_earned + 10 : 10;
      const today = new Date().toISOString().split('T')[0];

      if (currentProgress) {
        // Update existing progress
        const { error: progressError } = await supabase
          .from('user_challenge_progress')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, currentProgress.longest_streak),
            total_photos: newTotal,
            points_earned: newPoints,
            last_photo_date: today,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentProgress.id);

        if (progressError) throw progressError;
      } else {
        // Create new progress record
        const { error: progressError } = await supabase
          .from('user_challenge_progress')
          .insert({
            user_id: user.id,
            challenge_id: selectedChallenge.id,
            current_streak: newStreak,
            longest_streak: newStreak,
            total_photos: newTotal,
            points_earned: newPoints,
            last_photo_date: today
          });

        if (progressError) throw progressError;
      }

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

      // Show success message with Light earned
      toast({
        title: "Photo Captured!",
        description: `Day ${dayNumber} saved! +${totalLightEarned} Light earned.`,
      });

      // Refresh data to show updated progress
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

  const canTakePhotoToday = (challengeId: string): boolean => {
    const challengeProgress = progress[challengeId];
    if (!challengeProgress || !challengeProgress.last_photo_date) return true;
    
    const today = new Date().toISOString().split('T')[0];
    return challengeProgress.last_photo_date !== today;
  };

  const getDaysUntilNextPhoto = (challengeId: string): string => {
    const challengeProgress = progress[challengeId];
    if (!challengeProgress || !challengeProgress.last_photo_date) return "Ready now";
    
    const today = new Date().toISOString().split('T')[0];
    if (challengeProgress.last_photo_date === today) {
      return "Come back tomorrow";
    }
    return "Ready now";
  };

  // Show template selector
  if (showTemplateSelector) {
    return (
      <ChallengeTemplateSelector
        onTemplateSelected={handleTemplateSelected}
      />
    );
  }

  // Show camera interface
  if (showCamera && selectedChallenge) {
    return (
      <CameraCapture
        challengeId={selectedChallenge.id}
        dayNumber={getNextDayNumber(selectedChallenge.id)}
        guideImageUrl={selectedChallenge.pose_guide_url}
        title={`${selectedChallenge.title} - Day ${getNextDayNumber(selectedChallenge.id)}`}
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
          
          <Button 
            onClick={() => setShowTemplateSelector(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Challenge
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
            <CardContent className="text-center">
              <Button 
                onClick={() => setShowTemplateSelector(true)}
                size="lg"
                className="mt-4"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Challenge
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {/* Active Challenges */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Active Challenges</h2>
              
              {challenges.map((challenge) => {
                const challengeProgress = progress[challenge.id];
                const progressPercentage = getProgressPercentage(challenge.id);
                const canTakePhoto = canTakePhotoToday(challenge.id);
                const nextPhotoStatus = getDaysUntilNextPhoto(challenge.id);
                
                return (
                  <Card key={challenge.id} className="relative">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{challenge.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {challenge.target_area}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground text-sm mb-4">
                            {challenge.description}
                          </p>
                          
                          {/* Progress Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Day</span>
                              </div>
                              <div className="font-bold">
                                {challengeProgress?.total_photos || 0} / {challenge.target_days}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Flame className="h-3 w-3 text-orange-500" />
                                <span className="text-xs text-muted-foreground">Streak</span>
                              </div>
                              <div className="font-bold text-orange-600">
                                {challengeProgress?.current_streak || 0}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Trophy className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-muted-foreground">Best</span>
                              </div>
                              <div className="font-bold text-yellow-600">
                                {challengeProgress?.longest_streak || 0}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Target className="h-3 w-3 text-primary" />
                                <span className="text-xs text-muted-foreground">Light</span>
                              </div>
                              <div className="font-bold text-primary">
                                {challengeProgress?.points_earned || 0}
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm text-muted-foreground">
                                {Math.round(progressPercentage)}%
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {nextPhotoStatus}
                        </div>
                        
                        <Button
                          onClick={() => startCamera(challenge)}
                          disabled={!canTakePhoto}
                          className="flex items-center gap-2"
                        >
                          <Camera className="h-4 w-4" />
                          {canTakePhoto ? 'Take Photo' : 'Photo Taken Today'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PhotoChallenge;