import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { activityAPI, importSampleData } from '../services/api';
import { useAuth } from './AuthContext';

const ActivityContext = createContext(null);

export function ActivityProvider({ children }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = useCallback(async () => {
    if (!user) {
      setActivities([]);
      return;
    }
    setLoading(true);
    try {
      const data = await activityAPI.getAll(user.id);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = async (activityPayload) => {
    if (!user) return null;
    const newAct = await activityAPI.create({
      ...activityPayload,
      userId: user.id
    });
    setActivities(prev => [newAct, ...prev]);
    return newAct;
  };

  const deleteActivity = async (id) => {
    await activityAPI.delete(id);
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const clearAllActivities = async () => {
    if (!user) return;
    await activityAPI.deleteAll(user.id);
    setActivities([]);
  };

  const loadSampleData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      importSampleData(user.id);
      const data = await activityAPI.getAll(user.id);
      setActivities(data);
    } catch (err) {
      console.error('Error loading sample data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActivityContext.Provider value={{ 
      activities, 
      loading, 
      addActivity, 
      deleteActivity, 
      clearAllActivities, 
      loadSampleData,
      refreshActivities: fetchActivities 
    }}>
      {children}
    </ActivityContext.Provider>
  );
}

export const useActivities = () => useContext(ActivityContext);
