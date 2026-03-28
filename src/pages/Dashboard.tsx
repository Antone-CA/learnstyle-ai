import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Award, BarChart3, Users, Activity, Download, Search,
  TrendingUp, Cpu, ClipboardList
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const STYLE_COLORS: Record<string, string> = {
  Visual: '#6366f1',
  Auditory: '#8b5cf6',
  'Read/Write': '#a78bfa',
  Kinesthetic: '#c4b5fd',
};

const mockStudents = [
  { name: 'Alice Johnson', email: 'alice@uni.edu', style: 'Visual', date: '2026-03-25' },
  { name: 'Bob Smith', email: 'bob@uni.edu', style: 'Auditory', date: '2026-03-24' },
  { name: 'Clara Lee', email: 'clara@uni.edu', style: 'Read/Write', date: '2026-03-23' },
  { name: 'David Park', email: 'david@uni.edu', style: 'Kinesthetic', date: '2026-03-22' },
  { name: 'Eva Chen', email: 'eva@uni.edu', style: 'Visual', date: '2026-03-21' },
];

const classDistribution = [
  { name: 'Visual', value: 35 },
  { name: 'Auditory', value: 25 },
  { name: 'Read/Write', value: 22 },
  { name: 'Kinesthetic', value: 18 },
];

const weeklyActivity = [
  { week: 'W1', assessments: 3 },
  { week: 'W2', assessments: 5 },
  { week: 'W3', assessments: 4 },
  { week: 'W4', assessments: 7 },
  { week: 'W5', assessments: 6 },
  { week: 'W6', assessments: 9 },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const style = user?.learningStyle || 'Not assessed';
  const score = user?.confidenceScore || 0;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">My Dashboard</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Learning Style Badge */}
        <Card className="md:col-span-1 shadow-card border-border">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 h-20 w-20 rounded-full gradient-primary flex items-center justify-center">
              <Award className="h-10 w-10 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-1">
              {style === 'Not assessed' ? 'Not Assessed Yet' : `${style} Learner`}
            </h3>
            {score > 0 && (
              <Badge variant="secondary" className="mt-2 text-sm">
                {score}% Match
              </Badge>
            )}
            <Button onClick={() => navigate('/assessment')} className="mt-6 gradient-primary text-primary-foreground w-full">
              <ClipboardList className="mr-2 h-4 w-4" /> Take Assessment
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="md:col-span-2 shadow-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Bar dataKey="assessments" fill="hsl(238, 60%, 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Assessment History */}
      {user?.assessmentHistory && user.assessmentHistory.length > 0 && (
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-lg">Assessment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.assessmentHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm text-foreground">{h.style} Learner</span>
                  <Badge variant="outline">{h.score}%</Badge>
                  <span className="text-xs text-muted-foreground">{h.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [search, setSearch] = useState('');

  const filtered = mockStudents.filter(
    s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const csv = ['Name,Email,Style,Date', ...mockStudents.map(s => `${s.name},${s.email},${s.style},${s.date}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learnstyle_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">Faculty Dashboard</h2>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Active Users Today', value: '142' },
          { icon: Activity, label: 'Assessments This Week', value: '87' },
          { icon: Cpu, label: 'ML Inference Latency', value: '23ms' },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="shadow-card border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-display text-xl font-bold text-foreground">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + Table */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Class Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={classDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {classDistribution.map((entry) => (
                    <Cell key={entry.name} fill={STYLE_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-lg">Student Roster</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filtered.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{s.style}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{s.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  if (!isLoggedIn) {
    navigate('/auth?mode=login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['Student', 'Admin'] as const).map(v => (
              <button
                key={v}
                onClick={() => setIsAdmin(v === 'Admin')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  (v === 'Admin') === isAdmin ? 'gradient-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {isAdmin ? <AdminDashboard /> : <StudentDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
