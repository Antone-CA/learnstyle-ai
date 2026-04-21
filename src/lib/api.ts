const BASE_URL = 'http://127.0.0.1:8000/api';

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Network error: unable to reach API server');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || JSON.stringify(err));
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface APIUser {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  learning_style?: string;
  match_percentage?: number;
  last_score?: number;
  assessment_date?: string;
  streak?: number;
  lessons_completed?: number;
  course_completion?: number;
  varkScores?: { Visual: number; Auditory: number; 'Read/Write': number; Kinesthetic: number };
  assessmentHistory?: { date: string; style: string; score: number }[];
  section?: string;
  is_active_account?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: APIUser;
}

export interface StudentDashboardData {
  profile: APIUser;
  weeklyActivity: { day: string; assessments: number }[];
}

export interface InstructorDashboardData {
  studentCount: number;
  avgScore: number;
  students: {
    id: number;
    name: string;
    email: string;
    style: string | null;
    assessmentDate: string | null;
    last_score: number;
    section: string;
  }[];
  classDistribution: { name: string; value: number }[];
  weeklyActivity: { day: string; assessments: number }[];
}

export interface AdminDashboardData {
  users: {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    section: string;
    instructor_id: number | null;
    is_active_account: boolean;
  }[];
  totalAssessments: number;
  weeklySystemActivity: { day: string; logins: number; assessments: number }[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string) =>
    request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const profileAPI = {
  get: () => request<APIUser>('/profile/'),
  patch: (data: Partial<APIUser>) =>
    request<APIUser>('/profile/', { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Assessment ───────────────────────────────────────────────────────────────

export const assessmentAPI = {
  submit: (payload: {
    learningStyle: string;
    matchPercentage: number;
    score: number;
    varkScores: Record<string, number>;
  }) =>
    request<APIUser>('/assessment/submit/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  history: () => request<{ id: number; learning_style: string; score: number; taken_at: string }[]>(
    '/assessment/history/'
  ),
};

// ─── Dashboards ───────────────────────────────────────────────────────────────

export const dashboardAPI = {
  student: () => request<StudentDashboardData>('/student/dashboard/'),
  instructor: () => request<InstructorDashboardData>('/instructor/dashboard/'),
  admin: () => request<AdminDashboardData>('/admin/dashboard/'),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminAPI = {
  updateUser: (userId: number, data: Record<string, unknown>) =>
    request<AdminDashboardData['users'][0]>(`/admin/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
