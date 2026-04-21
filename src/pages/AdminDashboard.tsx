import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, Activity, ShieldCheck, UserPlus, Search, Layers3, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { dashboardAPI, adminAPI, type AdminDashboardData } from '@/lib/api';

type Role = 'student' | 'instructor' | 'admin';

type ManagedUser = AdminDashboardData['users'][0];

const ROLE_COLORS: Record<Role, string> = {
  student: '#1d4ed8',
  instructor: '#8b5cf6',
  admin: '#059669',
};

const FALLBACK_WEEKLY = [
  { day: 'Mon', logins: 0, assessments: 0 },
  { day: 'Tue', logins: 0, assessments: 0 },
  { day: 'Wed', logins: 0, assessments: 0 },
  { day: 'Thu', logins: 0, assessments: 0 },
  { day: 'Fri', logins: 0, assessments: 0 },
];

const AdminDashboard = () => {
  const [apiData, setApiData] = useState<AdminDashboardData | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [query, setQuery] = useState('');
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignInstructorId, setAssignInstructorId] = useState('');

  useEffect(() => {
    dashboardAPI.admin().then((data) => {
      setApiData(data);
      setUsers(data.users);
    }).catch(() => {});
  }, []);

  const weeklySystemActivity = apiData?.weeklySystemActivity ?? FALLBACK_WEEKLY;
  const totalAssessments = apiData?.totalAssessments ?? 0;

  const instructors = useMemo(
    () => users.filter((u) => u.role === 'instructor'),
    [users]
  );

  const students = useMemo(
    () => users.filter((u) => u.role === 'student'),
    [users]
  );

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase()) ||
          u.role.toLowerCase().includes(query.toLowerCase()) ||
          (u.section ?? '').toLowerCase().includes(query.toLowerCase())
      ),
    [users, query]
  );

  const roleDistribution = useMemo(
    () => [
      { name: 'Students', value: students.length, color: ROLE_COLORS.student },
      { name: 'Instructors', value: instructors.length, color: ROLE_COLORS.instructor },
      { name: 'Admins', value: users.filter((u) => u.role === 'admin').length, color: ROLE_COLORS.admin },
    ],
    [students.length, instructors.length, users]
  );

  const updateRole = (userId: number, role: Role) => {
    adminAPI.updateUser(userId, { role }).then((updated) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
    }).catch(() => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    });
  };

  const toggleUserStatus = (userId: number) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newStatus = !target.is_active_account;
    adminAPI.updateUser(userId, { is_active_account: newStatus }).then((updated) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
    }).catch(() => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active_account: newStatus } : u)));
    });
  };

  const assignStudentToInstructor = () => {
    if (!assignStudentId || !assignInstructorId) return;
    adminAPI.updateUser(Number(assignStudentId), { instructorId: Number(assignInstructorId) }).then((updated) => {
      setUsers((prev) => prev.map((u) => (u.id === Number(assignStudentId) ? { ...u, ...updated } : u)));
    }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-[#1f2937]">System Admin Dashboard</h1>
        <Badge className="bg-[#059669] text-white">Full Access</Badge>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Users', value: users.length, color: '#1d4ed8' },
          { icon: UserPlus, label: 'Total Students', value: students.length, color: '#6366f1' },
          { icon: ShieldCheck, label: 'Total Instructors', value: instructors.length, color: '#8b5cf6' },
          { icon: Activity, label: 'Assessments', value: totalAssessments, color: '#22c55e' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <Card className="shadow-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="h-11 w-11 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">{label}</p>
                  <p className="font-display text-2xl font-bold text-[#1f2937]">{value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#1d4ed8]" />
              User Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={roleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                  {roleDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>Overall Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklySystemActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="logins" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="assessments" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>Platform Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="assignment">Assignments</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
                  <Input
                    placeholder="Search users by name, email, role, or section..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#1f2937]">{u.name}</p>
                        <p className="text-xs text-[#6b7280]">{u.email} • {u.section}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={u.role}
                          onValueChange={(value: Role) => updateRole(u.id, value)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">student</SelectItem>
                            <SelectItem value="instructor">instructor</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => toggleUserStatus(u.id)}>
                          {u.is_active_account ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assignment">
              <div className="space-y-4">
                <h3 className="font-semibold text-[#1f2937]">Assign Students to Instructors</h3>
                <div className="grid md:grid-cols-3 gap-3 items-end">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <Select value={assignStudentId} onValueChange={setAssignStudentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Instructor</Label>
                    <Select value={assignInstructorId} onValueChange={setAssignInstructorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map((i) => (
                          <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="gradient-primary text-white" onClick={assignStudentToInstructor}>Assign</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sections">
              <div className="space-y-3">
                {instructors.map((instructor) => {
                  const sectionStudents = students.filter((s) => s.instructor_id === instructor.id);
                  return (
                    <div key={instructor.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#1f2937]">{instructor.section || 'No Section'}</p>
                        <p className="text-xs text-[#6b7280]">
                          Instructor: {instructor.name} • Students: {sectionStudents.length}
                        </p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  );
                })}
                {instructors.length === 0 && (
                  <p className="text-sm text-[#6b7280]">No sections found.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="permissions">
              <div className="space-y-3">
                {[
                  { role: 'student', permissions: 'Take assessments, view own dashboard and profile' },
                  { role: 'instructor', permissions: 'View assigned students, class analytics, and sections' },
                  { role: 'admin', permissions: 'Full control: users, roles, sections, assignments, analytics' },
                ].map((perm) => (
                  <div key={perm.role} className="p-3 border rounded-lg">
                    <p className="font-medium text-[#1f2937] capitalize">{perm.role}</p>
                    <p className="text-xs text-[#6b7280] mt-1">{perm.permissions}</p>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" className="gap-2">
                    <Layers3 className="h-4 w-4" />
                    Update Permission Matrix
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
