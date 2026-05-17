import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  Users, Activity, ShieldCheck, UserPlus, Search, Layers3, BarChart3, Plus
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
  const [assignInstructorSection, setAssignInstructorSection] = useState('');
  const [assignSectionInstructorId, setAssignSectionInstructorId] = useState('');
  const [assignStudentToSectionId, setAssignStudentToSectionId] = useState('');
  const [assignSectionName, setAssignSectionName] = useState('');
  const [openCreateSection, setOpenCreateSection] = useState(false);
  const [createSectionName, setCreateSectionName] = useState('');
  const [createSectionInstructor, setCreateSectionInstructor] = useState('none');
  const [createSectionStatus, setCreateSectionStatus] = useState('active');
  const [createSectionCapacity, setCreateSectionCapacity] = useState('');

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

const sectionSummaries = useMemo(() => {
  const sectionNames = Array.from(
    new Set(
      [
        ...instructors.map((i) => i.section).filter(Boolean),
        ...students.map((s) => s.section).filter(Boolean),
      ]
        .map((name) => name.trim())
        .filter(Boolean)
    )
  );

  return sectionNames.map((section) => {
    const instructor =
      instructors.find((i) => i.section === section) ?? null;

    const sectionStudents = students.filter(
      (s) =>
        s.section === section &&
        s.name !== '__section_placeholder__'
    );

    return {
      section,
      instructor,
      students: sectionStudents,
      isActive: Boolean(instructor),
    };
  });
}, [instructors, students]);

  const sectionNames = sectionSummaries.map((s) => s.section);
  const availableStudents = students.filter(
  (s) =>
    s.role === 'student' &&
    s.name !== '__section_placeholder__'
  );
  const availableInstructors = instructors.filter((i) => i.role === 'instructor');
  const unassignedStudents = availableStudents.filter((s) => !s.section?.trim());
  const unassignedInstructors = availableInstructors.filter((i) => !i.section?.trim());

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

