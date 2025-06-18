


export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isVisible: boolean;
  status?: 'pass' | 'fail' | 'pending';
}

export interface Submission {
  id: string;
  questionId: string;
  userId: string;
  code: string;
  language: 'python' | 'java' | 'cpp';
  status: 'pending' | 'accepted' | 'wrong-answer' | 'time-limit-exceeded' | 'runtime-error';
  score: number;
  submittedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'creator';
}