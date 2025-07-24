import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  const removeStoredValue = useCallback(() => {
    try {
      setValue(defaultValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeStoredValue];
}

// Hook for managing user preferences
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('user_preferences', {
    theme: 'light',
    exportQuality: 'high',
    autoSave: true,
    showTutorials: true,
    defaultFormat: 'png',
    rememberSettings: true,
  });

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    setPreferences,
  };
}

// Hook for managing recent files
export function useRecentFiles(maxFiles = 10) {
  const [recentFiles, setRecentFiles] = useLocalStorage('recent_files', []);

  const addRecentFile = useCallback((fileInfo) => {
    setRecentFiles(prev => {
      const filtered = prev.filter(file => file.name !== fileInfo.name);
      const updated = [fileInfo, ...filtered].slice(0, maxFiles);
      return updated;
    });
  }, [setRecentFiles, maxFiles]);

  const removeRecentFile = useCallback((fileName) => {
    setRecentFiles(prev => prev.filter(file => file.name !== fileName));
  }, [setRecentFiles]);

  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
  }, [setRecentFiles]);

  return {
    recentFiles,
    addRecentFile,
    removeRecentFile,
    clearRecentFiles,
  };
}

// Hook for managing edit sessions
export function useEditSession() {
  const [session, setSession] = useLocalStorage('edit_session', null);

  const saveSession = useCallback((sessionData) => {
    const sessionInfo = {
      ...sessionData,
      timestamp: Date.now(),
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setSession(sessionInfo);
  }, [setSession]);

  const loadSession = useCallback(() => {
    return session;
  }, [session]);

  const clearSession = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const hasSession = session !== null;

  return {
    session,
    saveSession,
    loadSession,
    clearSession,
    hasSession,
  };
}
