export type KumonLevelId = 
  | '6A' | '5A' | '4A' | '3A' | '2A' 
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' 
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M';

export interface KumonLevelInfo {
  id: KumonLevelId;
  name: string;
  category: 'Pra-Sekolah' | 'SD Dasar' | 'SD Lanjut' | 'SMP Aljabar' | 'SMA Aljabar & Fungsi' | 'SMA Kalkulus';
  description: string;
  targetSkill: string;
  color: string;
  badgeIcon: string;
  order: number;
  standardTimeMinutes: number; // SCT (Standard Completion Time) per 10 questions
  totalWorksheets: number; // e.g. 10 sets per level
  sampleTopics: string[];
}

export type QuestionType = 'numeric' | 'fraction' | 'algebraic' | 'multiple_choice' | 'coordinate' | 'sequence';

export interface Question {
  id: string;
  levelId: KumonLevelId;
  worksheetNum: number;
  questionNumber: number;
  prompt: string; // Text prompt or instructional title
  mathFormula?: string; // Explicit LaTeX formula to display prominently
  isLatex?: boolean;
  isExample?: boolean;
  stepByStepSolution?: string[]; // Step-by-step hierarchical solution for example
  visualItems?: {
    type: 'dots' | 'apples' | 'stars' | 'blocks' | 'grid';
    count: number;
    subCount?: number;
  };
  options?: string[]; // for multiple choice if applicable
  correctAnswer: string; // standard normalized answer
  acceptableAnswers?: string[]; // alternative formats like "1/2" or "0.5" or "-3, 2"
  explanation: string;
  hints?: string[];
}

export interface WorksheetSessionResult {
  id: string;
  levelId: KumonLevelId;
  worksheetNum: number;
  timestamp: number;
  totalQuestions: number;
  correctCount: number;
  score: number; // 0-100
  timeSpentSeconds: number;
  standardTimeSeconds: number;
  isMastered: boolean; // score >= 90 and within target time
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    correctAnswer: string;
  }[];
}

export interface LevelProgress {
  levelId: KumonLevelId;
  unlocked: boolean;
  mastered: boolean;
  completedWorksheets: number[]; // e.g. [1, 2, 3]
  highestScores: Record<number, number>; // worksheetNum -> score
  bestTimes: Record<number, number>; // worksheetNum -> seconds
  attemptsCount: Record<number, number>;
  masteryDate?: number;
}

export type AccountStatus = 'pending' | 'approved' | 'rejected';

export interface UserAccount {
  username: string; // unique lowercase key
  name: string;
  password?: string;
  grade: string;
  school?: string;
  avatar: string;
  status: AccountStatus;
  role: 'student' | 'admin';
  createdAt: number;
  updatedAt?: number;
  approvedAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
  reviewedBy?: string;
  
  // Linked student learning progress
  startingLevel?: KumonLevelId | null;
  currentLevel?: KumonLevelId;
  pretestCompleted?: boolean;
  totalWorksheetsCompleted?: number;
  totalPoints?: number;
  streakDays?: number;
  lastStudyDate?: string;
  levelProgress?: Record<KumonLevelId, LevelProgress>;
}

export interface StudentProfile {
  username?: string;
  name: string;
  grade: string;
  school?: string;
  avatar: string;
  joinedDate: number;
  accessGranted: boolean;
  isAdmin?: boolean;
  isTrial?: boolean;
  pretestCompleted: boolean;
  startingLevel: KumonLevelId | null;
  currentLevel: KumonLevelId;
  totalWorksheetsCompleted: number;
  totalPoints: number;
  streakDays: number;
  lastStudyDate: string; // YYYY-MM-DD
}

export interface PretestQuestion {
  id: string;
  levelId: KumonLevelId;
  prompt: string;
  mathFormula?: string;
  isLatex?: boolean;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficultyOrder: number;
}

export interface PretestResult {
  completedAt: number;
  assignedLevel: KumonLevelId;
  score: number;
  total: number;
  breakdown: Record<string, { total: number; correct: number }>;
  studentName: string;
}
