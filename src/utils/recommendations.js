// Static rule base with tips for each pillar
const TIPS_DATABASE = {
  transport: [
    { title: 'Switch to Public Transit', desc: 'Replace 3 car trips/week with bus or train', impact: 2.1, icon: '🚌' },
    { title: 'Start Carpooling', desc: 'Share rides with colleagues for daily commute', impact: 1.8, icon: '🚗' },
    { title: 'Try Cycling Short Trips', desc: 'Bike for trips under 5km instead of driving', impact: 1.2, icon: '🚲' },
    { title: 'Work From Home', desc: 'Remote work 2 days/week eliminates commute emissions', impact: 3.5, icon: '🏠' },
    { title: 'Optimize Driving', desc: 'Maintain steady speed and proper tire pressure', impact: 0.8, icon: '⚙️' },
  ],
  energy: [
    { title: 'Switch to LED Bulbs', desc: 'Replace all incandescent bulbs with LED alternatives', impact: 0.9, icon: '💡' },
    { title: 'Smart Thermostat', desc: 'Install programmable thermostat to optimize heating', impact: 2.3, icon: '🌡️' },
    { title: 'Unplug Standby Devices', desc: 'Eliminate phantom energy draw from idle electronics', impact: 0.5, icon: '🔌' },
    { title: 'Switch to Renewable Energy', desc: 'Choose a green energy provider or install solar panels', impact: 5.2, icon: '☀️' },
    { title: 'Reduce AC Usage', desc: 'Set AC 2°C higher and use fans for circulation', impact: 1.5, icon: '❄️' },
  ],
  diet: [
    { title: 'Meatless Mondays', desc: 'Skip meat one day per week to reduce food emissions', impact: 0.6, icon: '🥬' },
    { title: 'Buy Local Produce', desc: 'Choose locally grown food to cut transport emissions', impact: 0.8, icon: '🏪' },
    { title: 'Reduce Food Waste', desc: 'Plan meals and use leftovers to avoid waste', impact: 1.1, icon: '♻️' },
    { title: 'Plant-Based Proteins', desc: 'Replace red meat with beans, lentils, or tofu', impact: 1.8, icon: '🌱' },
    { title: 'Grow Your Own Herbs', desc: 'Start a small herb garden for zero-emission seasoning', impact: 0.3, icon: '🌿' },
  ],
  goods: [
    { title: 'Buy Second-Hand', desc: 'Choose pre-owned clothing and electronics', impact: 3.2, icon: '🔄' },
    { title: 'Repair Before Replace', desc: 'Fix broken items instead of buying new ones', impact: 2.5, icon: '🔧' },
    { title: 'Choose Sustainable Brands', desc: 'Support companies with verified eco-certifications', impact: 1.5, icon: '🏷️' },
    { title: 'Minimize Packaging', desc: 'Buy in bulk and choose products with less packaging', impact: 0.9, icon: '📦' },
    { title: 'Digital Over Physical', desc: 'Choose e-books, digital subscriptions over physical', impact: 0.7, icon: '📱' },
  ]
};

import { getEmissionsByPillar } from './calculator';

export function getRecommendations(activities) {
  const emissions = getEmissionsByPillar(activities);
  
  // Find highest emission pillar
  let highestPillar = 'transport';
  let maxVal = -1;
  Object.entries(emissions).forEach(([pillar, val]) => {
    if (val > maxVal) {
      maxVal = val;
      highestPillar = pillar;
    }
  });

  // Take top 3 from highest pillar and 1 from each of the other pillars
  const recommendations = [];
  
  const mainTips = TIPS_DATABASE[highestPillar] || TIPS_DATABASE.transport;
  mainTips.slice(0, 3).forEach((tip, idx) => {
    recommendations.push({
      id: `${highestPillar}_main_${idx}`,
      ...tip,
      pillar: highestPillar,
      accepted: false
    });
  });

  Object.keys(TIPS_DATABASE).forEach((pillar) => {
    if (pillar !== highestPillar) {
      const tip = TIPS_DATABASE[pillar][0];
      recommendations.push({
        id: `${pillar}_other`,
        ...tip,
        pillar,
        accepted: false
      });
    }
  });

  return recommendations;
}

export function getPersonalizedTips(pillar) {
  return (TIPS_DATABASE[pillar] || []).map((tip, idx) => ({
    id: `${pillar}_tab_${idx}`,
    ...tip,
    pillar,
    accepted: false
  }));
}

export function simulateGeminiResponse(highestPillar) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tips = {
        transport: 'Gemini Analysis: Based on your transport footprint, transitioning to cycling for short trips could prevent up to 80kg of CO2e monthly. Consider batching errands to minimize overall driving distance.',
        energy: 'Gemini Analysis: Your energy patterns indicate thermal loss. Double-glazing windows or insulating doors can yield up to 15% reduction in heating/cooling footprint.',
        diet: 'Gemini Analysis: Substituting poultry or legumes for beef even three days a week will cut your diet-based emissions by nearly 35%. Focus on seasonal foods.',
        goods: 'Gemini Analysis: Your consumer habits show lifecycle overhead. Try adopting a "one-in-one-out" policy and check local circular-economy apps for electronics.'
      };
      resolve(tips[highestPillar] || tips.transport);
    }, 1500);
  });
}

export { TIPS_DATABASE };
