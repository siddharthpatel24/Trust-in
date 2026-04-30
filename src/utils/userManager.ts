import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface User {
  id: string;
  name: string;
  profilePic?: string;
  createdAt: string;
}

export const generateUserId = (): string => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem('roommate_user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

export const saveUser = (user: User): void => {
  try {
    localStorage.setItem('roommate_user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

export const saveUserToFirestore = async (user: User): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', user.id), {
      id: user.id,
      name: user.name,
      profilePic: user.profilePic || '',
      createdAt: user.createdAt,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
};

export const getUserFromFirestore = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch {
    return null;
  }
};

export const createUser = (name: string, profilePic?: string): User => {
  const user: User = {
    id: generateUserId(),
    name: name.trim(),
    profilePic: profilePic || '',
    createdAt: new Date().toISOString()
  };
  saveUser(user);
  return user;
};

export const updateUserName = (newName: string): User | null => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = {
      ...currentUser,
      name: newName.trim()
    };
    saveUser(updatedUser);
    return updatedUser;
  }
  return null;
};

export const updateUserProfilePic = (profilePic: string): User | null => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = {
      ...currentUser,
      profilePic
    };
    saveUser(updatedUser);
    return updatedUser;
  }
  return null;
};