import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, LogOut, Edit2, Zap, BookOpen, Trophy, Target } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');

  const handleUpdateName = () => {
    updateProfile({ name: editName });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const profileGrid = [
    { icon: '🧠', label: 'Learning Style', value: user.learningStyle || 'Not yet assessed' },
    { icon: '📊', label: 'Match %', value: `${user.matchPercentage || 0}%` },
    { icon: '🎯', label: 'Last Score', value: user.lastScore ? `${user.lastScore}%` : 'N/A' },
    { icon: '🔥', label: 'Streak', value: `${user.streak || 0} days` },
    { icon: '📚', label: 'Lessons', value: `${user.lessonsCompleted || 0} completed` },
    { icon: '📈', label: 'Course %', value: `${user.courseCompletion || 0}%` },
    { icon: '⚡', label: 'Assessment Date', value: user.assessmentDate || 'Pending' },
    { icon: '✨', label: 'Profile Level', value: 'Learner' },
    { icon: '🏆', label: 'Status', value: 'Active' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1d4ed8] to-[#1e3a8a] pt-24 pb-12">
      <div className="container max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/student')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="font-display text-3xl font-bold text-white">Student Profile</h1>
          <div className="w-24" />
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-elevated p-8 mb-8"
        >
          {/* Avatar & Name */}
          <div className="flex items-center gap-6 mb-8">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#4f46e5] flex items-center justify-center text-white text-3xl font-bold">
              {initials}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Label>Name</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Your name"
                      className="flex-1"
                    />
                    <Button onClick={handleUpdateName} size="sm" className="gradient-primary">
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      size="sm"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl font-bold text-[#1f2937]">{user.name}</h2>
                  <p className="text-[#6b7280]">{user.email}</p>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-[#1d4ed8]"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit Profile
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Daily Insight */}
          {user.learningStyle && (
            <Card className="mb-8 border-l-4 border-l-[#22c55e] bg-[#f0fdf4]">
              <CardContent className="pt-6">
                <p className="text-[#1f2937] font-semibold mb-2">💡 Daily Insight</p>
                <p className="text-[#6b7280]">
                  As a <strong>{user.learningStyle}</strong> learner, try using{' '}
                  {user.learningStyle === 'Visual' && 'mind maps and diagrams to organize concepts'}
                  {user.learningStyle === 'Auditory' && 'discussion groups and recorded explanations'}
                  {user.learningStyle === 'Read/Write' && 'detailed notes and written summaries'}
                  {user.learningStyle === 'Kinesthetic' && 'hands-on projects and practical examples'} today!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Assessment Warning */}
          {!user.learningStyle && (
            <Card className="mb-8 border-l-4 border-l-[#fef3c7] bg-[#fffbeb]">
              <CardContent className="pt-6">
                <p className="text-[#1f2937] font-semibold mb-2">⚠️ Get Started</p>
                <p className="text-[#6b7280] mb-3">
                  You haven't taken the assessment yet. Complete it now to discover your learning style and get personalized insights.
                </p>
                <Button
                  onClick={() => navigate('/assessment')}
                  size="sm"
                  className="gradient-primary text-white"
                >
                  Take Assessment
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Profile Summary Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {profileGrid.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-white rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow"
            >
              <p className="text-3xl mb-2">{item.icon}</p>
              <p className="text-sm text-[#6b7280] mb-1">{item.label}</p>
              <p className="font-bold text-[#1f2937] text-lg">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4"
        >
          <Button
            onClick={() => navigate('/assessment')}
            className="flex-1 gradient-primary text-white font-semibold py-6 rounded-lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            Retake Assessment
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex-1 border-red-200 text-[#dc2626] hover:bg-red-50 font-semibold py-6 rounded-lg"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProfile;
