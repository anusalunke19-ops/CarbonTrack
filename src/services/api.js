import { calculateEmission } from '../utils/calculator';

const getStore = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setStore = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Seeding standard databases
// Initialize with demo data if empty
export function initializeDemoData() {
  const users = getStore('ct_users');
  const activities = getStore('ct_activities');
  const goals = getStore('ct_goals');

  if (users.length === 0) {
    const demoUser = {
      id: 'demo-user-123',
      name: 'Ananya Salunke',
      email: 'demo@carbontrack.com',
      password: 'demo123',
      role: 'Individual'
    };
    setStore('ct_users', [demoUser]);
    // NOTE: We do not set 'ct_current_user' to demoUser automatically anymore.
    // This allows the app to start logged out, starting empty instead of logged in.
  }

  // Pre-seed activities and goals for the demo-user specifically
  if (activities.length === 0) {
    const sampleActivities = [];
    const userId = 'demo-user-123';
    
    // Generate 30 days of activities
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Add a transport log (mostly daily commutes)
      const transModes = ['car_petrol', 'car_diesel', 'bus', 'train', 'bicycle', 'walking'];
      const mode = transModes[i % transModes.length];
      const dist = mode === 'bicycle' || mode === 'walking' ? 3 + (i % 5) : 10 + (i % 25);
      sampleActivities.push({
        id: `act-t-${i}`,
        userId,
        pillar: 'transport',
        category: mode,
        quantity: dist,
        co2e: calculateEmission('transport', mode, dist),
        date: dateStr,
        notes: `Commute via ${mode.replace('_', ' ')}`
      });

      // Add energy log (less frequent, say every 4 days, but larger values)
      if (i % 4 === 0) {
        const energyTypes = ['electricity', 'natural_gas'];
        const eType = energyTypes[i % energyTypes.length];
        const quant = eType === 'electricity' ? 8 + (i % 12) : 2 + (i % 4);
        sampleActivities.push({
          id: `act-e-${i}`,
          userId,
          pillar: 'energy',
          category: eType,
          quantity: quant,
          co2e: calculateEmission('energy', eType, quant),
          date: dateStr,
          notes: `${eType.replace('_', ' ')} consumption`
        });
      }

      // Add diet log (daily profile)
      const dietTypes = ['heavy_meat', 'medium_meat', 'vegetarian', 'vegan'];
      const diet = dietTypes[i % dietTypes.length];
      sampleActivities.push({
        id: `act-d-${i}`,
        userId,
        pillar: 'diet',
        category: diet,
        quantity: 1, // 1 day
        co2e: calculateEmission('diet', diet, 1),
        date: dateStr,
        notes: `Diet profile: ${diet.replace('_', ' ')}`
      });

      // Add consumer goods log (every 5 days)
      if (i % 5 === 0) {
        const goodsTypes = ['clothing', 'electronics_small', 'books', 'household_supplies'];
        const good = goodsTypes[i % goodsTypes.length];
        const count = 1 + (i % 3);
        sampleActivities.push({
          id: `act-g-${i}`,
          userId,
          pillar: 'goods',
          category: good,
          quantity: count,
          co2e: calculateEmission('goods', good, count),
          date: dateStr,
          notes: `Purchased ${count} ${good.replace('_', ' ')}`
        });
      }
    }
    setStore('ct_activities', sampleActivities);
  }

  if (goals.length === 0) {
    const userId = 'demo-user-123';
    const sampleGoals = [
      {
        id: 'goal-1',
        userId,
        name: 'June Monthly Budget',
        type: 'Monthly Budget',
        targetValue: 400,
        currentValue: 0,
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        description: 'Keep monthly carbon emissions below 400kg CO2e'
      },
      {
        id: 'goal-2',
        userId,
        name: 'Transport Reduction Challenge',
        type: 'Pillar Reduction',
        targetValue: 80,
        currentValue: 0,
        startDate: '2026-06-01',
        endDate: '2026-06-15',
        description: 'Limit transportation emissions to 80kg CO2e this fortnight'
      }
    ];
    setStore('ct_goals', sampleGoals);
  }
}

