export type MemoryCategory =
  | 'personal'
  | 'work'
  | 'education'
  | 'project'
  | 'idea'
  | 'preference'
  | 'other';

export type GoalStatus = 'active' | 'completed' | 'archived';

export type ActionStatus = 'pending' | 'completed' | 'dismissed';

export type InsightType = 'pattern' | 'summary' | 'recommendation';

export interface Memory {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  sourceConversationId?: string;
  createdAt: string;
  updatedAt?: string;
  uid: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  deadline?: string;
  createdAt: string;
  updatedAt?: string;
  uid: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: ActionStatus;
  dueDate?: string;
  goalId?: string;
  goalTitle?: string;
  createdAt: string;
  updatedAt?: string;
  uid: string;
}

export interface Insight {
  id: string;
  title: string;
  content: string;
  type: InsightType;
  createdAt: string;
  uid: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string;
  uid: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface ExtractedMemoryProposal {
  title: string;
  content: string;
  category: MemoryCategory;
  approved?: boolean;
}

export interface ExtractedGoalProposal {
  title: string;
  description: string;
  deadline?: string;
  approved?: boolean;
}

export interface ExtractedActionProposal {
  title: string;
  description: string;
  dueDate?: string;
  goalTitle?: string;
  approved?: boolean;
}

export interface ExtractionResult {
  memories: ExtractedMemoryProposal[];
  goals: ExtractedGoalProposal[];
  actions: ExtractedActionProposal[];
}

export type AppView =
  | 'dashboard'
  | 'workspace'
  | 'memories'
  | 'goals'
  | 'actions'
  | 'insights'
  | 'history'
  | 'security';
