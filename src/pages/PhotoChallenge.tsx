// Simple date helpers (replace date-fns for better compatibility)
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const differenceInDays = (endDate: Date, startDate: Date): number => {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CameraCapture } from '@/components/CameraCapture';
import { usePoints } from '@/hooks/usePoints';
import { ChallengeTemplateSelector } from '@/components/ChallengeTemplateSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Camera, 
  Trophy, 
  Calendar as CalendarIcon,
  Target,
  Flame,
  Plus,
  Video,
  Play,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  target_area: string;
  pose_guide_url: string;
  target_days: number;
  status: string;
  end_date?: string;
  created_at: string;
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
  const [showTimelapseDialog, setShowTimelapseDialog] = useState(false);
  const [timelapseChallenge, setTimelapseChallenge] = useState<Challenge | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date>();
  const [isGeneratingTimelapse, setIsGeneratingTimelapse] = useState(false);

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

      // If this is the first photo (day 1), create pose guide from this photo
      if (dayNumber === 1) {
        const { error: updateError } = await supabase
          .from('photo_challenges')
          .update({
            pose_guide_url: publicUrl
          })
          .eq('id', selectedChallenge.id);

        if (updateError) {
          console.error('Error updating pose guide:', updateError);
        } else {
          toast({
            title: "Pose Guide Created!",
            description: "Your first photo will be used as a guide for future days.",
          });
        }
      }

      // Update or create progress record
      const currentProgress = progress[selectedChallenge.id];
      const newStreak = currentProgress ? currentProgress.current_streak + 1 : 1;
      const newTotal = currentProgress ? currentProgress.total_photos + 1 : 1;
      const newPoints = currentProgress ? currentProgress.points_earned + 10 : 10;
      const today = new Date().toISOString().split('T')[0];

      if (currentProgress) {
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
      const basePoints = 15;
      const bonusPoints = isFirstPhoto ? 10 : 0;
      const streakBonus = newStreak > 1 ? Math.min(newStreak * 2, 20) : 0;
      
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
        title: isFirstPhoto ? "Challenge Started!" : "Photo Captured!",
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
    
    // If challenge has end date, calculate based on that, otherwise use target_days
    const totalDays = challenge.end_date 
      ? differenceInDays(new Date(challenge.end_date), new Date(challenge.created_at)) + 1
      : challenge.target_days;
    
    return Math.min((challengeProgress.total_photos / totalDays) * 100, 100);
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

  const canGenerateTimelapse = (challenge: Challenge): boolean => {
    const challengeProgress = progress[challenge.id];
    return challengeProgress && challengeProgress.total_photos >= 10;
  };

  const openTimelapseDialog = (challenge: Challenge) => {
    setTimelapseChallenge(challenge);
    setSelectedEndDate(challenge.end_date ? new Date(challenge.end_date) : addDays(new Date(), 30));
    setShowTimelapseDialog(true);
  };

  const updateChallengeEndDate = async () => {
    if (!timelapseChallenge || !selectedEndDate) return;

    try {
      const { error } = await supabase
        .from('photo_challenges')
        .update({
          end_date: selectedEndDate.toISOString().split('T')[0]
        })
        .eq('id', timelapseChallenge.id);

      if (error) throw error;

      toast({
        title: "End Date Updated",
        description: `Challenge will end on ${formatDate(selectedEndDate)}`,
      });

      setShowTimelapseDialog(false);
      fetchChallenges();
    } catch (error) {
      console.error('Error updating end date:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update challenge end date.",
        variant: "destructive"
      });
    }
  };

  const generateTimelapse = async (early: boolean = false) => {
    if (!timelapseChallenge) return;

    try {
      setIsGeneratingTimelapse(true);

      // Get all photos for this challenge
      const { data: entries, error: entriesError } = await supabase
        .from('challenge_entries')
        .select('image_url, day_number, taken_at')
        .eq('challenge_id', timelapseChallenge.id)
        .order('day_number', { ascending: true });

      if (entriesError) throw entriesError;

      if (!entries || entries.length < 2) {
        toast({
          title: "Not Enough Photos",
          description: "You need at least 2 photos to create a time-lapse.",
          variant: "destructive"
        });
        return;
      }

      // Call edge function to generate time-lapse
      const { data, error } = await supabase.functions.invoke('generate-timelapse', {
        body: {
          challengeId: timelapseChallenge.id,
          userId: user?.id,
          photos: entries,
          isEarly: early
        }
      });

      if (error) throw error;

      // If early generation, deduct points
      if (early) {
        const challengeProgress = progress[timelapseChallenge.id];
        const pointsPenalty = Math.floor(challengeProgress.points_earned * 0.2); // 20% penalty

        toast({
          title: "Time-lapse Generated Early",
          description: `Video created! ${pointsPenalty} Light deducted for early generation.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Time-lapse Generated!",
          description: "Your progress video has been created successfully.",
        });
      }

      setShowTimelapseDialog(false);
      
    } catch (error) {
      console.error('Error generating time-lapse:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to create time-lapse video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingTimelapse(false);
    }
  };

  // Show template selector
  if (showTemplateSelector) {
    return (
      <ChallengeTemplateSelector
        onTemplateSelected={handleTemplateSelected}
        onClose={() => setShowTemplateSelector(false)}
      />
    );
  }

  // Show camera interface
  if (showCamera && selectedChallenge) {
    const currentProgress = progress[selectedChallenge.id];
    const isFirstPhoto = !currentProgress || currentProgress.total_photos === 0;
    
    return (
      <CameraCapture
        challengeId={selectedChallenge.id}
        dayNumber={getNextDayNumber(selectedChallenge.id)}
        guideImageUrl={isFirstPhoto ? undefined : selectedChallenge.pose_guide_url}
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
            {challenges.map((challenge) => {
              const challengeProgress = progress[challenge.id];
              const progressPercentage = getProgressPercentage(challenge.id);
              const canTakePhoto = canTakePhotoToday(challenge.id);
              const nextPhotoStatus = getDaysUntilNextPhoto(challenge.id);
              const canMakeTimelapse = canGenerateTimelapse(challenge);
              
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
                          {challenge.end_date && (
                            <Badge variant="outline" className="text-xs">
                              Ends {formatShortDate(new Date(challenge.end_date))}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-4">
                          {challenge.description}
                        </p>
                        
                        {/* Progress Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Day</span>
                            </div>
                            <div className="font-bold">
                              {challengeProgress?.total_photos || 0}
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
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => startCamera(challenge)}
                          disabled={!canTakePhoto}
                          className="flex items-center gap-2"
                        >
                          <Camera className="h-4 w-4" />
                          {canTakePhoto ? 'Take Photo' : 'Photo Taken Today'}
                        </Button>
                        
                        {canMakeTimelapse && (
                          <Button
                            variant="outline"
                            onClick={() => openTimelapseDialog(challenge)}
                            className="flex items-center gap-2"
                          >
                            <Video className="h-4 w-4" />
                            Time-lapse
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {nextPhotoStatus}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Time-lapse Dialog */}
      <Dialog open={showTimelapseDialog} onOpenChange={setShowTimelapseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Time-lapse Video</DialogTitle>
            <DialogDescription>
              Generate a time-lapse video from your progress photos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {timelapseChallenge && (
              <>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Video className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">{timelapseChallenge.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {progress[timelapseChallenge.id]?.total_photos || 0} photos
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Challenge End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start mt-1">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedEndDate ? formatDate(selectedEndDate) : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedEndDate}
                        onSelect={setSelectedEndDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={updateChallengeEndDate}
                    variant="outline"
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Set End Date
                  </Button>
                  
                  <Button 
                    onClick={() => generateTimelapse(false)}
                    disabled={isGeneratingTimelapse}
                    className="flex-1"
                  >
                    {isGeneratingTimelapse ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Generate Now
                  </Button>
                </div>

                {canGenerateTimelapse(timelapseChallenge) && (
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Generate Early (10+ photos)
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          You can create your time-lapse now, but you'll lose 20% of earned Light points.
                        </p>
                        <Button 
                          onClick={() => generateTimelapse(true)}
                          disabled={isGeneratingTimelapse}
                          size="sm"
                          variant="outline"
                          className="mt-2"
                        >
                          Generate Early
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoChallenge;