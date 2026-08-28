import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import type {
  Memory,
  Goal,
  ActionItem,
  Insight,
  Conversation,
  ChatMessage,
} from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Synchronizes the user profile metadata into Firestore (/users/{uid})
 */
export const syncUserProfile = async (user: User): Promise<void> => {
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        email: user.email || '',
        displayName: user.displayName || 'LifeOS User',
        photoURL: user.photoURL || '',
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not sync user profile record to Firestore:', err);
  }
};

/**
 * Initiates Google OAuth Sign-In via redirect (avoiding browser popup blocking)
 */
export const signInWithGoogle = async (): Promise<void> => {
  await signInWithRedirect(auth, googleProvider);
};

/**
 * Handles processing the redirect result after the user returns to the application
 */
export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      await syncUserProfile(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Redirect sign-in error:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

// ==================== FIRESTORE HELPERS (Strictly User Isolated) ====================

export const getAuthToken = async (): Promise<string | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return await currentUser.getIdToken();
};

// Memories
export const fetchMemories = async (uid: string): Promise<Memory[]> => {
  const memoriesRef = collection(db, 'users', uid, 'memories');
  const q = query(memoriesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Memory, 'id'>),
  }));
};

export const saveMemory = async (
  uid: string,
  memory: Omit<Memory, 'id' | 'uid' | 'createdAt'>,
  id?: string
): Promise<string> => {
  const targetId = id || doc(collection(db, 'users', uid, 'memories')).id;
  const memoryRef = doc(db, 'users', uid, 'memories', targetId);
  const now = new Date().toISOString();
  await setDoc(
    memoryRef,
    {
      title: memory.title.trim(),
      content: memory.content.trim(),
      category: memory.category,
      sourceConversationId: memory.sourceConversationId || '',
      createdAt: now,
      updatedAt: now,
      uid,
    },
    { merge: true }
  );
  return targetId;
};

export const updateMemory = async (
  uid: string,
  id: string,
  updates: Partial<Omit<Memory, 'id' | 'uid'>>
): Promise<void> => {
  const memoryRef = doc(db, 'users', uid, 'memories', id);
  await updateDoc(memoryRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteMemoryDoc = async (uid: string, id: string): Promise<void> => {
  const memoryRef = doc(db, 'users', uid, 'memories', id);
  await deleteDoc(memoryRef);
};

// Goals
export const fetchGoals = async (uid: string): Promise<Goal[]> => {
  const goalsRef = collection(db, 'users', uid, 'goals');
  const q = query(goalsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Goal, 'id'>),
  }));
};

export const saveGoal = async (
  uid: string,
  goal: Omit<Goal, 'id' | 'uid' | 'createdAt'>,
  id?: string
): Promise<string> => {
  const targetId = id || doc(collection(db, 'users', uid, 'goals')).id;
  const goalRef = doc(db, 'users', uid, 'goals', targetId);
  const now = new Date().toISOString();
  await setDoc(
    goalRef,
    {
      title: goal.title.trim(),
      description: (goal.description || '').trim(),
      status: goal.status || 'active',
      deadline: goal.deadline || '',
      createdAt: now,
      updatedAt: now,
      uid,
    },
    { merge: true }
  );
  return targetId;
};

export const updateGoal = async (
  uid: string,
  id: string,
  updates: Partial<Omit<Goal, 'id' | 'uid'>>
): Promise<void> => {
  const goalRef = doc(db, 'users', uid, 'goals', id);
  await updateDoc(goalRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteGoalDoc = async (uid: string, id: string): Promise<void> => {
  const goalRef = doc(db, 'users', uid, 'goals', id);
  await deleteDoc(goalRef);
};

// Actions
export const fetchActions = async (uid: string): Promise<ActionItem[]> => {
  const actionsRef = collection(db, 'users', uid, 'actions');
  const q = query(actionsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<ActionItem, 'id'>),
  }));
};

