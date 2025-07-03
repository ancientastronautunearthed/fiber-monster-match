import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CameraCapture } from '@/components/CameraCapture';
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

  const createNewChallenge = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('photo_challenges')
        .insert({
          user_id: user.id,
          title: 'Symptom Progress Tracking',
          description: 'Track your symptoms daily with consistent photos',
          challenge_type: 'symptom_tracking',
          target_area: 'hands',
          target_days: 30,
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

        setChallenges(prev => [...prev, data]);
        toast({
          title: "Challenge Created!",
          description: "Your new photo challenge is ready to start."
        });
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startCamera = (challenge: Challenge) => {
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
        title="Hand Position Guide"
        instructions={[
          "Place both hands flat on a surface",
          "Keep your fingers spread naturally",
          "Ensure good lighting on your hands",
          "Take the photo from the same angle each day"
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
              <Button onClick={createNewChallenge} className="w-full">
                Create New Challenge
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Active Challenges</h2>
              <Button onClick={createNewChallenge} variant="outline">
                New Challenge
              </Button>
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