// Seeds sample data for a specific user on-demand
export function importSampleData(userId) {
  const activities = getStore('ct_activities');
  const goals = getStore('ct_goals');

  // Filter out any existing entries for this user first
  const cleanActivities = activities.filter(a => a.userId !== userId);
  const cleanGoals = goals.filter(g => g.userId !== userId);

  const sampleActivities = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const transModes = ['car_petrol', 'car_diesel', 'bus', 'train', 'bicycle', 'walking'];
    const mode = transModes[i % transModes.length];
    const dist = mode === 'bicycle' || mode === 'walking' ? 3 + (i % 5) : 10 + (i % 25);
    sampleActivities.push({
      id: `act-t-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      pillar: 'transport',
      category: mode,
      quantity: dist,
      co2e: calculateEmission('transport', mode, dist),
      date: dateStr,
      notes: `Commute via ${mode.replace('_', ' ')}`
    });

    if (i % 4 === 0) {
      const energyTypes = ['electricity', 'natural_gas'];
      const eType = energyTypes[i % energyTypes.length];
      const quant = eType === 'electricity' ? 8 + (i % 12) : 2 + (i % 4);
      sampleActivities.push({
        id: `act-e-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId,
        pillar: 'energy',
        category: eType,
        quantity: quant,
        co2e: calculateEmission('energy', eType, quant),
        date: dateStr,
        notes: `${eType.replace('_', ' ')} consumption`
      });
    }

    const dietTypes = ['heavy_meat', 'medium_meat', 'vegetarian', 'vegan'];
    const diet = dietTypes[i % dietTypes.length];
    sampleActivities.push({
      id: `act-d-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      pillar: 'diet',
      category: diet,
      quantity: 1,
      co2e: calculateEmission('diet', diet, 1),
      date: dateStr,
      notes: `Diet profile: ${diet.replace('_', ' ')}`
    });

    if (i % 5 === 0) {
      const goodsTypes = ['clothing', 'electronics_small', 'books', 'household_supplies'];
      const good = goodsTypes[i % goodsTypes.length];
      const count = 1 + (i % 3);
      sampleActivities.push({
        id: `act-g-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId,
        pillar: 'goods',
        category: good,
        quantity: count,
        co2e: calculateEmission('goods', good, count),
        date: dateStr,
        notes: `Purchased ${count} ${good.replace('_', ' ')}`
      });
    }
  }

  const sampleGoals = [
    {
      id: `goal-1-${Date.now()}`,
      userId,
      name: 'June Monthly Budget',
      type: 'Monthly Budget',
      targetValue: 400,
      currentValue: 0,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
      description: 'Keep monthly carbon emissions below 400kg CO2e'
    },
    {
      id: `goal-2-${Date.now()}`,
      userId,
      name: 'Transport Reduction Challenge',
      type: 'Pillar Reduction',
      targetValue: 80,
      currentValue: 0,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString().split('T')[0],
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString().split('T')[0],
      description: 'Limit transportation emissions to 80kg CO2e this fortnight'
    }
  ];

  setStore('ct_activities', [...cleanActivities, ...sampleActivities]);
  setStore('ct_goals', [...cleanGoals, ...sampleGoals]);
}

// REST API Endpoints simulation
export const authAPI = {
  register: async ({ name, email, password, role }) => {
    await new Promise(r => setTimeout(r, 800));
    const users = getStore('ct_users');
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User already exists');
    }
    const newUser = { id: `user-${Date.now()}`, name, email, password, role };
    users.push(newUser);
    setStore('ct_users', users);
    setStore('ct_current_user', newUser);
    return newUser;
  },

  login: async ({ email, password }) => {
    await new Promise(r => setTimeout(r, 800));
    const users = getStore('ct_users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    setStore('ct_current_user', user);
    return user;
  },

  updateUser: async (updatedData) => {
    await new Promise(r => setTimeout(r, 400));
    const users = getStore('ct_users');
    const index = users.findIndex(u => u.id === updatedData.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedData };
      setStore('ct_users', users);
      setStore('ct_current_user', users[index]);
      return users[index];
    }
    throw new Error('User not found');
  },

  logout: async () => {
    localStorage.removeItem('ct_current_user');
    return true;
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('ct_current_user') || 'null');
  }
};

export const activityAPI = {
  create: async (activity) => {
    await new Promise(r => setTimeout(r, 400));
    const activities = getStore('ct_activities');
    const co2e = activity.co2e !== undefined ? activity.co2e : calculateEmission(activity.pillar, activity.category, activity.quantity);
    const newActivity = {
      id: `act-${Date.now()}`,
      co2e,
      ...activity
    };
    activities.unshift(newActivity);
    setStore('ct_activities', activities);
    
    // Update any relevant goals progress
    const goals = getStore('ct_goals');
    const userGoals = goals.filter(g => g.userId === activity.userId);
    userGoals.forEach(g => {
      // Recalculate based on date overlap
      const actDate = new Date(activity.date);
      const start = new Date(g.startDate);
      const end = new Date(g.endDate);
      if (actDate >= start && actDate <= end) {
        // If it fits within goal dates, we sum it up or track the reduction
      }
    });

    return newActivity;
  },

  getAll: async (userId) => {
    const activities = getStore('ct_activities');
    return activities.filter(a => a.userId === userId);
  },

  delete: async (activityId) => {
    const activities = getStore('ct_activities');
    const filtered = activities.filter(a => a.id !== activityId);
    setStore('ct_activities', filtered);
    return true;
  },

  deleteAll: async (userId) => {
    const activities = getStore('ct_activities');
    const filtered = activities.filter(a => a.userId !== userId);
    setStore('ct_activities', filtered);
    return true;
  }
};

export const dashboardAPI = {
  getData: async (userId) => {
    const activities = getStore('ct_activities').filter(a => a.userId === userId);
    return { activities };
  }
};

export const goalsAPI = {
  create: async (goal) => {
    await new Promise(r => setTimeout(r, 400));
    const goals = getStore('ct_goals');
    const newGoal = {
      id: `goal-${Date.now()}`,
      ...goal
    };
    goals.push(newGoal);
    setStore('ct_goals', goals);
    return newGoal;
  },

  getAll: async (userId) => {
    const goals = getStore('ct_goals');
    return goals.filter(g => g.userId === userId);
  },

  delete: async (goalId) => {
    const goals = getStore('ct_goals');
    const filtered = goals.filter(g => g.id !== goalId);
    setStore('ct_goals', filtered);
    return true;
  }
};

export const exportAPI = {
  generateCSV: async (userId) => {
    const activities = getStore('ct_activities').filter(a => a.userId === userId);
    let csvContent = 'Date,Pillar,Category,Quantity,CO2e (kg),Notes\n';
    
    activities.forEach(a => {
      csvContent += `"${a.date}","${a.pillar}","${a.category}","${a.quantity}","${a.co2e}","${(a.notes || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return blob;
  }
};
