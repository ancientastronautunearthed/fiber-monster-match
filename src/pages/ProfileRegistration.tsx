import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProfileRegistration as ProfileRegistrationForm } from '@/components/ProfileRegistration';

const ProfileRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleComplete = () => {
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <ProfileRegistrationForm onComplete={handleComplete} />
      </div>
    </div>
  );
};

export default ProfileRegistration;