import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Heart, Users, Sparkles } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            <h1 className="text-xl font-bold">Fiber Companion</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-12 w-12 text-pink-500" />
            <Sparkles className="h-8 w-8 text-purple-500" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Welcome to Fiber Companion</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with others who understand your journey. Create your Romantic Morgellons Monster 
            and find meaningful connections based on shared experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur rounded-lg p-6 border border-border">
            <Heart className="h-8 w-8 text-pink-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Create Your Monster</h3>
            <p className="text-muted-foreground mb-4">
              Design your unique Romantic Morgellons Monster persona to represent your inner self.
            </p>
            <Button 
              onClick={() => navigate('/create-monster')}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              Create Monster
            </Button>
          </div>
          
          <div className="bg-white/60 backdrop-blur rounded-lg p-6 border border-border">
            <Users className="h-8 w-8 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Find Connections</h3>
            <p className="text-muted-foreground mb-4">
              Match with others based on similar symptoms, experiences, and interests.
            </p>
            <Button 
              onClick={() => navigate('/connections')}
              variant="outline" 
              className="w-full"
            >
              Find Connections
            </Button>
          </div>
          
          <div className="bg-white/60 backdrop-blur rounded-lg p-6 border border-border">
            <Sparkles className="h-8 w-8 text-indigo-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interactive Fun</h3>
            <p className="text-muted-foreground mb-4">
              Play games, solve riddles, and chat with both users and their monster personas.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
