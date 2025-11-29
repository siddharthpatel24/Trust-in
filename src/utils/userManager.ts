// User management utilities for automatic user tracking
export interface User {
  id: string;
  name: string;
  createdAt: string;
}

// Generate a unique user ID
export const generateUserId = (): string => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Get current user from localStorage
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

// Save user to localStorage
export const saveUser = (user: User): void => {
  try {
    localStorage.setItem('roommate_user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

// Create new user
export const createUser = (name: string): User => {
  const user: User = {
    id: generateUserId(),
    name: name.trim(),
    createdAt: new Date().toISOString()
  };
  saveUser(user);
  return user;
};

// Update user name
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