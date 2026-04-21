import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI, type StudentDashboardData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, Flame, BookOpen, Zap, AlertCircle, ClipboardList
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

const FALLBACK_WEEKLY = [
  { day: 'Mon', assessments: 0 },
  { day: 'Tue', assessments: 0 },
  { day: 'Wed', assessments: 0 },
  { day: 'Thu', assessments: 0 },
  { day: 'Fri', assessments: 0 },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashData, setDashData] = useState<StudentDashboardData | null>(null);

  useEffect(() => {
    dashboardAPI.student()
      .then(setDashData)
      .catch(() => setDashData(null));
  }, []);

  const weeklyActivity = dashData?.weeklyActivity ?? FALLBACK_WEEKLY;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold text-[#1f2937]">
          {greeting()}, <span className="text-[#1d4ed8]">{user?.name?.split(' ')[0]}!</span>
        </h1>
        <p className="text-[#6b7280] mt-2">Track your learning progress and discover your unique style</p>
      </motion.div>

      {/* Stat Boxes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 gap-4"
      >
        <Card className="border-l-4 border-l-[#ef4444]">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[#6b7280] text-sm mb-1">🔥 Streak Days</p>
              <p className="font-display text-3xl font-bold text-[#1f2937]">{user?.streak || 0}</p>
            </div>
            <Flame className="h-8 w-8 text-[#ef4444] opacity-20" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#22c55e]">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[#6b7280] text-sm mb-1">📚 Lessons Completed</p>
              <p className="font-display text-3xl font-bold text-[#1f2937]">{user?.lessonsCompleted || 0}</p>
            </div>
            <BookOpen className="h-8 w-8 text-[#22c55e] opacity-20" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Learning Style Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="text-lg">🧠 Learning Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.learningStyle ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-[#1f2937]">{user.learningStyle}</p>
                    <p className="text-sm text-[#6b7280]">Your detected learning style</p>
                  </div>
                  <Badge className="bg-[#1d4ed8] text-white">{user.matchPercentage}%</Badge>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[#6b7280]">Match Confidence</span>
                    <span className="font-semibold text-[#1f2937]">{user.matchPercentage}%</span>
                  </div>
                  <Progress value={user.matchPercentage || 0} className="h-2 bg-[#e5e7eb]" />
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 text-[#f59e0b] mx-auto mb-3" />
                <p className="text-[#6b7280] mb-4">You haven't taken the assessment yet</p>
                <Button
                  onClick={() => navigate('/assessment')}
                  className="gradient-primary text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Activity Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#1d4ed8]" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Bar dataKey="assessments" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Course Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>📈 Course Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[#6b7280]">Overall Progress</span>
                <span className="font-semibold text-[#1f2937]">{user?.courseCompletion || 0}%</span>
              </div>
              <Progress value={user?.courseCompletion || 0} className="h-3 bg-[#e5e7eb]" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Assessment Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>🎯 Latest Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.lastScore ? (
              <>
                <div>
                  <p className="text-[#6b7280] text-sm mb-2">Last Score</p>
                  <p className="font-display text-2xl font-bold text-[#1d4ed8]">{user.lastScore}%</p>
                  <p className="text-xs text-[#6b7280] mt-1">Taken on {user.assessmentDate}</p>
                </div>
                <Button
                  onClick={() => navigate('/assessment')}
                  variant="outline"
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Retake Assessment
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/assessment')}
                className="w-full gradient-primary text-white"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Start Assessment
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
