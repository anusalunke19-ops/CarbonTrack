// Emission factors database
const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.192, // kg CO2e per km
    car_diesel: 0.171,
    car_electric: 0.053,
    bus: 0.089,
    train: 0.041,
    bicycle: 0,
    walking: 0,
    motorcycle: 0.113,
    flight_domestic: 0.255,
    flight_international: 0.195
  },
  energy: {
    electricity: 0.433, // kg CO2e per kWh
    natural_gas: 2.0, // kg CO2e per m³
    heating_oil: 2.52, // kg CO2e per litre
    lpg: 1.51,
    solar: 0,
    wind: 0
  },
  diet: {
    heavy_meat: 7.19, // kg CO2e per day
    medium_meat: 5.63,
    low_meat: 4.67,
    pescatarian: 3.91,
    vegetarian: 3.81,
    vegan: 2.89
  },
  goods: {
    clothing: 10, // kg CO2e per item
    electronics_small: 25,
    electronics_large: 200,
    furniture: 75,
    books: 2.5,
    plastic_products: 6,
    household_supplies: 3,
    beauty_products: 5
  }
};

export function calculateEmission(pillar, category, quantity) {
  const factors = EMISSION_FACTORS[pillar];
  if (!factors) return 0;
  const factor = factors[category];
  if (factor === undefined) return 0;
  return Number((quantity * factor).toFixed(2));
}

export function calculateNetFootprint(grossEmissions, offsets) {
  return Number(Math.max(0, grossEmissions - offsets).toFixed(2));
}

export function getDailyAverage(activities) {
  if (!activities || activities.length === 0) return 0;
  
  // Find date range
  const dates = activities.map(a => new Date(a.date).toDateString());
  const uniqueDatesCount = new Set(dates).size || 1;
  
  const total = activities.reduce((sum, a) => sum + (a.co2e || 0), 0);
  return Number((total / uniqueDatesCount).toFixed(2));
}

export function getWeeklyTotal(activities) {
  if (!activities) return 0;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return activities
    .filter(a => new Date(a.date) >= oneWeekAgo)
    .reduce((sum, a) => sum + (a.co2e || 0), 0);
}

export function getMonthlyTotal(activities) {
  if (!activities) return 0;
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  
  return activities
    .filter(a => new Date(a.date) >= oneMonthAgo)
    .reduce((sum, a) => sum + (a.co2e || 0), 0);
}

export function getEmissionsByPillar(activities) {
  const result = { transport: 0, energy: 0, diet: 0, goods: 0 };
  if (!activities) return result;
  
  activities.forEach(a => {
    if (result[a.pillar] !== undefined) {
      result[a.pillar] += (a.co2e || 0);
    }
  });
  
  // Format numbers
  Object.keys(result).forEach(k => {
    result[k] = Number(result[k].toFixed(2));
  });
  
  return result;
}

export function getGlobalAverageDaily() {
  return 12.7; // kg CO2e
}

export { EMISSION_FACTORS };
