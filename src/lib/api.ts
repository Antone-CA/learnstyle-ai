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

  if (res.status === 204) {
    return undefined as unknown as T;
  }

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
  varkScores?: {
    Visual: number;
    Auditory: number;
    'Read/Write': number;
    Kinesthetic: number;
  };
  assessmentHistory?: {
    date: string;
    style: string;
    score: number;
  }[];
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
  weeklyActivity: {
    day: string;
    assessments: number;
  }[];
}

export interface InstructorDashboardStudent {
  id: number;
  name: string;
  email: string;
  style: string | null;
  assessmentDate: string | null;
  last_score: number;
  section: string;
}

export interface InstructorDashboardData {
  studentCount: number;
  avgScore: number;
  students: InstructorDashboardStudent[];
  classDistribution: {
    name: string;
    value: number;
  }[];
  weeklyActivity: {
    day: string;
    assessments: number;
  }[];
}

export interface AdminDashboardUser {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  section: string;
  instructor_id: number | null;
  is_active_account: boolean;
}

export interface AdminDashboardData {
  users: AdminDashboardUser[];
  totalAssessments: number;
  weeklySystemActivity: {
    day: string;
    logins: number;
    assessments: number;
  }[];
}

export interface AssessmentHistoryItem {
  id: number;
  learning_style: string;
  match_percentage: number;
  score: number;
  vark_visual: number;
  vark_auditory: number;
  vark_readwrite: number;
  vark_kinesthetic: number;
  taken_at: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (
    email: string,
    password: string,
    role: 'student' | 'instructor' | 'admin'
  ) =>
    request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    }),

  register: (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'instructor' | 'admin'
  ) =>
    request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    }),
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const profileAPI = {
  get: () => request<APIUser>('/profile/'),

  patch: (data: Partial<APIUser>) =>
    request<APIUser>('/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
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

  history: () =>
    request<AssessmentHistoryItem[]>('/assessment/history/'),
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
    request<AdminDashboardUser>(`/admin/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};