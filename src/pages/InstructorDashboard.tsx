import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, Activity, ClipboardList, Download, BarChart3, Search
} from 'lucide-react';
import {
  PieChart, Pie, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { dashboardAPI, type InstructorDashboardData } from '@/lib/api';

const STYLE_COLORS: Record<string, string> = {
  Visual: '#6366f1',
  Auditory: '#8b5cf6',
  'Read/Write': '#a78bfa',
  Kinesthetic: '#c4b5fd',
  Unknown: '#d1d5db',
};

const FALLBACK_WEEKLY = [
  { day: 'Mon', assessments: 0 },
  { day: 'Tue', assessments: 0 },
  { day: 'Wed', assessments: 0 },
  { day: 'Thu', assessments: 0 },
  { day: 'Fri', assessments: 0 },
];

const InstructorDashboard = () => {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<InstructorDashboardData | null>(null);

  useEffect(() => {
    dashboardAPI
      .instructor()
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const assignedStudents = data?.students ?? [];
  const classDistribution = data?.classDistribution ?? [];
  const weeklyActivity = data?.weeklyActivity ?? FALLBACK_WEEKLY;
  const avgScore = data?.avgScore ?? 0;

  const filtered = assignedStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.section.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const csv = [
      'Name,Email,Section,Style,Assessment Date,Score',
      ...assignedStudents.map(
        (s) =>
          `${s.name},${s.email},${s.section},${s.style ?? ''},${s.assessmentDate ?? ''},${s.last_score}`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instructor_class_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sections = [...new Set(assignedStudents.map((s) => s.section).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-[#1f2937]">
          Instructor Dashboard
        </h1>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Class CSV
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          {
            icon: Users,
            label: 'Assigned Students',
            value: String(data?.studentCount ?? 0),
            color: '#6366f1',
          },
          {
            icon: ClipboardList,
            label: 'Assessments This Week',
            value: String(
              weeklyActivity.reduce((total, day) => total + day.assessments, 0)
            ),
            color: '#8b5cf6',
          },
          {
            icon: Activity,
            label: 'Avg Assessment Score',
            value: `${avgScore}%`,
            color: '#22c55e',
          },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Card className="shadow-card">
              <CardContent className="flex items-center gap-4 p-6">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">{label}</p>
                  <p className="font-display text-2xl font-bold text-[#1f2937]">
                    {value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#1d4ed8]" />
                Class Learning Style Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={classDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {classDistribution.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STYLE_COLORS[entry.name] ?? STYLE_COLORS.Unknown}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>Weekly Student Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="assessments"
                    stroke="#1d4ed8"
                    strokeWidth={2}
                    dot={{ fill: '#1d4ed8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>Instructor Views</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="students">Assigned Students</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4">
                <h3 className="font-semibold text-[#1f2937]">Recent Class Activity</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="h-2 w-2 rounded-full bg-[#1d4ed8]" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1f2937]">
                          Student {i} completed an assessment
                        </p>
                        <p className="text-xs text-[#6b7280]">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-4">
                <h3 className="font-semibold text-[#1f2937]">
                  Class Performance Metrics
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-[#f3f4f6] p-4">
                    <p className="text-sm text-[#6b7280]">Avg Completion Time</p>
                    <p className="text-lg font-bold text-[#1f2937]">—</p>
                  </div>
                  <div className="rounded-lg bg-[#f3f4f6] p-4">
                    <p className="text-sm text-[#6b7280]">Avg Assessment Score</p>
                    <p className="text-lg font-bold text-[#1f2937]">{avgScore}%</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="students">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                  <Input
                    placeholder="Search assigned students by name, email, or section..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-[#6b7280]">No students found.</p>
                  ) : (
                    filtered.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-[#f9fafb]"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#1f2937]">
                            {s.name}
                          </p>
                          <p className="text-xs text-[#6b7280]">{s.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-[#1d4ed8] text-white">
                            {s.section}
                          </Badge>
                          <p className="mt-1 text-xs text-[#6b7280]">
                            {s.style ?? 'N/A'} • {s.last_score}%
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sections">
              <div className="space-y-3">
                {sections.length === 0 ? (
                  <p className="text-sm text-[#6b7280]">No sections found.</p>
                ) : (
                  sections.map((section) => (
                    <div
                      key={section}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-[#1f2937]">{section}</p>
                        <p className="text-xs text-[#6b7280]">
                          {
                            assignedStudents.filter((s) => s.section === section)
                              .length
                          }{' '}
                          students
                        </p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;