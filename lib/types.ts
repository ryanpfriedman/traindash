export type CourseFormat = 'slideshow' | 'manual' | 'cards' | 'script' | 'quiz' | 'simulation';
export type ResearchMode = 'pdf-only' | 'pdf-plus-research' | 'research-only';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type AppRole = 'creator' | 'learner';

export interface BrandSettings {
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  hrEmail?: string;
}

export interface ApiSettings {
  provider: 'openai' | 'anthropic' | 'google';
  apiKey: string;
  model: string;
}

export interface StorageSettings {
  savePdfs: boolean;
}

export interface AppSettings {
  api: ApiSettings;
  brand: BrandSettings;
  storage: StorageSettings;
  role: AppRole;
  orgShareToken?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  bulletPoints: string[];
  speakerNotes: string;
  imagePrompt?: string;
}

export interface FlashCard {
  id: string;
  front: string;
  back: string;
  category: string;
}

export interface ScriptScene {
  id: string;
  sceneTitle: string;
  narration: string;
  visualCue: string;
  duration: string;
}

export interface AIRoleplay {
  persona: string;
  objective: string;
  openingMessage: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  slides: Slide[];
  manualContent: string;
  cards: FlashCard[];
  scriptScenes: ScriptScene[];
  quiz: QuizQuestion[];
  aiRoleplay?: AIRoleplay;
  estimatedMinutes: number;
}

export interface CourseOutlineItem {
  id: string;
  title: string;
  description: string;
  keyTopics: string[];
  order: number;
}

export interface UploadedPdf {
  id: string;
  name: string;
  content: string;
  storedUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  topic: string;
  status: CourseStatus;
  formats: CourseFormat[];
  researchMode: ResearchMode;
  lessons: Lesson[];
  outline: CourseOutlineItem[];
  uploadedPdfs: UploadedPdf[];
  researchReport: string;
  brandSnapshot: BrandSettings;
  createdAt: string;
  updatedAt: string;
  totalEstimatedMinutes: number;
  shareToken: string;
}

export interface LearnerProgress {
  courseId: string;
  lessonProgress: Record<string, LessonProgress>;
  startedAt: string;
  completedAt?: string;
  overallPercent: number;
}

export interface LessonProgress {
  lessonId: string;
  viewed: boolean;
  quizCompleted: boolean;
  quizScore: number;
  quizTotal: number;
  completedAt?: string;
}

export interface WizardState {
  step: number;
  topic: string;
  uploadedPdfs: UploadedPdf[];
  researchMode: ResearchMode;
  researchReport: string;
  outline: CourseOutlineItem[];
  selectedFormats: CourseFormat[];
  generatedCourse: Course | null;
}
