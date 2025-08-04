const API_BASE_URL = 'http://localhost:3000/itineraries';

const itineraryService = {
  getAllItineraries: async (token) => {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch itineraries');
    }
    return response.json();
  },

  getItineraryById: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to fetch itinerary with id ${id}`);
    }
    return response.json();
  },

  createItinerary: async (itineraryData, token) => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itineraryData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create itinerary');
    }
    return response.json();
  },

  updateItinerary: async (id, itineraryData, token) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itineraryData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update itinerary with id ${id}`);
    }
    return response.json();
  },

  deleteItinerary: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to delete itinerary with id ${id}`);
    }
    return response.json();
  },
};

export default itineraryService;
