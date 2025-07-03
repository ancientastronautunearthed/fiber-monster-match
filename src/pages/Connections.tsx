import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePoints } from '@/hooks/usePoints';
import CompatibilityCrystal from '@/components/CompatibilityCrystal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Heart, ArrowLeft, Users, Sparkles, MessageCircle } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  monster_keywords: string[] | null;
  symptoms: string[] | null;
  likes: string[] | null;
  dislikes: string[] | null;
  bio: string | null;
}

const Connections = () => {
  const { user } = useAuth();
  const { awardLight } = usePoints();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchMatchingProfiles();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }

    setUserProfile(data);
  };

  const fetchMatchingProfiles = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user.id)
      .not('monster_keywords', 'is', null);

    if (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load connections. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setProfiles(data || []);
    setLoading(false);
  };

  const calculateMatchScore = (profile: Profile) => {
    if (!userProfile || !userProfile.monster_keywords || !profile.monster_keywords) {
      return 0;
    }

    let totalScore = 0;
    let totalCategories = 0;

    // Monster keywords matching (40% weight)
    const userKeywords = userProfile.monster_keywords || [];
    const profileKeywords = profile.monster_keywords || [];
    if (userKeywords.length > 0 && profileKeywords.length > 0) {
      const commonKeywords = userKeywords.filter(keyword => profileKeywords.includes(keyword));
      const keywordScore = (commonKeywords.length / Math.max(userKeywords.length, profileKeywords.length)) * 100;
      totalScore += keywordScore * 0.4;
      totalCategories += 0.4;
    }

    // Symptoms matching (25% weight)
    const userSymptoms = userProfile.symptoms || [];
    const profileSymptoms = profile.symptoms || [];
    if (userSymptoms.length > 0 && profileSymptoms.length > 0) {
      const commonSymptoms = userSymptoms.filter(symptom => profileSymptoms.includes(symptom));
      const symptomScore = (commonSymptoms.length / Math.max(userSymptoms.length, profileSymptoms.length)) * 100;
      totalScore += symptomScore * 0.25;
      totalCategories += 0.25;
    }

    // Likes matching (20% weight)
    const userLikes = userProfile.likes || [];
    const profileLikes = profile.likes || [];
    if (userLikes.length > 0 && profileLikes.length > 0) {
      const commonLikes = userLikes.filter(like => profileLikes.includes(like));
      const likesScore = (commonLikes.length / Math.max(userLikes.length, profileLikes.length)) * 100;
      totalScore += likesScore * 0.2;
      totalCategories += 0.2;
    }

    // Dislikes matching (15% weight) - shared dislikes are good for compatibility
    const userDislikes = userProfile.dislikes || [];
    const profileDislikes = profile.dislikes || [];
    if (userDislikes.length > 0 && profileDislikes.length > 0) {
      const commonDislikes = userDislikes.filter(dislike => profileDislikes.includes(dislike));
      const dislikesScore = (commonDislikes.length / Math.max(userDislikes.length, profileDislikes.length)) * 100;
      totalScore += dislikesScore * 0.15;
      totalCategories += 0.15;
    }

    return totalCategories > 0 ? Math.round(totalScore / totalCategories) : 0;
  };

  const getCommonKeywords = (profile: Profile) => {
    if (!userProfile || !userProfile.monster_keywords || !profile.monster_keywords) {
      return [];
    }
    return userProfile.monster_keywords.filter(keyword => profile.monster_keywords!.includes(keyword));
  };

  const generateIcebreaker = (profile: Profile) => {
    const commonKeywords = getCommonKeywords(profile);
    if (commonKeywords.length === 0) {
      const fallbacks = [
        "My monster thinks your monster has excellent taste in humans.",
        "Our monsters are giving each other the mysterious nod of recognition.",
        "My monster whispered that yours looks like they know where the good snacks are hidden.",
        "Your monster caught my monster's attention from across the digital room.",
        "My monster says yours has 'main character energy' and wants to collaborate."
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    
    const randomKeyword = commonKeywords[Math.floor(Math.random() * commonKeywords.length)];
    
    // Witty responses based on specific keywords
    const wittyResponses: Record<string, string[]> = {
      'Storm Chaser': [
        `Both our monsters are storm chasers? Mine's been bragging about that time it rode a lightning bolt. Yours probably has better stories though.`,
        `My monster spotted another storm chaser and immediately started planning a meteorological adventure. Bring snacks?`,
        `Two storm chasers? Our monsters are basically the dynamic duo of atmospheric drama.`
      ],
      'Night Owl': [
        `My monster noticed we're both night owls. It's currently judging me for my 3 AM life choices. Yours too?`,
        `Fellow night owl detected! My monster suggests we start a support group for humans who think midnight is lunch time.`,
        `My monster and yours should form a nocturnal alliance. They can judge our sleep schedules together.`
      ],
      'Pattern Seeker': [
        `Both pattern seekers? My monster is having an existential crisis about whether this connection was... predetermined. 🤔`,
        `My monster found another pattern seeker and is now convinced this meeting was written in the cosmic algorithm.`,
        `Two pattern seekers walk into a chat room... my monster insists there's definitely a pattern here.`
      ],
      'Mind Palace Builder': [
        `My monster heard you also build mind palaces. It wants to know if yours has better interior decorating.`,
        `Fellow mind palace architect! My monster suggests a house tour. Warning: mine has questionable feng shui.`,
        `Two mind palaces in one conversation? My monster is already planning the neighborhood association meetings.`
      ],
      'Reality Questioner': [
        `My monster found another reality questioner and immediately started an existential debate about whether this conversation is real.`,
        `Both questioning reality? My monster thinks we should form a philosophical discussion group. Or maybe we already have?`,
        `Two reality questioners? My monster is now questioning whether it's questioning reality or reality is questioning it.`
      ],
      'Comfort Ritual Master': [
        `Fellow ritual master detected! My monster wants to trade comfort ritual recipes. It's been hoarding the good ones.`,
        `My monster respectfully bows to another ritual master. It suggests we compare our sacred comfort protocols.`,
        `Two ritual masters? My monster is practically vibrating with excitement about potential ritual collaborations.`
      ]
    };

    const responses = wittyResponses[randomKeyword];
    if (responses) {
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Generic witty fallbacks for other keywords
    const genericWitty = [
      `My monster spotted "${randomKeyword}" in your profile and immediately perked up. It's been waiting for this moment.`,
      `"${randomKeyword}"? My monster just whispered "finally, someone who gets it" and did a little happy dance.`,
      `My monster saw "${randomKeyword}" and started cackling with glee. I think it found its people.`,
      `Both "${randomKeyword}"? My monster is convinced we're part of some cosmic inside joke.`,
      `My monster noticed "${randomKeyword}" and immediately started planning elaborate scenarios. Should I be worried?`
    ];
    
    return genericWitty[Math.floor(Math.random() * genericWitty.length)];
  };

  const sortedProfiles = profiles
    .map(profile => ({ ...profile, matchScore: calculateMatchScore(profile) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Finding your connections...</p>
        </div>
      </div>
    );
  }

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
              <Users className="h-6 w-6 text-pink-500" />
              <h1 className="text-xl font-bold">Find Connections</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">
              {sortedProfiles.length} potential connections
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Your Monster Connections</h2>
          <p className="text-lg text-muted-foreground">
            Discover others whose monsters share similar traits and experiences
          </p>
        </div>

        {!userProfile?.monster_keywords && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-pink-500" />
              <h3 className="text-xl font-semibold mb-2">Create Your Monster First</h3>
              <p className="text-muted-foreground mb-4">
                You need to create your Romantic Morgellons Monster before you can find connections.
              </p>
              <Button 
                onClick={() => navigate('/create-monster')}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                Create Monster
              </Button>
            </CardContent>
          </Card>
        )}

        {userProfile?.monster_keywords && (
          <div className="space-y-6">
            {sortedProfiles.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Connections Yet</h3>
                  <p className="text-muted-foreground">
                    Be the first! More users will join soon and you'll find your connections.
                  </p>
                </CardContent>
              </Card>
            ) : (
              sortedProfiles.map((profile) => {
                const commonKeywords = getCommonKeywords(profile);
                const icebreaker = generateIcebreaker(profile);
                
                return (
                  <Card key={profile.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-lg bg-gradient-to-r from-pink-200 to-purple-200">
                              {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-xl">
                              {profile.display_name || profile.username || 'Anonymous User'}
                            </CardTitle>
                            <CardDescription>
                              {profile.username && `@${profile.username}`}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <CompatibilityCrystal 
                            matchScore={profile.matchScore} 
                            className="flex-shrink-0"
                          />
                          <Badge 
                            variant="secondary" 
                            className="bg-gradient-to-r from-pink-100 to-purple-100 text-primary font-semibold"
                          >
                            {profile.matchScore}% match
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {profile.bio && (
                        <p className="text-muted-foreground mb-4">{profile.bio}</p>
                      )}
                      
                      {commonKeywords.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Shared Monster Traits:</h4>
                          <div className="flex flex-wrap gap-2">
                            {commonKeywords.map((keyword) => (
                              <Badge key={keyword} variant="outline" className="border-pink-200">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg mb-4">
                        <div className="flex items-start gap-2">
                          <MessageCircle className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-purple-700">Monster Icebreaker:</p>
                            <p className="text-sm text-purple-600 italic">"{icebreaker}"</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                          onClick={async () => {
                            // Create match record
                            const compatibility = calculateMatchScore(profile);
                            const reasons = getCommonKeywords(profile);
                            
                            const { data, error } = await supabase
                              .from('matches')
                              .insert({
                                user1_id: user?.id,
                                user2_id: profile.user_id,
                                compatibility_score: compatibility,
                                match_reason: reasons,
                                connection_status: 'pending'
                              })
                              .select();

                            if (error) throw error;

                            // Award Light for forging an alliance (first message)
                            if (data && data[0]) {
                              await awardLight(
                                'forge_alliance',
                                20, // As specified in your points system
                                data[0].id.toString(),
                                'connection_made',
                                {
                                  target_user_id: profile.user_id,
                                  compatibility_score: compatibility,
                                  match_reasons: reasons
                                }
                              );
                            }

                            toast({
                              title: "Alliance Forged!",
                              description: `Connection made with ${profile.display_name}! +20 Light earned.`,
                            });

                            navigator.clipboard.writeText(icebreaker);
                            toast({
                              title: "Icebreaker Copied!",
                              description: "Start your conversation with this message!"
                            });
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Connect & Use Icebreaker
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Connections;