export const saveAction = async (
  uid: string,
  action: Omit<ActionItem, 'id' | 'uid' | 'createdAt'>,
  id?: string
): Promise<string> => {
  const targetId = id || doc(collection(db, 'users', uid, 'actions')).id;
  const actionRef = doc(db, 'users', uid, 'actions', targetId);
  const now = new Date().toISOString();
  await setDoc(
    actionRef,
    {
      title: action.title.trim(),
      description: (action.description || '').trim(),
      status: action.status || 'pending',
      dueDate: action.dueDate || '',
      goalId: action.goalId || '',
      goalTitle: action.goalTitle || '',
      createdAt: now,
      updatedAt: now,
      uid,
    },
    { merge: true }
  );
  return targetId;
};

export const updateAction = async (
  uid: string,
  id: string,
  updates: Partial<Omit<ActionItem, 'id' | 'uid'>>
): Promise<void> => {
  const actionRef = doc(db, 'users', uid, 'actions', id);
  await updateDoc(actionRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteActionDoc = async (uid: string, id: string): Promise<void> => {
  const actionRef = doc(db, 'users', uid, 'actions', id);
  await deleteDoc(actionRef);
};

// Insights
export const fetchInsights = async (uid: string): Promise<Insight[]> => {
  const insightsRef = collection(db, 'users', uid, 'insights');
  const q = query(insightsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Insight, 'id'>),
  }));
};

export const saveInsightDoc = async (
  uid: string,
  insight: Omit<Insight, 'id' | 'uid' | 'createdAt'>,
  id?: string
): Promise<string> => {
  const targetId = id || doc(collection(db, 'users', uid, 'insights')).id;
  const insightRef = doc(db, 'users', uid, 'insights', targetId);
  const now = new Date().toISOString();
  await setDoc(
    insightRef,
    {
      title: insight.title.trim(),
      content: insight.content.trim(),
      type: insight.type,
      createdAt: now,
      uid,
    },
    { merge: true }
  );
  return targetId;
};

export const deleteInsightDoc = async (uid: string, id: string): Promise<void> => {
  const insightRef = doc(db, 'users', uid, 'insights', id);
  await deleteDoc(insightRef);
};

// Conversations & Messages
export const fetchConversations = async (uid: string): Promise<Conversation[]> => {
  const convRef = collection(db, 'users', uid, 'conversations');
  const q = query(convRef, orderBy('updatedAt', 'desc'), limit(30));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Conversation, 'id'>),
  }));
};

export const fetchConversationMessages = async (
  uid: string,
  conversationId: string
): Promise<ChatMessage[]> => {
  const messagesRef = collection(
    db,
    'users',
    uid,
    'conversations',
    conversationId,
    'messages'
  );
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<ChatMessage, 'id'>),
  }));
};

export const saveConversationMeta = async (
  uid: string,
  conversationId: string,
  data: {
    title: string;
    lastMessage: string;
    messageCount: number;
  }
): Promise<void> => {
  const convRef = doc(db, 'users', uid, 'conversations', conversationId);
  const existing = await getDoc(convRef);
  const now = new Date().toISOString();
  if (existing.exists()) {
    await updateDoc(convRef, {
      ...data,
      updatedAt: now,
    });
  } else {
    await setDoc(convRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
      uid,
    });
  }
};

export const saveMessageDoc = async (
  uid: string,
  conversationId: string,
  message: {
    role: 'user' | 'model';
    content: string;
  }
): Promise<string> => {
  const msgRef = doc(
    collection(db, 'users', uid, 'conversations', conversationId, 'messages')
  );
  const now = new Date().toISOString();
  await setDoc(msgRef, {
    role: message.role,
    content: message.content,
    createdAt: now,
  });
  return msgRef.id;
};

export const deleteConversationDoc = async (
  uid: string,
  conversationId: string
): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('Unauthorized Firestore deletion attempt');
  }

  // 1. Delete all nested messages in the subcollection
  try {
    const messagesRef = collection(
      db,
      'users',
      uid,
      'conversations',
      conversationId,
      'messages'
    );
    const msgSnap = await getDocs(messagesRef);
    const deleteMessagePromises = msgSnap.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deleteMessagePromises);
  } catch (err) {
    console.error('Error cascade deleting conversation messages:', err);
  }

  // 2. Delete parent conversation document
  const convRef = doc(db, 'users', uid, 'conversations', conversationId);
  await deleteDoc(convRef);
};