const createSection = async () => {
  if (!createSectionName.trim()) {
    toast({
      title: 'Error',
      description: 'Section name is required.',
    });
    return;
  }

  const instructorId =
    createSectionInstructor &&
    createSectionInstructor !== 'none'
      ? Number(createSectionInstructor)
      : null;

  try {
    if (instructorId) {
      await adminAPI.updateUser(instructorId, {
        section: createSectionName,
      });
    }

    setUsers((prev) => {
      let updatedUsers = prev.map((u) => {
        if (instructorId && u.id === instructorId) {
          return {
            ...u,
            section: createSectionName,
          };
        }

        return u;
      });

      if (!updatedUsers.some((u) => u.section === createSectionName)) {
        updatedUsers.push({
          id: Date.now(),
          name: '__section_placeholder__',
          email: 'placeholder@section.local',
          role: 'student',
          section: createSectionName,
          instructor_id: null,
          is_active_account: false,
        } as ManagedUser);
      }

      return updatedUsers;
    });

    setOpenCreateSection(false);
    setCreateSectionName('');
    setCreateSectionInstructor('none');
    setCreateSectionStatus('active');
    setCreateSectionCapacity('');

    toast({
      title: 'Section created',
      description: `Section "${createSectionName}" created successfully.`,
    });
  } catch (error) {
};
    try {
      if (instructorId) {
        await adminAPI.updateUser(instructorId, { section: createSectionName });
      }

      setUsers((prev) =>
        prev.map((u) => {
          if (instructorId && u.id === instructorId) {
            return { ...u, section: createSectionName };
          }
          return u;
        })
      );

      setOpenCreateSection(false);
      setCreateSectionName('');
      setCreateSectionInstructor('');
      setCreateSectionStatus('active');
      setCreateSectionCapacity('');

      toast({ title: 'Section created', description: `Section "${createSectionName}" created successfully.` });
    } catch (error) {
      console.error('Failed to create section', error);
      toast({ title: 'Creation failed', description: 'Unable to create the section.' });
    }
  };

  const assignInstructorToSection = async () => {
    if (!assignInstructorSection || !assignSectionInstructorId) return;

    const section = assignInstructorSection;
    const instructorId = Number(assignSectionInstructorId);
    const previousUsers = users;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.role === 'instructor') {
          if (u.id === instructorId) {
            return { ...u, section };
          }

          if (u.section === section) {
            return { ...u, section: '' };
          }
        }

        if (u.role === 'student' && u.section === section) {
          return { ...u, instructor_id: instructorId };
        }

        return u;
      })
    );

    try {
      const updated = await adminAPI.updateUser(instructorId, { section });
      setUsers((prev) =>
        prev.map((u) => (u.id === instructorId ? { ...u, ...updated } : u))
      );
      setAssignInstructorSection('');
      setAssignSectionInstructorId('');
      toast({ title: 'Instructor assigned', description: `Instructor assigned to ${section}.` });
    } catch (error) {
      console.error('Failed to assign instructor to section', error);
      setUsers(previousUsers);
      toast({ title: 'Assignment failed', description: 'Unable to assign the instructor to the section.' });
    }
  };

  const enrollStudentToSection = async () => {
    if (!assignStudentToSectionId || !assignSectionName) return;

    const studentId = Number(assignStudentToSectionId);
    const section = assignSectionName;
    const sectionInstructor = sectionSummaries.find((s) => s.section === section)?.instructor;
    const previousUsers = users;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === studentId
          ? {
              ...u,
              section,
              instructor_id: sectionInstructor?.id ?? null,
            }
          : u
      )
    );

    try {
      const updated = await adminAPI.updateUser(studentId, {
        section,
        instructor_id: sectionInstructor?.id ?? null,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === studentId ? { ...u, ...updated } : u))
      );
      setAssignStudentToSectionId('');
      setAssignSectionName('');
      toast({ title: 'Student enrolled', description: `${updated.name} enrolled to ${section}.` });
    } catch (error) {
      console.error('Failed to enroll student to section', error);
      setUsers(previousUsers);
      toast({ title: 'Enrollment failed', description: 'Unable to enroll the student in the section.' });
    }
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
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="shadow-card border">
                  <CardHeader>
                    <CardTitle className="text-lg">Assign Instructor to Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <Select value={assignInstructorSection} onValueChange={setAssignInstructorSection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionNames.map((section) => (
                            <SelectItem key={section} value={section}>{section}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Instructor</Label>
                      <Select value={assignSectionInstructorId} onValueChange={setAssignSectionInstructorId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an instructor" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableInstructors.map((i) => (
                            <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="gradient-primary text-white w-full" onClick={assignInstructorToSection}>
                      Assign Instructor
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-card border">
                  <CardHeader>
                    <CardTitle className="text-lg">Enroll Student to Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Student</Label>
                      <Select value={assignStudentToSectionId} onValueChange={setAssignStudentToSectionId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStudents.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <Select value={assignSectionName} onValueChange={setAssignSectionName}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionNames.map((section) => (
                            <SelectItem key={section} value={section}>{section}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="gradient-primary text-white w-full" onClick={enrollStudentToSection}>
                      Enroll Student
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sections">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#1f2937]">Sections ({sectionSummaries.length})</p>
                  </div>
                  <Dialog open={openCreateSection} onOpenChange={setOpenCreateSection}>
                    <DialogTrigger asChild>
                      <Button className="gradient-primary text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Create Section
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Section</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="section-name">Section Name</Label>
                          <Input
                            id="section-name"
                            placeholder="e.g., BSIT-r1"
                            value={createSectionName}
                            onChange={(e) => setCreateSectionName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="section-instructor">Assign Instructor (Optional)</Label>
                          <Select value={createSectionInstructor} onValueChange={setCreateSectionInstructor}>
                            <SelectTrigger id="section-instructor">
                              <SelectValue placeholder="Select an instructor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {availableInstructors.map((i) => (
                                <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="section-status">Status</Label>
                          <Select value={createSectionStatus} onValueChange={setCreateSectionStatus}>
                            <SelectTrigger id="section-status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                          <Button variant="outline" onClick={() => setOpenCreateSection(false)}>
                            Cancel
                          </Button>
                          <Button className="gradient-primary text-white" onClick={createSection}>
                            Create Section
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {sectionSummaries.length === 0 ? (
                  <p className="text-sm text-[#6b7280]">No sections found.</p>
                ) : (
                  <div className="space-y-3">
                    {sectionSummaries.map((section) => (
                      <Card key={section.section} className="border">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-[#1f2937]">{section.section}</p>
                              <Badge className={section.isActive ? 'bg-[#10b981] text-white' : 'bg-[#f97316] text-white'}>
                                {section.isActive ? 'Active' : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-sm text-[#6b7280]">
                              Instructor: {section.instructor?.name ?? 'Unassigned'}
                            </p>
                            <p className="text-sm text-[#6b7280]">
                              Students: {section.students.length}
                            </p>
                            {section.students.length > 0 && (
                              <ul className="mt-3 space-y-1 text-sm">
                                {section.students.map((s) => (
                                  <li key={s.id} className="text-[#6b7280]">• {s.name}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {(unassignedStudents.length > 0 || unassignedInstructors.length > 0) && (
                  <Card className="border border-dashed bg-slate-50">
                    <CardContent className="pt-6">
                      <p className="text-sm font-semibold text-[#1f2937] mb-3">Unassigned Users</p>
                      {unassignedInstructors.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-[#6b7280] mb-1">Instructors:</p>
                          <p className="text-sm text-[#1f2937]">{unassignedInstructors.map((i) => i.name).join(', ')}</p>
                        </div>
                      )}
                      {unassignedStudents.length > 0 && (
                        <div>
                          <p className="text-xs text-[#6b7280] mb-1">Students:</p>
                          <p className="text-sm text-[#1f2937]">{unassignedStudents.map((s) => s.name).join(', ')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
