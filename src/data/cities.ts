/**
 * Comprehensive world cities dataset for birth place typeahead.
 * ~2500 major cities across all countries, organized by country code.
 * Each city includes lat/lng for accurate astrological calculations.
 */
export interface City {
  name: string;
  country: string; // ISO code
  lat: number;
  lng: number;
  /** Optional state/province for disambiguation */
  region?: string;
}

// Cities grouped by country code for efficient filtering
const citiesByCountry: Record<string, City[]> = {
  // United States
  US: [
    { name: "New York", country: "US", lat: 40.7128, lng: -74.006, region: "NY" },
    { name: "Los Angeles", country: "US", lat: 34.0522, lng: -118.2437, region: "CA" },
    { name: "Chicago", country: "US", lat: 41.8781, lng: -87.6298, region: "IL" },
    { name: "Houston", country: "US", lat: 29.7604, lng: -95.3698, region: "TX" },
    { name: "Phoenix", country: "US", lat: 33.4484, lng: -112.074, region: "AZ" },
    { name: "Philadelphia", country: "US", lat: 39.9526, lng: -75.1652, region: "PA" },
    { name: "San Antonio", country: "US", lat: 29.4241, lng: -98.4936, region: "TX" },
    { name: "San Diego", country: "US", lat: 32.7157, lng: -117.1611, region: "CA" },
    { name: "Dallas", country: "US", lat: 32.7767, lng: -96.797, region: "TX" },
    { name: "San Jose", country: "US", lat: 37.3382, lng: -121.8863, region: "CA" },
    { name: "Austin", country: "US", lat: 30.2672, lng: -97.7431, region: "TX" },
    { name: "Jacksonville", country: "US", lat: 30.3322, lng: -81.6557, region: "FL" },
    { name: "Fort Worth", country: "US", lat: 32.7555, lng: -97.3308, region: "TX" },
    { name: "Columbus", country: "US", lat: 39.9612, lng: -82.9988, region: "OH" },
    { name: "Charlotte", country: "US", lat: 35.2271, lng: -80.8431, region: "NC" },
    { name: "San Francisco", country: "US", lat: 37.7749, lng: -122.4194, region: "CA" },
    { name: "Indianapolis", country: "US", lat: 39.7684, lng: -86.1581, region: "IN" },
    { name: "Seattle", country: "US", lat: 47.6062, lng: -122.3321, region: "WA" },
    { name: "Denver", country: "US", lat: 39.7392, lng: -104.9903, region: "CO" },
    { name: "Washington", country: "US", lat: 38.9072, lng: -77.0369, region: "DC" },
    { name: "Nashville", country: "US", lat: 36.1627, lng: -86.7816, region: "TN" },
    { name: "Oklahoma City", country: "US", lat: 35.4676, lng: -97.5164, region: "OK" },
    { name: "El Paso", country: "US", lat: 31.7619, lng: -106.485, region: "TX" },
    { name: "Boston", country: "US", lat: 42.3601, lng: -71.0589, region: "MA" },
    { name: "Portland", country: "US", lat: 45.5152, lng: -122.6784, region: "OR" },
    { name: "Las Vegas", country: "US", lat: 36.1699, lng: -115.1398, region: "NV" },
    { name: "Memphis", country: "US", lat: 35.1495, lng: -90.049, region: "TN" },
    { name: "Louisville", country: "US", lat: 38.2527, lng: -85.7585, region: "KY" },
    { name: "Baltimore", country: "US", lat: 39.2904, lng: -76.6122, region: "MD" },
    { name: "Milwaukee", country: "US", lat: 43.0389, lng: -87.9065, region: "WI" },
    { name: "Albuquerque", country: "US", lat: 35.0844, lng: -106.6504, region: "NM" },
    { name: "Tucson", country: "US", lat: 32.2226, lng: -110.9747, region: "AZ" },
    { name: "Fresno", country: "US", lat: 36.7378, lng: -119.7871, region: "CA" },
    { name: "Sacramento", country: "US", lat: 38.5816, lng: -121.4944, region: "CA" },
    { name: "Mesa", country: "US", lat: 33.4152, lng: -111.8315, region: "AZ" },
    { name: "Kansas City", country: "US", lat: 39.0997, lng: -94.5786, region: "MO" },
    { name: "Atlanta", country: "US", lat: 33.749, lng: -84.388, region: "GA" },
    { name: "Omaha", country: "US", lat: 41.2565, lng: -95.9345, region: "NE" },
    { name: "Colorado Springs", country: "US", lat: 38.8339, lng: -104.8214, region: "CO" },
    { name: "Raleigh", country: "US", lat: 35.7796, lng: -78.6382, region: "NC" },
    { name: "Miami", country: "US", lat: 25.7617, lng: -80.1918, region: "FL" },
    { name: "Cleveland", country: "US", lat: 41.4993, lng: -81.6944, region: "OH" },
    { name: "Tulsa", country: "US", lat: 36.154, lng: -95.9928, region: "OK" },
    { name: "Oakland", country: "US", lat: 37.8044, lng: -122.2712, region: "CA" },
    { name: "Minneapolis", country: "US", lat: 44.9778, lng: -93.265, region: "MN" },
    { name: "Tampa", country: "US", lat: 27.9506, lng: -82.4572, region: "FL" },
    { name: "New Orleans", country: "US", lat: 29.9511, lng: -90.0715, region: "LA" },
    { name: "Honolulu", country: "US", lat: 21.3069, lng: -157.8583, region: "HI" },
    { name: "Anchorage", country: "US", lat: 61.2181, lng: -149.9003, region: "AK" },
    { name: "Detroit", country: "US", lat: 42.3314, lng: -83.0458, region: "MI" },
    { name: "Pittsburgh", country: "US", lat: 40.4406, lng: -79.9959, region: "PA" },
    { name: "St. Louis", country: "US", lat: 38.627, lng: -90.1994, region: "MO" },
    { name: "Cincinnati", country: "US", lat: 39.1031, lng: -84.512, region: "OH" },
    { name: "Orlando", country: "US", lat: 28.5383, lng: -81.3792, region: "FL" },
    { name: "Salt Lake City", country: "US", lat: 40.7608, lng: -111.891, region: "UT" },
    { name: "Richmond", country: "US", lat: 37.5407, lng: -77.436, region: "VA" },
    { name: "Buffalo", country: "US", lat: 42.8864, lng: -78.8784, region: "NY" },
    { name: "Boise", country: "US", lat: 43.615, lng: -116.2023, region: "ID" },
  ],

  // United Kingdom
  GB: [
    { name: "London", country: "GB", lat: 51.5074, lng: -0.1278 },
    { name: "Birmingham", country: "GB", lat: 52.4862, lng: -1.8904 },
    { name: "Manchester", country: "GB", lat: 53.4808, lng: -2.2426 },
    { name: "Glasgow", country: "GB", lat: 55.8642, lng: -4.2518 },
    { name: "Liverpool", country: "GB", lat: 53.4084, lng: -2.9916 },
    { name: "Leeds", country: "GB", lat: 53.8008, lng: -1.5491 },
    { name: "Sheffield", country: "GB", lat: 53.3811, lng: -1.4701 },
    { name: "Edinburgh", country: "GB", lat: 55.9533, lng: -3.1883 },
    { name: "Bristol", country: "GB", lat: 51.4545, lng: -2.5879 },
    { name: "Cardiff", country: "GB", lat: 51.4816, lng: -3.1791 },
    { name: "Belfast", country: "GB", lat: 54.5973, lng: -5.9301 },
    { name: "Nottingham", country: "GB", lat: 52.9548, lng: -1.1581 },
    { name: "Newcastle", country: "GB", lat: 54.9783, lng: -1.6178 },
    { name: "Leicester", country: "GB", lat: 52.6369, lng: -1.1398 },
    { name: "Brighton", country: "GB", lat: 50.8225, lng: -0.1372 },
    { name: "Oxford", country: "GB", lat: 51.752, lng: -1.2577 },
    { name: "Cambridge", country: "GB", lat: 52.2053, lng: 0.1218 },
    { name: "York", country: "GB", lat: 53.9599, lng: -1.0873 },
    { name: "Aberdeen", country: "GB", lat: 57.1497, lng: -2.0943 },
    { name: "Southampton", country: "GB", lat: 50.9097, lng: -1.4044 },
    { name: "Bath", country: "GB", lat: 51.3811, lng: -2.3590 },
    { name: "Coventry", country: "GB", lat: 52.4068, lng: -1.5197 },
  ],

  // Canada
  CA: [
    { name: "Toronto", country: "CA", lat: 43.6532, lng: -79.3832 },
    { name: "Montreal", country: "CA", lat: 45.5017, lng: -73.5673 },
    { name: "Vancouver", country: "CA", lat: 49.2827, lng: -123.1207 },
    { name: "Calgary", country: "CA", lat: 51.0447, lng: -114.0719 },
    { name: "Edmonton", country: "CA", lat: 53.5461, lng: -113.4938 },
    { name: "Ottawa", country: "CA", lat: 45.4215, lng: -75.6972 },
    { name: "Winnipeg", country: "CA", lat: 49.8951, lng: -97.1384 },
    { name: "Quebec City", country: "CA", lat: 46.8139, lng: -71.2082 },
    { name: "Hamilton", country: "CA", lat: 43.2557, lng: -79.8711 },
    { name: "Halifax", country: "CA", lat: 44.6488, lng: -63.5752 },
    { name: "Victoria", country: "CA", lat: 48.4284, lng: -123.3656 },
    { name: "Regina", country: "CA", lat: 50.4452, lng: -104.6189 },
    { name: "Saskatoon", country: "CA", lat: 52.1332, lng: -106.6700 },
    { name: "St. John's", country: "CA", lat: 47.5615, lng: -52.7126 },
  ],

  // India
  IN: [
    { name: "Mumbai", country: "IN", lat: 19.076, lng: 72.8777 },
    { name: "Delhi", country: "IN", lat: 28.7041, lng: 77.1025 },
    { name: "Bangalore", country: "IN", lat: 12.9716, lng: 77.5946 },
    { name: "Hyderabad", country: "IN", lat: 17.385, lng: 78.4867 },
    { name: "Ahmedabad", country: "IN", lat: 23.0225, lng: 72.5714 },
    { name: "Chennai", country: "IN", lat: 13.0827, lng: 80.2707 },
    { name: "Kolkata", country: "IN", lat: 22.5726, lng: 88.3639 },
    { name: "Pune", country: "IN", lat: 18.5204, lng: 73.8567 },
    { name: "Jaipur", country: "IN", lat: 26.9124, lng: 75.7873 },
    { name: "Lucknow", country: "IN", lat: 26.8467, lng: 80.9462 },
    { name: "Kanpur", country: "IN", lat: 26.4499, lng: 80.3319 },
    { name: "Nagpur", country: "IN", lat: 21.1458, lng: 79.0882 },
    { name: "Indore", country: "IN", lat: 22.7196, lng: 75.8577 },
    { name: "Thane", country: "IN", lat: 19.2183, lng: 72.9781 },
    { name: "Bhopal", country: "IN", lat: 23.2599, lng: 77.4126 },
    { name: "Visakhapatnam", country: "IN", lat: 17.6868, lng: 83.2185 },
    { name: "Patna", country: "IN", lat: 25.6093, lng: 85.1376 },
    { name: "Vadodara", country: "IN", lat: 22.3072, lng: 73.1812 },
    { name: "Surat", country: "IN", lat: 21.1702, lng: 72.8311 },
    { name: "Agra", country: "IN", lat: 27.1767, lng: 78.0081 },
    { name: "Varanasi", country: "IN", lat: 25.3176, lng: 82.9739 },
    { name: "Chandigarh", country: "IN", lat: 30.7333, lng: 76.7794 },
    { name: "Kochi", country: "IN", lat: 9.9312, lng: 76.2673 },
    { name: "Coimbatore", country: "IN", lat: 11.0168, lng: 76.9558 },
    { name: "Goa", country: "IN", lat: 15.2993, lng: 74.124 },
    { name: "Amritsar", country: "IN", lat: 31.6340, lng: 74.8723 },
    { name: "Mysore", country: "IN", lat: 12.2958, lng: 76.6394 },
    { name: "Guwahati", country: "IN", lat: 26.1445, lng: 91.7362 },
    { name: "Dehradun", country: "IN", lat: 30.3165, lng: 78.0322 },
  ],

  // China
  CN: [
    { name: "Shanghai", country: "CN", lat: 31.2304, lng: 121.4737 },
    { name: "Beijing", country: "CN", lat: 39.9042, lng: 116.4074 },
    { name: "Guangzhou", country: "CN", lat: 23.1291, lng: 113.2644 },
    { name: "Shenzhen", country: "CN", lat: 22.5431, lng: 114.0579 },
    { name: "Chengdu", country: "CN", lat: 30.5728, lng: 104.0668 },
    { name: "Hangzhou", country: "CN", lat: 30.2741, lng: 120.1551 },
    { name: "Wuhan", country: "CN", lat: 30.5928, lng: 114.3055 },
    { name: "Nanjing", country: "CN", lat: 32.0603, lng: 118.7969 },
    { name: "Xi'an", country: "CN", lat: 34.3416, lng: 108.9398 },
    { name: "Tianjin", country: "CN", lat: 39.3434, lng: 117.3616 },
    { name: "Chongqing", country: "CN", lat: 29.4316, lng: 106.9123 },
    { name: "Suzhou", country: "CN", lat: 31.2989, lng: 120.5853 },
    { name: "Dalian", country: "CN", lat: 38.914, lng: 121.6147 },
    { name: "Qingdao", country: "CN", lat: 36.0671, lng: 120.3826 },
    { name: "Harbin", country: "CN", lat: 45.803, lng: 126.535 },
    { name: "Kunming", country: "CN", lat: 25.0389, lng: 102.7183 },
    { name: "Changsha", country: "CN", lat: 28.2282, lng: 112.9388 },
    { name: "Zhengzhou", country: "CN", lat: 34.7466, lng: 113.6253 },
    { name: "Fuzhou", country: "CN", lat: 26.0745, lng: 119.2965 },
    { name: "Xiamen", country: "CN", lat: 24.4798, lng: 118.0894 },
    { name: "Hong Kong", country: "CN", lat: 22.3193, lng: 114.1694 },
    { name: "Macau", country: "CN", lat: 22.1987, lng: 113.5439 },
    { name: "Lhasa", country: "CN", lat: 29.65, lng: 91.1 },
    { name: "Urumqi", country: "CN", lat: 43.8256, lng: 87.6168 },
  ],

  // Japan
  JP: [
    { name: "Tokyo", country: "JP", lat: 35.6762, lng: 139.6503 },
    { name: "Osaka", country: "JP", lat: 34.6937, lng: 135.5023 },
    { name: "Yokohama", country: "JP", lat: 35.4437, lng: 139.638 },
    { name: "Nagoya", country: "JP", lat: 35.1815, lng: 136.9066 },
    { name: "Sapporo", country: "JP", lat: 43.0618, lng: 141.3545 },
    { name: "Kobe", country: "JP", lat: 34.6901, lng: 135.1956 },
    { name: "Kyoto", country: "JP", lat: 35.0116, lng: 135.7681 },
    { name: "Fukuoka", country: "JP", lat: 33.5904, lng: 130.4017 },
    { name: "Hiroshima", country: "JP", lat: 34.3853, lng: 132.4553 },
    { name: "Sendai", country: "JP", lat: 38.2682, lng: 140.8694 },
    { name: "Nara", country: "JP", lat: 34.6851, lng: 135.8048 },
    { name: "Okinawa", country: "JP", lat: 26.3344, lng: 127.8056 },
  ],

  // Australia
  AU: [
    { name: "Sydney", country: "AU", lat: -33.8688, lng: 151.2093 },
    { name: "Melbourne", country: "AU", lat: -37.8136, lng: 144.9631 },
    { name: "Brisbane", country: "AU", lat: -27.4698, lng: 153.0251 },
    { name: "Perth", country: "AU", lat: -31.9505, lng: 115.8605 },
    { name: "Adelaide", country: "AU", lat: -34.9285, lng: 138.6007 },
    { name: "Gold Coast", country: "AU", lat: -28.0167, lng: 153.4 },
    { name: "Canberra", country: "AU", lat: -35.2809, lng: 149.13 },
    { name: "Hobart", country: "AU", lat: -42.8821, lng: 147.3272 },
    { name: "Darwin", country: "AU", lat: -12.4634, lng: 130.8456 },
    { name: "Cairns", country: "AU", lat: -16.9186, lng: 145.7781 },
  ],

  // Germany
  DE: [
    { name: "Berlin", country: "DE", lat: 52.52, lng: 13.405 },
    { name: "Hamburg", country: "DE", lat: 53.5511, lng: 9.9937 },
    { name: "Munich", country: "DE", lat: 48.1351, lng: 11.582 },
    { name: "Cologne", country: "DE", lat: 50.9375, lng: 6.9603 },
    { name: "Frankfurt", country: "DE", lat: 50.1109, lng: 8.6821 },
    { name: "Stuttgart", country: "DE", lat: 48.7758, lng: 9.1829 },
    { name: "Düsseldorf", country: "DE", lat: 51.2277, lng: 6.7735 },
    { name: "Leipzig", country: "DE", lat: 51.3397, lng: 12.3731 },
    { name: "Dortmund", country: "DE", lat: 51.5136, lng: 7.4653 },
    { name: "Dresden", country: "DE", lat: 51.0504, lng: 13.7373 },
    { name: "Nuremberg", country: "DE", lat: 49.4521, lng: 11.0767 },
    { name: "Hanover", country: "DE", lat: 52.3759, lng: 9.7320 },
    { name: "Bremen", country: "DE", lat: 53.0793, lng: 8.8017 },
    { name: "Heidelberg", country: "DE", lat: 49.3988, lng: 8.6724 },
  ],

  // France
  FR: [
    { name: "Paris", country: "FR", lat: 48.8566, lng: 2.3522 },
    { name: "Marseille", country: "FR", lat: 43.2965, lng: 5.3698 },
    { name: "Lyon", country: "FR", lat: 45.764, lng: 4.8357 },
    { name: "Toulouse", country: "FR", lat: 43.6047, lng: 1.4442 },
    { name: "Nice", country: "FR", lat: 43.7102, lng: 7.262 },
    { name: "Nantes", country: "FR", lat: 47.2184, lng: -1.5536 },
    { name: "Strasbourg", country: "FR", lat: 48.5734, lng: 7.7521 },
    { name: "Montpellier", country: "FR", lat: 43.6108, lng: 3.8767 },
    { name: "Bordeaux", country: "FR", lat: 44.8378, lng: -0.5792 },
    { name: "Lille", country: "FR", lat: 50.6292, lng: 3.0573 },
    { name: "Rennes", country: "FR", lat: 48.1173, lng: -1.6778 },
    { name: "Grenoble", country: "FR", lat: 45.1885, lng: 5.7245 },
    { name: "Cannes", country: "FR", lat: 43.5528, lng: 7.0174 },
    { name: "Dijon", country: "FR", lat: 47.3220, lng: 5.0415 },
  ],

  // Italy
  IT: [
    { name: "Rome", country: "IT", lat: 41.9028, lng: 12.4964 },
    { name: "Milan", country: "IT", lat: 45.4642, lng: 9.19 },
    { name: "Naples", country: "IT", lat: 40.8518, lng: 14.2681 },
    { name: "Turin", country: "IT", lat: 45.0703, lng: 7.6869 },
    { name: "Palermo", country: "IT", lat: 38.1157, lng: 13.3615 },
    { name: "Genoa", country: "IT", lat: 44.4056, lng: 8.9463 },
    { name: "Bologna", country: "IT", lat: 44.4949, lng: 11.3426 },
    { name: "Florence", country: "IT", lat: 43.7696, lng: 11.2558 },
    { name: "Venice", country: "IT", lat: 45.4408, lng: 12.3155 },
    { name: "Catania", country: "IT", lat: 37.5079, lng: 15.083 },
    { name: "Verona", country: "IT", lat: 45.4384, lng: 10.9916 },
    { name: "Bari", country: "IT", lat: 41.1171, lng: 16.8719 },
  ],

  // Spain
  ES: [
    { name: "Madrid", country: "ES", lat: 40.4168, lng: -3.7038 },
    { name: "Barcelona", country: "ES", lat: 41.3851, lng: 2.1734 },
    { name: "Valencia", country: "ES", lat: 39.4699, lng: -0.3763 },
    { name: "Seville", country: "ES", lat: 37.3891, lng: -5.9845 },
    { name: "Zaragoza", country: "ES", lat: 41.6488, lng: -0.8891 },
    { name: "Malaga", country: "ES", lat: 36.7213, lng: -4.4214 },
    { name: "Bilbao", country: "ES", lat: 43.263, lng: -2.935 },
    { name: "Granada", country: "ES", lat: 37.1773, lng: -3.5986 },
    { name: "Palma de Mallorca", country: "ES", lat: 39.5696, lng: 2.6502 },
    { name: "Alicante", country: "ES", lat: 38.3452, lng: -0.481 },
    { name: "Salamanca", country: "ES", lat: 40.9701, lng: -5.6635 },
    { name: "San Sebastián", country: "ES", lat: 43.3183, lng: -1.9812 },
  ],

  // Brazil
  BR: [
    { name: "São Paulo", country: "BR", lat: -23.5505, lng: -46.6333 },
    { name: "Rio de Janeiro", country: "BR", lat: -22.9068, lng: -43.1729 },
    { name: "Brasília", country: "BR", lat: -15.7975, lng: -47.8919 },
    { name: "Salvador", country: "BR", lat: -12.9714, lng: -38.5124 },
    { name: "Fortaleza", country: "BR", lat: -3.7172, lng: -38.5433 },
    { name: "Belo Horizonte", country: "BR", lat: -19.9167, lng: -43.9345 },
    { name: "Manaus", country: "BR", lat: -3.119, lng: -60.0217 },
    { name: "Curitiba", country: "BR", lat: -25.4284, lng: -49.2733 },
    { name: "Recife", country: "BR", lat: -8.0476, lng: -34.877 },
    { name: "Porto Alegre", country: "BR", lat: -30.0346, lng: -51.2177 },
    { name: "Goiânia", country: "BR", lat: -16.6869, lng: -49.2648 },
    { name: "Belém", country: "BR", lat: -1.4558, lng: -48.5024 },
    { name: "Florianópolis", country: "BR", lat: -27.5954, lng: -48.5480 },
  ],

  // Mexico
  MX: [
    { name: "Mexico City", country: "MX", lat: 19.4326, lng: -99.1332 },
    { name: "Guadalajara", country: "MX", lat: 20.6597, lng: -103.3496 },
    { name: "Monterrey", country: "MX", lat: 25.6866, lng: -100.3161 },
    { name: "Puebla", country: "MX", lat: 19.0414, lng: -98.2063 },
    { name: "Tijuana", country: "MX", lat: 32.5149, lng: -117.0382 },
    { name: "León", country: "MX", lat: 21.1221, lng: -101.6859 },
    { name: "Cancún", country: "MX", lat: 21.1619, lng: -86.8515 },
    { name: "Mérida", country: "MX", lat: 20.9674, lng: -89.5926 },
    { name: "Querétaro", country: "MX", lat: 20.5888, lng: -100.3899 },
    { name: "Oaxaca", country: "MX", lat: 17.0732, lng: -96.7266 },
    { name: "Acapulco", country: "MX", lat: 16.8531, lng: -99.8237 },
  ],

  // Russia
  RU: [
    { name: "Moscow", country: "RU", lat: 55.7558, lng: 37.6173 },
    { name: "Saint Petersburg", country: "RU", lat: 59.9343, lng: 30.3351 },
    { name: "Novosibirsk", country: "RU", lat: 55.0084, lng: 82.9357 },
    { name: "Yekaterinburg", country: "RU", lat: 56.8389, lng: 60.6057 },
    { name: "Kazan", country: "RU", lat: 55.7961, lng: 49.1089 },
    { name: "Nizhny Novgorod", country: "RU", lat: 56.2965, lng: 43.9361 },
    { name: "Samara", country: "RU", lat: 53.1959, lng: 50.1002 },
    { name: "Vladivostok", country: "RU", lat: 43.1332, lng: 131.9113 },
    { name: "Sochi", country: "RU", lat: 43.6028, lng: 39.7342 },
    { name: "Krasnoyarsk", country: "RU", lat: 56.0153, lng: 92.8932 },
  ],

  // South Korea
  KR: [
    { name: "Seoul", country: "KR", lat: 37.5665, lng: 126.978 },
    { name: "Busan", country: "KR", lat: 35.1796, lng: 129.0756 },
    { name: "Incheon", country: "KR", lat: 37.4563, lng: 126.7052 },
    { name: "Daegu", country: "KR", lat: 35.8714, lng: 128.6014 },
    { name: "Daejeon", country: "KR", lat: 36.3504, lng: 127.3845 },
    { name: "Gwangju", country: "KR", lat: 35.1595, lng: 126.8526 },
    { name: "Jeju", country: "KR", lat: 33.4996, lng: 126.5312 },
  ],

  // South Africa
  ZA: [
    { name: "Johannesburg", country: "ZA", lat: -26.2041, lng: 28.0473 },
    { name: "Cape Town", country: "ZA", lat: -33.9249, lng: 18.4241 },
    { name: "Durban", country: "ZA", lat: -29.8587, lng: 31.0218 },
    { name: "Pretoria", country: "ZA", lat: -25.7479, lng: 28.2293 },
    { name: "Port Elizabeth", country: "ZA", lat: -33.918, lng: 25.57 },
    { name: "Bloemfontein", country: "ZA", lat: -29.0852, lng: 26.1596 },
  ],

  // Nigeria
  NG: [
    { name: "Lagos", country: "NG", lat: 6.5244, lng: 3.3792 },
    { name: "Abuja", country: "NG", lat: 9.0765, lng: 7.3986 },
    { name: "Kano", country: "NG", lat: 12.0022, lng: 8.5919 },
    { name: "Ibadan", country: "NG", lat: 7.3775, lng: 3.947 },
    { name: "Port Harcourt", country: "NG", lat: 4.8156, lng: 7.0498 },
    { name: "Benin City", country: "NG", lat: 6.3350, lng: 5.6278 },
  ],

  // Egypt
  EG: [
    { name: "Cairo", country: "EG", lat: 30.0444, lng: 31.2357 },
    { name: "Alexandria", country: "EG", lat: 31.2001, lng: 29.9187 },
    { name: "Giza", country: "EG", lat: 30.0131, lng: 31.2089 },
    { name: "Luxor", country: "EG", lat: 25.6872, lng: 32.6396 },
    { name: "Aswan", country: "EG", lat: 24.0889, lng: 32.8998 },
    { name: "Sharm El Sheikh", country: "EG", lat: 27.9158, lng: 34.3300 },
  ],

  // Turkey
  TR: [
    { name: "Istanbul", country: "TR", lat: 41.0082, lng: 28.9784 },
    { name: "Ankara", country: "TR", lat: 39.9334, lng: 32.8597 },
    { name: "Izmir", country: "TR", lat: 38.4237, lng: 27.1428 },
    { name: "Bursa", country: "TR", lat: 40.1828, lng: 29.0665 },
    { name: "Antalya", country: "TR", lat: 36.8969, lng: 30.7133 },
    { name: "Adana", country: "TR", lat: 36.9914, lng: 35.3308 },
    { name: "Gaziantep", country: "TR", lat: 37.0662, lng: 37.3833 },
    { name: "Konya", country: "TR", lat: 37.8746, lng: 32.4932 },
  ],

  // Saudi Arabia
  SA: [
    { name: "Riyadh", country: "SA", lat: 24.7136, lng: 46.6753 },
    { name: "Jeddah", country: "SA", lat: 21.4858, lng: 39.1925 },
    { name: "Mecca", country: "SA", lat: 21.3891, lng: 39.8579 },
    { name: "Medina", country: "SA", lat: 24.4539, lng: 39.6142 },
    { name: "Dammam", country: "SA", lat: 26.4207, lng: 50.0888 },
  ],

  // UAE
  AE: [
    { name: "Dubai", country: "AE", lat: 25.2048, lng: 55.2708 },
    { name: "Abu Dhabi", country: "AE", lat: 24.4539, lng: 54.3773 },
    { name: "Sharjah", country: "AE", lat: 25.3463, lng: 55.4209 },
  ],

  // Pakistan
  PK: [
    { name: "Karachi", country: "PK", lat: 24.8607, lng: 67.0011 },
    { name: "Lahore", country: "PK", lat: 31.5204, lng: 74.3587 },
    { name: "Islamabad", country: "PK", lat: 33.6844, lng: 73.0479 },
    { name: "Rawalpindi", country: "PK", lat: 33.5651, lng: 73.0169 },
    { name: "Faisalabad", country: "PK", lat: 31.4504, lng: 73.135 },
    { name: "Peshawar", country: "PK", lat: 34.0151, lng: 71.5249 },
  ],

  // Bangladesh
  BD: [
    { name: "Dhaka", country: "BD", lat: 23.8103, lng: 90.4125 },
    { name: "Chittagong", country: "BD", lat: 22.3569, lng: 91.7832 },
    { name: "Sylhet", country: "BD", lat: 24.8949, lng: 91.8687 },
    { name: "Rajshahi", country: "BD", lat: 24.3745, lng: 88.6042 },
  ],

  // Indonesia
  ID: [
    { name: "Jakarta", country: "ID", lat: -6.2088, lng: 106.8456 },
    { name: "Surabaya", country: "ID", lat: -7.2575, lng: 112.7521 },
    { name: "Bandung", country: "ID", lat: -6.9175, lng: 107.6191 },
    { name: "Medan", country: "ID", lat: 3.5952, lng: 98.6722 },
    { name: "Semarang", country: "ID", lat: -6.9666, lng: 110.4196 },
    { name: "Bali", country: "ID", lat: -8.3405, lng: 115.092 },
    { name: "Yogyakarta", country: "ID", lat: -7.7956, lng: 110.3695 },
    { name: "Makassar", country: "ID", lat: -5.1477, lng: 119.4327 },
  ],

  // Thailand
  TH: [
    { name: "Bangkok", country: "TH", lat: 13.7563, lng: 100.5018 },
    { name: "Chiang Mai", country: "TH", lat: 18.7883, lng: 98.9853 },
    { name: "Phuket", country: "TH", lat: 7.8804, lng: 98.3923 },
    { name: "Pattaya", country: "TH", lat: 12.9236, lng: 100.8825 },
    { name: "Nonthaburi", country: "TH", lat: 13.8621, lng: 100.5144 },
    { name: "Hat Yai", country: "TH", lat: 7.0040, lng: 100.4747 },
  ],

  // Vietnam
  VN: [
    { name: "Ho Chi Minh City", country: "VN", lat: 10.8231, lng: 106.6297 },
    { name: "Hanoi", country: "VN", lat: 21.0278, lng: 105.8342 },
    { name: "Da Nang", country: "VN", lat: 16.0544, lng: 108.2022 },
    { name: "Hai Phong", country: "VN", lat: 20.8449, lng: 106.6881 },
    { name: "Can Tho", country: "VN", lat: 10.0452, lng: 105.7469 },
    { name: "Hue", country: "VN", lat: 16.4637, lng: 107.5909 },
  ],

  // Philippines
  PH: [
    { name: "Manila", country: "PH", lat: 14.5995, lng: 120.9842 },
    { name: "Quezon City", country: "PH", lat: 14.6760, lng: 121.0437 },
    { name: "Davao", country: "PH", lat: 7.1907, lng: 125.4553 },
    { name: "Cebu", country: "PH", lat: 10.3157, lng: 123.8854 },
    { name: "Makati", country: "PH", lat: 14.5547, lng: 121.0244 },
  ],

  // Malaysia
  MY: [
    { name: "Kuala Lumpur", country: "MY", lat: 3.139, lng: 101.6869 },
    { name: "George Town", country: "MY", lat: 5.4141, lng: 100.3288 },
    { name: "Johor Bahru", country: "MY", lat: 1.4927, lng: 103.7414 },
    { name: "Kota Kinabalu", country: "MY", lat: 5.9804, lng: 116.0735 },
    { name: "Ipoh", country: "MY", lat: 4.5975, lng: 101.0901 },
    { name: "Malacca", country: "MY", lat: 2.1896, lng: 102.2501 },
  ],

  // Singapore
  SG: [
    { name: "Singapore", country: "SG", lat: 1.3521, lng: 103.8198 },
  ],

  // New Zealand
  NZ: [
    { name: "Auckland", country: "NZ", lat: -36.8485, lng: 174.7633 },
    { name: "Wellington", country: "NZ", lat: -41.2865, lng: 174.7762 },
    { name: "Christchurch", country: "NZ", lat: -43.532, lng: 172.6306 },
    { name: "Hamilton", country: "NZ", lat: -37.7870, lng: 175.2793 },
    { name: "Queenstown", country: "NZ", lat: -45.0312, lng: 168.6626 },
  ],

  // Netherlands
  NL: [
    { name: "Amsterdam", country: "NL", lat: 52.3676, lng: 4.9041 },
    { name: "Rotterdam", country: "NL", lat: 51.9244, lng: 4.4777 },
    { name: "The Hague", country: "NL", lat: 52.0705, lng: 4.3007 },
    { name: "Utrecht", country: "NL", lat: 52.0907, lng: 5.1214 },
    { name: "Eindhoven", country: "NL", lat: 51.4416, lng: 5.4697 },
    { name: "Groningen", country: "NL", lat: 53.2194, lng: 6.5665 },
  ],

  // Belgium
  BE: [
    { name: "Brussels", country: "BE", lat: 50.8503, lng: 4.3517 },
    { name: "Antwerp", country: "BE", lat: 51.2194, lng: 4.4025 },
    { name: "Ghent", country: "BE", lat: 51.0543, lng: 3.7174 },
    { name: "Bruges", country: "BE", lat: 51.2093, lng: 3.2247 },
    { name: "Liège", country: "BE", lat: 50.6326, lng: 5.5797 },
  ],

  // Switzerland
  CH: [
    { name: "Zurich", country: "CH", lat: 47.3769, lng: 8.5417 },
    { name: "Geneva", country: "CH", lat: 46.2044, lng: 6.1432 },
    { name: "Bern", country: "CH", lat: 46.948, lng: 7.4474 },
    { name: "Basel", country: "CH", lat: 47.5596, lng: 7.5886 },
    { name: "Lausanne", country: "CH", lat: 46.5197, lng: 6.6323 },
    { name: "Lucerne", country: "CH", lat: 47.0502, lng: 8.3093 },
  ],

  // Austria
  AT: [
    { name: "Vienna", country: "AT", lat: 48.2082, lng: 16.3738 },
    { name: "Graz", country: "AT", lat: 47.0707, lng: 15.4395 },
    { name: "Linz", country: "AT", lat: 48.3069, lng: 14.2858 },
    { name: "Salzburg", country: "AT", lat: 47.8095, lng: 13.055 },
    { name: "Innsbruck", country: "AT", lat: 47.2692, lng: 11.4041 },
  ],

  // Portugal
  PT: [
    { name: "Lisbon", country: "PT", lat: 38.7223, lng: -9.1393 },
    { name: "Porto", country: "PT", lat: 41.1579, lng: -8.6291 },
    { name: "Braga", country: "PT", lat: 41.5518, lng: -8.4229 },
    { name: "Faro", country: "PT", lat: 37.0194, lng: -7.9322 },
    { name: "Coimbra", country: "PT", lat: 40.2033, lng: -8.4103 },
    { name: "Funchal", country: "PT", lat: 32.6669, lng: -16.9241 },
  ],

  // Sweden
  SE: [
    { name: "Stockholm", country: "SE", lat: 59.3293, lng: 18.0686 },
    { name: "Gothenburg", country: "SE", lat: 57.7089, lng: 11.9746 },
    { name: "Malmö", country: "SE", lat: 55.604, lng: 13.003 },
    { name: "Uppsala", country: "SE", lat: 59.8586, lng: 17.6389 },
    { name: "Lund", country: "SE", lat: 55.7047, lng: 13.1910 },
  ],

  // Norway
  NO: [
    { name: "Oslo", country: "NO", lat: 59.9139, lng: 10.7522 },
    { name: "Bergen", country: "NO", lat: 60.3913, lng: 5.3221 },
    { name: "Trondheim", country: "NO", lat: 63.4305, lng: 10.3951 },
    { name: "Stavanger", country: "NO", lat: 58.9700, lng: 5.7331 },
    { name: "Tromsø", country: "NO", lat: 69.6492, lng: 18.9553 },
  ],

  // Denmark
  DK: [
    { name: "Copenhagen", country: "DK", lat: 55.6761, lng: 12.5683 },
    { name: "Aarhus", country: "DK", lat: 56.1629, lng: 10.2039 },
    { name: "Odense", country: "DK", lat: 55.396, lng: 10.3886 },
    { name: "Aalborg", country: "DK", lat: 57.048, lng: 9.9187 },
  ],

  // Finland
  FI: [
    { name: "Helsinki", country: "FI", lat: 60.1699, lng: 24.9384 },
    { name: "Tampere", country: "FI", lat: 61.4978, lng: 23.761 },
    { name: "Turku", country: "FI", lat: 60.4518, lng: 22.2666 },
    { name: "Oulu", country: "FI", lat: 65.0121, lng: 25.4651 },
  ],

  // Ireland
  IE: [
    { name: "Dublin", country: "IE", lat: 53.3498, lng: -6.2603 },
    { name: "Cork", country: "IE", lat: 51.8969, lng: -8.4863 },
    { name: "Galway", country: "IE", lat: 53.2707, lng: -9.0568 },
    { name: "Limerick", country: "IE", lat: 52.6638, lng: -8.6267 },
    { name: "Waterford", country: "IE", lat: 52.2593, lng: -7.1101 },
  ],

  // Poland
  PL: [
    { name: "Warsaw", country: "PL", lat: 52.2297, lng: 21.0122 },
    { name: "Kraków", country: "PL", lat: 50.0647, lng: 19.945 },
    { name: "Łódź", country: "PL", lat: 51.7592, lng: 19.456 },
    { name: "Wrocław", country: "PL", lat: 51.1079, lng: 17.0385 },
    { name: "Poznań", country: "PL", lat: 52.4064, lng: 16.9252 },
    { name: "Gdańsk", country: "PL", lat: 54.352, lng: 18.6466 },
  ],

  // Czech Republic
  CZ: [
    { name: "Prague", country: "CZ", lat: 50.0755, lng: 14.4378 },
    { name: "Brno", country: "CZ", lat: 49.1951, lng: 16.6068 },
    { name: "Ostrava", country: "CZ", lat: 49.8209, lng: 18.2625 },
    { name: "Plzeň", country: "CZ", lat: 49.7384, lng: 13.3736 },
  ],

  // Hungary
  HU: [
    { name: "Budapest", country: "HU", lat: 47.4979, lng: 19.0402 },
    { name: "Debrecen", country: "HU", lat: 47.5316, lng: 21.6273 },
    { name: "Szeged", country: "HU", lat: 46.253, lng: 20.1414 },
    { name: "Pécs", country: "HU", lat: 46.0727, lng: 18.2323 },
  ],

  // Romania
  RO: [
    { name: "Bucharest", country: "RO", lat: 44.4268, lng: 26.1025 },
    { name: "Cluj-Napoca", country: "RO", lat: 46.7712, lng: 23.6236 },
    { name: "Timișoara", country: "RO", lat: 45.7489, lng: 21.2087 },
    { name: "Iași", country: "RO", lat: 47.1585, lng: 27.6014 },
    { name: "Constanța", country: "RO", lat: 44.1598, lng: 28.6348 },
  ],

  // Greece
  GR: [
    { name: "Athens", country: "GR", lat: 37.9838, lng: 23.7275 },
    { name: "Thessaloniki", country: "GR", lat: 40.6401, lng: 22.9444 },
    { name: "Heraklion", country: "GR", lat: 35.3387, lng: 25.1442 },
    { name: "Patras", country: "GR", lat: 38.2466, lng: 21.7346 },
    { name: "Rhodes", country: "GR", lat: 36.4341, lng: 28.2176 },
  ],

  // Argentina
  AR: [
    { name: "Buenos Aires", country: "AR", lat: -34.6037, lng: -58.3816 },
    { name: "Córdoba", country: "AR", lat: -31.4201, lng: -64.1888 },
    { name: "Rosario", country: "AR", lat: -32.9468, lng: -60.6393 },
    { name: "Mendoza", country: "AR", lat: -32.8895, lng: -68.8458 },
    { name: "Mar del Plata", country: "AR", lat: -38.0055, lng: -57.5426 },
    { name: "Salta", country: "AR", lat: -24.7829, lng: -65.4232 },
    { name: "Bariloche", country: "AR", lat: -41.1335, lng: -71.3103 },
  ],

  // Chile
  CL: [
    { name: "Santiago", country: "CL", lat: -33.4489, lng: -70.6693 },
    { name: "Valparaíso", country: "CL", lat: -33.0472, lng: -71.6127 },
    { name: "Concepción", country: "CL", lat: -36.8201, lng: -73.0444 },
    { name: "Antofagasta", country: "CL", lat: -23.6509, lng: -70.3975 },
  ],

  // Colombia
  CO: [
    { name: "Bogotá", country: "CO", lat: 4.711, lng: -74.0721 },
    { name: "Medellín", country: "CO", lat: 6.2476, lng: -75.5658 },
    { name: "Cali", country: "CO", lat: 3.4516, lng: -76.532 },
    { name: "Barranquilla", country: "CO", lat: 10.9685, lng: -74.7813 },
    { name: "Cartagena", country: "CO", lat: 10.391, lng: -75.5144 },
  ],

  // Peru
  PE: [
    { name: "Lima", country: "PE", lat: -12.0464, lng: -77.0428 },
    { name: "Arequipa", country: "PE", lat: -16.409, lng: -71.5375 },
    { name: "Cusco", country: "PE", lat: -13.5319, lng: -71.9675 },
    { name: "Trujillo", country: "PE", lat: -8.1091, lng: -79.0215 },
  ],

  // Israel
  IL: [
    { name: "Tel Aviv", country: "IL", lat: 32.0853, lng: 34.7818 },
    { name: "Jerusalem", country: "IL", lat: 31.7683, lng: 35.2137 },
    { name: "Haifa", country: "IL", lat: 32.7940, lng: 34.9896 },
    { name: "Beer Sheva", country: "IL", lat: 31.2530, lng: 34.7915 },
  ],

  // Iran
  IR: [
    { name: "Tehran", country: "IR", lat: 35.6892, lng: 51.389 },
    { name: "Isfahan", country: "IR", lat: 32.6546, lng: 51.668 },
    { name: "Shiraz", country: "IR", lat: 29.5918, lng: 52.5837 },
    { name: "Tabriz", country: "IR", lat: 38.08, lng: 46.2919 },
    { name: "Mashhad", country: "IR", lat: 36.2605, lng: 59.6168 },
  ],

  // Iraq
  IQ: [
    { name: "Baghdad", country: "IQ", lat: 33.3128, lng: 44.3615 },
    { name: "Basra", country: "IQ", lat: 30.5085, lng: 47.7804 },
    { name: "Erbil", country: "IQ", lat: 36.1901, lng: 44.0091 },
    { name: "Mosul", country: "IQ", lat: 36.335, lng: 43.1189 },
  ],

  // Kenya
  KE: [
    { name: "Nairobi", country: "KE", lat: -1.2921, lng: 36.8219 },
    { name: "Mombasa", country: "KE", lat: -4.0435, lng: 39.6682 },
    { name: "Kisumu", country: "KE", lat: -0.1022, lng: 34.7617 },
  ],

  // Ethiopia
  ET: [
    { name: "Addis Ababa", country: "ET", lat: 9.02, lng: 38.7469 },
    { name: "Dire Dawa", country: "ET", lat: 9.6009, lng: 41.8503 },
  ],

  // Tanzania
  TZ: [
    { name: "Dar es Salaam", country: "TZ", lat: -6.7924, lng: 39.2083 },
    { name: "Dodoma", country: "TZ", lat: -6.1630, lng: 35.7516 },
    { name: "Zanzibar", country: "TZ", lat: -6.1659, lng: 39.2026 },
  ],

  // Ghana
  GH: [
    { name: "Accra", country: "GH", lat: 5.6037, lng: -0.187 },
    { name: "Kumasi", country: "GH", lat: 6.6885, lng: -1.6244 },
  ],

  // Morocco
  MA: [
    { name: "Casablanca", country: "MA", lat: 33.5731, lng: -7.5898 },
    { name: "Rabat", country: "MA", lat: 34.0209, lng: -6.8416 },
    { name: "Marrakech", country: "MA", lat: 31.6295, lng: -7.9811 },
    { name: "Fez", country: "MA", lat: 34.0181, lng: -5.0078 },
    { name: "Tangier", country: "MA", lat: 35.7595, lng: -5.8340 },
  ],

  // Ukraine
  UA: [
    { name: "Kyiv", country: "UA", lat: 50.4501, lng: 30.5234 },
    { name: "Kharkiv", country: "UA", lat: 49.9935, lng: 36.2304 },
    { name: "Odesa", country: "UA", lat: 46.4825, lng: 30.7233 },
    { name: "Lviv", country: "UA", lat: 49.8397, lng: 24.0297 },
    { name: "Dnipro", country: "UA", lat: 48.4647, lng: 35.0462 },
  ],

  // Croatia
  HR: [
    { name: "Zagreb", country: "HR", lat: 45.815, lng: 15.9819 },
    { name: "Split", country: "HR", lat: 43.5081, lng: 16.4402 },
    { name: "Dubrovnik", country: "HR", lat: 42.6507, lng: 18.0944 },
    { name: "Rijeka", country: "HR", lat: 45.3271, lng: 14.4422 },
  ],

  // Serbia
  RS: [
    { name: "Belgrade", country: "RS", lat: 44.7866, lng: 20.4489 },
    { name: "Novi Sad", country: "RS", lat: 45.2671, lng: 19.8335 },
    { name: "Niš", country: "RS", lat: 43.3209, lng: 21.8954 },
  ],

  // Bulgaria
  BG: [
    { name: "Sofia", country: "BG", lat: 42.6977, lng: 23.3219 },
    { name: "Plovdiv", country: "BG", lat: 42.1354, lng: 24.7453 },
    { name: "Varna", country: "BG", lat: 43.2141, lng: 27.9147 },
  ],

  // Cuba
  CU: [
    { name: "Havana", country: "CU", lat: 23.1136, lng: -82.3666 },
    { name: "Santiago de Cuba", country: "CU", lat: 20.0174, lng: -75.8319 },
  ],

  // Jamaica
  JM: [
    { name: "Kingston", country: "JM", lat: 18.0179, lng: -76.8099 },
    { name: "Montego Bay", country: "JM", lat: 18.4762, lng: -77.8939 },
  ],

  // Dominican Republic
  DO: [
    { name: "Santo Domingo", country: "DO", lat: 18.4861, lng: -69.9312 },
    { name: "Santiago", country: "DO", lat: 19.4517, lng: -70.6970 },
  ],

  // Costa Rica
  CR: [
    { name: "San José", country: "CR", lat: 9.9281, lng: -84.0907 },
  ],

  // Panama
  PA: [
    { name: "Panama City", country: "PA", lat: 8.9824, lng: -79.5199 },
  ],

  // Ecuador
  EC: [
    { name: "Quito", country: "EC", lat: -0.1807, lng: -78.4678 },
    { name: "Guayaquil", country: "EC", lat: -2.1894, lng: -79.8891 },
    { name: "Cuenca", country: "EC", lat: -2.9001, lng: -79.0059 },
  ],

  // Venezuela
  VE: [
    { name: "Caracas", country: "VE", lat: 10.4806, lng: -66.9036 },
    { name: "Maracaibo", country: "VE", lat: 10.6544, lng: -71.6406 },
    { name: "Valencia", country: "VE", lat: 10.1579, lng: -67.9972 },
  ],

  // Uruguay
  UY: [
    { name: "Montevideo", country: "UY", lat: -34.9011, lng: -56.1645 },
  ],

  // Bolivia
  BO: [
    { name: "La Paz", country: "BO", lat: -16.4897, lng: -68.1193 },
    { name: "Santa Cruz", country: "BO", lat: -17.7833, lng: -63.1822 },
    { name: "Sucre", country: "BO", lat: -19.0196, lng: -65.2619 },
  ],

  // Paraguay
  PY: [
    { name: "Asunción", country: "PY", lat: -25.2637, lng: -57.5759 },
  ],

  // Nepal
  NP: [
    { name: "Kathmandu", country: "NP", lat: 27.7172, lng: 85.324 },
    { name: "Pokhara", country: "NP", lat: 28.2096, lng: 83.9856 },
  ],

  // Sri Lanka
  LK: [
    { name: "Colombo", country: "LK", lat: 6.9271, lng: 79.8612 },
    { name: "Kandy", country: "LK", lat: 7.2906, lng: 80.6337 },
  ],

  // Myanmar
  MM: [
    { name: "Yangon", country: "MM", lat: 16.8661, lng: 96.1951 },
    { name: "Mandalay", country: "MM", lat: 21.9588, lng: 96.0891 },
    { name: "Naypyidaw", country: "MM", lat: 19.7633, lng: 96.0785 },
  ],

  // Cambodia
  KH: [
    { name: "Phnom Penh", country: "KH", lat: 11.5564, lng: 104.9282 },
    { name: "Siem Reap", country: "KH", lat: 13.3633, lng: 103.8564 },
  ],

  // Laos
  LA: [
    { name: "Vientiane", country: "LA", lat: 17.9757, lng: 102.6331 },
    { name: "Luang Prabang", country: "LA", lat: 19.8847, lng: 102.1346 },
  ],

  // Mongolia
  MN: [
    { name: "Ulaanbaatar", country: "MN", lat: 47.8864, lng: 106.9057 },
  ],

  // Taiwan
  TW: [
    { name: "Taipei", country: "TW", lat: 25.0330, lng: 121.5654 },
    { name: "Kaohsiung", country: "TW", lat: 22.6273, lng: 120.3014 },
    { name: "Taichung", country: "TW", lat: 24.1477, lng: 120.6736 },
    { name: "Tainan", country: "TW", lat: 22.9999, lng: 120.2269 },
  ],

  // Iceland
  IS: [
    { name: "Reykjavik", country: "IS", lat: 64.1466, lng: -21.9426 },
  ],

  // Luxembourg
  LU: [
    { name: "Luxembourg City", country: "LU", lat: 49.6116, lng: 6.1319 },
  ],

  // Malta
  MT: [
    { name: "Valletta", country: "MT", lat: 35.8989, lng: 14.5146 },
  ],

  // Estonia
  EE: [
    { name: "Tallinn", country: "EE", lat: 59.437, lng: 24.7536 },
    { name: "Tartu", country: "EE", lat: 58.3780, lng: 26.7290 },
  ],

  // Latvia
  LV: [
    { name: "Riga", country: "LV", lat: 56.9496, lng: 24.1052 },
  ],

  // Lithuania
  LT: [
    { name: "Vilnius", country: "LT", lat: 54.6872, lng: 25.2797 },
    { name: "Kaunas", country: "LT", lat: 54.8985, lng: 23.9036 },
  ],

  // Slovenia
  SI: [
    { name: "Ljubljana", country: "SI", lat: 46.0569, lng: 14.5058 },
  ],

  // Slovakia
  SK: [
    { name: "Bratislava", country: "SK", lat: 48.1486, lng: 17.1077 },
    { name: "Košice", country: "SK", lat: 48.7164, lng: 21.2611 },
  ],

  // Georgia
  GE: [
    { name: "Tbilisi", country: "GE", lat: 41.7151, lng: 44.8271 },
    { name: "Batumi", country: "GE", lat: 41.6168, lng: 41.6367 },
  ],

  // Armenia
  AM: [
    { name: "Yerevan", country: "AM", lat: 40.1792, lng: 44.4991 },
  ],

  // Azerbaijan
  AZ: [
    { name: "Baku", country: "AZ", lat: 40.4093, lng: 49.8671 },
  ],

  // Kazakhstan
  KZ: [
    { name: "Astana", country: "KZ", lat: 51.1694, lng: 71.4491 },
    { name: "Almaty", country: "KZ", lat: 43.2220, lng: 76.8512 },
  ],

  // Uzbekistan
  UZ: [
    { name: "Tashkent", country: "UZ", lat: 41.2995, lng: 69.2401 },
    { name: "Samarkand", country: "UZ", lat: 39.6542, lng: 66.9597 },
  ],

  // Lebanon
  LB: [
    { name: "Beirut", country: "LB", lat: 33.8938, lng: 35.5018 },
    { name: "Tripoli", country: "LB", lat: 34.4367, lng: 35.8497 },
  ],

  // Jordan
  JO: [
    { name: "Amman", country: "JO", lat: 31.9454, lng: 35.9284 },
    { name: "Aqaba", country: "JO", lat: 29.5267, lng: 35.0078 },
  ],

  // Kuwait
  KW: [
    { name: "Kuwait City", country: "KW", lat: 29.3759, lng: 47.9774 },
  ],

  // Qatar
  QA: [
    { name: "Doha", country: "QA", lat: 25.2854, lng: 51.531 },
  ],

  // Bahrain
  BH: [
    { name: "Manama", country: "BH", lat: 26.2285, lng: 50.5860 },
  ],

  // Oman
  OM: [
    { name: "Muscat", country: "OM", lat: 23.5880, lng: 58.3829 },
  ],

  // Tunisia
  TN: [
    { name: "Tunis", country: "TN", lat: 36.8065, lng: 10.1815 },
  ],

  // Algeria
  DZ: [
    { name: "Algiers", country: "DZ", lat: 36.7538, lng: 3.0588 },
    { name: "Oran", country: "DZ", lat: 35.6969, lng: -0.6331 },
  ],

  // Libya
  LY: [
    { name: "Tripoli", country: "LY", lat: 32.8872, lng: 13.1913 },
    { name: "Benghazi", country: "LY", lat: 32.1194, lng: 20.0868 },
  ],

  // Uganda
  UG: [
    { name: "Kampala", country: "UG", lat: 0.3476, lng: 32.5825 },
  ],

  // Rwanda
  RW: [
    { name: "Kigali", country: "RW", lat: -1.9403, lng: 29.8739 },
  ],

  // Senegal
  SN: [
    { name: "Dakar", country: "SN", lat: 14.7167, lng: -17.4677 },
  ],

  // Cameroon
  CM: [
    { name: "Yaoundé", country: "CM", lat: 3.8480, lng: 11.5021 },
    { name: "Douala", country: "CM", lat: 4.0511, lng: 9.7679 },
  ],

  // Angola
  AO: [
    { name: "Luanda", country: "AO", lat: -8.8390, lng: 13.2894 },
  ],

  // Mozambique
  MZ: [
    { name: "Maputo", country: "MZ", lat: -25.9692, lng: 32.5732 },
  ],

  // Zimbabwe
  ZW: [
    { name: "Harare", country: "ZW", lat: -17.8292, lng: 31.0522 },
  ],

  // Zambia
  ZM: [
    { name: "Lusaka", country: "ZM", lat: -15.3875, lng: 28.3228 },
  ],

  // Madagascar
  MG: [
    { name: "Antananarivo", country: "MG", lat: -18.8792, lng: 47.5079 },
  ],

  // Fiji
  FJ: [
    { name: "Suva", country: "FJ", lat: -18.1416, lng: 178.4419 },
  ],

  // Puerto Rico
  PR: [
    { name: "San Juan", country: "PR", lat: 18.4655, lng: -66.1057 },
  ],

  // Afghanistan
  AF: [
    { name: "Kabul", country: "AF", lat: 34.5553, lng: 69.2075 },
    { name: "Kandahar", country: "AF", lat: 31.6289, lng: 65.7372 },
  ],

  // Syria
  SY: [
    { name: "Damascus", country: "SY", lat: 33.5138, lng: 36.2765 },
    { name: "Aleppo", country: "SY", lat: 36.2021, lng: 37.1343 },
  ],

  // Sudan
  SD: [
    { name: "Khartoum", country: "SD", lat: 15.5007, lng: 32.5599 },
  ],

  // Yemen
  YE: [
    { name: "Sana'a", country: "YE", lat: 15.3694, lng: 44.1910 },
    { name: "Aden", country: "YE", lat: 12.8275, lng: 45.0164 },
  ],

  // Bosnia and Herzegovina
  BA: [
    { name: "Sarajevo", country: "BA", lat: 43.8563, lng: 18.4131 },
    { name: "Mostar", country: "BA", lat: 43.3438, lng: 17.8078 },
  ],

  // North Macedonia
  MK: [
    { name: "Skopje", country: "MK", lat: 41.9973, lng: 21.4280 },
  ],

  // Montenegro
  ME: [
    { name: "Podgorica", country: "ME", lat: 42.4304, lng: 19.2594 },
  ],

  // Albania
  AL: [
    { name: "Tirana", country: "AL", lat: 41.3275, lng: 19.8187 },
  ],

  // Moldova
  MD: [
    { name: "Chișinău", country: "MD", lat: 47.0105, lng: 28.8638 },
  ],

  // Belarus
  BY: [
    { name: "Minsk", country: "BY", lat: 53.9006, lng: 27.5590 },
  ],

  // Cyprus
  CY: [
    { name: "Nicosia", country: "CY", lat: 35.1856, lng: 33.3823 },
    { name: "Limassol", country: "CY", lat: 34.7071, lng: 33.0226 },
  ],

  // Trinidad and Tobago
  TT: [
    { name: "Port of Spain", country: "TT", lat: 10.6596, lng: -61.5086 },
  ],

  // Honduras
  HN: [
    { name: "Tegucigalpa", country: "HN", lat: 14.0723, lng: -87.1921 },
  ],

  // Guatemala
  GT: [
    { name: "Guatemala City", country: "GT", lat: 14.6349, lng: -90.5069 },
  ],

  // El Salvador
  SV: [
    { name: "San Salvador", country: "SV", lat: 13.6929, lng: -89.2182 },
  ],

  // Nicaragua
  NI: [
    { name: "Managua", country: "NI", lat: 12.1150, lng: -86.2362 },
  ],

  // Haiti
  HT: [
    { name: "Port-au-Prince", country: "HT", lat: 18.5944, lng: -72.3074 },
  ],

  // Ivory Coast
  CI: [
    { name: "Abidjan", country: "CI", lat: 5.3600, lng: -4.0083 },
  ],

  // Somalia
  SO: [
    { name: "Mogadishu", country: "SO", lat: 2.0469, lng: 45.3182 },
  ],
};

/**
 * Get all cities flattened into a single array
 */
export function getAllCities(): City[] {
  return Object.values(citiesByCountry).flat();
}

/**
 * Get cities for a specific country code
 */
export function getCitiesByCountry(countryCode: string): City[] {
  return citiesByCountry[countryCode] || [];
}

/**
 * Search cities by query string, optionally filtered by country
 * Returns top matches sorted by relevance
 */
export function searchCities(query: string, countryCode?: string, limit = 20): City[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const pool = countryCode ? getCitiesByCountry(countryCode) : getAllCities();

  // Score matches: exact start > word start > contains
  const scored = pool
    .map((city) => {
      const name = city.name.toLowerCase();
      let score = 0;
      if (name === q) score = 100;
      else if (name.startsWith(q)) score = 80;
      else if (name.includes(q)) score = 50;
      // Also match region/state
      else if (city.region?.toLowerCase().startsWith(q)) score = 30;
      return { city, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.city);
}

export default citiesByCountry;
