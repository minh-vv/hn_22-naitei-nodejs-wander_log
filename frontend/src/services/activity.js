const API_BASE_URL = 'http://localhost:3000';

const activityService = {
  createActivity: async (activityData, token) => {
    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create activity');
    }
    return response.json();
  },
  updateActivity: async (id, activityData, token) => {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update activity with id ${id}`);
    }
    return response.json();
  },
  deleteActivity: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to delete activity with id ${id}`);
    }
    return { message: 'Activity deleted successfully' };
  },
};

export default activityService;
