export interface Location {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  type: 'city' | 'country';
  searchable: string[];
}

export const locations: Location[] = [
  // Major Cities
  { id: 'paris', name: 'Paris', country: 'France', countryCode: 'FR', type: 'city', searchable: ['paris', 'france', 'french', 'eiffel'] },
  { id: 'london', name: 'London', country: 'United Kingdom', countryCode: 'GB', type: 'city', searchable: ['london', 'england', 'uk', 'britain'] },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', type: 'city', searchable: ['tokyo', 'japan', 'japanese'] },
  { id: 'newyork', name: 'New York', country: 'United States', countryCode: 'US', type: 'city', searchable: ['new york', 'nyc', 'manhattan', 'brooklyn'] },
  { id: 'sydney', name: 'Sydney', country: 'Australia', countryCode: 'AU', type: 'city', searchable: ['sydney', 'australia', 'australian'] },
  { id: 'rome', name: 'Rome', country: 'Italy', countryCode: 'IT', type: 'city', searchable: ['rome', 'italy', 'italian', 'roman'] },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', countryCode: 'ES', type: 'city', searchable: ['barcelona', 'spain', 'spanish', 'catalonia'] },
  { id: 'berlin', name: 'Berlin', country: 'Germany', countryCode: 'DE', type: 'city', searchable: ['berlin', 'germany', 'german'] },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', type: 'city', searchable: ['amsterdam', 'netherlands', 'dutch', 'holland'] },
  { id: 'vienna', name: 'Vienna', country: 'Austria', countryCode: 'AT', type: 'city', searchable: ['vienna', 'austria', 'austrian'] },
  { id: 'prague', name: 'Prague', country: 'Czech Republic', countryCode: 'CZ', type: 'city', searchable: ['prague', 'czech', 'czech republic'] },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', countryCode: 'TR', type: 'city', searchable: ['istanbul', 'turkey', 'turkish', 'constantinople'] },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', type: 'city', searchable: ['dubai', 'uae', 'arab emirates'] },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', countryCode: 'SG', type: 'city', searchable: ['singapore', 'singaporean'] },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', countryCode: 'TH', type: 'city', searchable: ['bangkok', 'thailand', 'thai'] },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', countryCode: 'KR', type: 'city', searchable: ['seoul', 'korea', 'korean', 'south korea'] },
  { id: 'mumbai', name: 'Mumbai', country: 'India', countryCode: 'IN', type: 'city', searchable: ['mumbai', 'india', 'indian', 'bombay'] },
  { id: 'capetown', name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', type: 'city', searchable: ['cape town', 'south africa', 'african'] },
  { id: 'riodejaneiro', name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', type: 'city', searchable: ['rio de janeiro', 'rio', 'brazil', 'brazilian'] },
  { id: 'toronto', name: 'Toronto', country: 'Canada', countryCode: 'CA', type: 'city', searchable: ['toronto', 'canada', 'canadian'] },
  
  // Countries
  { id: 'france', name: 'France', country: 'France', countryCode: 'FR', type: 'country', searchable: ['france', 'french'] },
  { id: 'italy', name: 'Italy', country: 'Italy', countryCode: 'IT', type: 'country', searchable: ['italy', 'italian'] },
  { id: 'spain', name: 'Spain', country: 'Spain', countryCode: 'ES', type: 'country', searchable: ['spain', 'spanish'] },
  { id: 'germany', name: 'Germany', country: 'Germany', countryCode: 'DE', type: 'country', searchable: ['germany', 'german', 'deutschland'] },
  { id: 'unitedkingdom', name: 'United Kingdom', country: 'United Kingdom', countryCode: 'GB', type: 'country', searchable: ['united kingdom', 'uk', 'england', 'britain', 'british'] },
  { id: 'japan', name: 'Japan', country: 'Japan', countryCode: 'JP', type: 'country', searchable: ['japan', 'japanese'] },
  { id: 'unitedstates', name: 'United States', country: 'United States', countryCode: 'US', type: 'country', searchable: ['united states', 'usa', 'america', 'american'] },
  { id: 'australia', name: 'Australia', country: 'Australia', countryCode: 'AU', type: 'country', searchable: ['australia', 'australian'] },
  { id: 'canada', name: 'Canada', country: 'Canada', countryCode: 'CA', type: 'country', searchable: ['canada', 'canadian'] },
  { id: 'brazil', name: 'Brazil', country: 'Brazil', countryCode: 'BR', type: 'country', searchable: ['brazil', 'brazilian'] },
  { id: 'india', name: 'India', country: 'India', countryCode: 'IN', type: 'country', searchable: ['india', 'indian'] },
  { id: 'china', name: 'China', country: 'China', countryCode: 'CN', type: 'country', searchable: ['china', 'chinese'] },
  { id: 'southkorea', name: 'South Korea', country: 'South Korea', countryCode: 'KR', type: 'country', searchable: ['south korea', 'korea', 'korean'] },
  { id: 'thailand', name: 'Thailand', country: 'Thailand', countryCode: 'TH', type: 'country', searchable: ['thailand', 'thai'] },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', countryCode: 'SG', type: 'country', searchable: ['singapore', 'singaporean'] },
];

export const searchLocations = (query: string, limit: number = 10): Location[] => {
  if (!query.trim()) {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  const filtered = locations.filter(location => 
    location.searchable.some(searchTerm => 
      searchTerm.includes(normalizedQuery)
    )
  );
  
  const sorted = filtered.sort((a, b) => {
    // Prioritize exact matches
    const aExact = a.name.toLowerCase() === normalizedQuery;
    const bExact = b.name.toLowerCase() === normalizedQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    // Then prioritize matches that start with query
    const aStartsWith = a.name.toLowerCase().startsWith(normalizedQuery);
    const bStartsWith = b.name.toLowerCase().startsWith(normalizedQuery);
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // Finally alphabetical
    return a.name.localeCompare(b.name);
  });
  
  return sorted.slice(0, limit);
};
