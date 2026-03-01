// frontend/services/api.js
import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
});

export const sendMessageToBot = async (messagePayload) => {
  try {
    const response = await apiClient.post('/webhook/web', messagePayload);
    return response.data;
  } catch (error) {
    console.error('Error sending message to bot:', error);
    throw error;
  }
};


export const getAddressFromCoords = async (latitude, longitude) => {
  try {
    const response = await apiClient.post('/api/reverse-geocode', {
      latitude,
      longitude,
    });
    return response.data; // e.g., { displayName: "Chennai, Tamil Nadu" }
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
};

// --- X-RAY UPLOAD API FUNCTION ---
export const uploadXrayImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/xray-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading X-ray image:', error);
    throw error;
  }
};


export const uploadDocument = async (formData) => {
  try {
    // MODIFIED: Now uses apiClient, just like the X-ray function.
    const response = await apiClient.post('/api/document/upload/', formData);
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error.response?.data || error;
  }
};

export const queryDocument = async (formData) => {a
  try {
    // MODIFIED: Now uses apiClient for consistency.
    const response = await apiClient.post('/api/document/query/', formData,{
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error querying document:', error);
    throw error.response?.data || error;
  }
};  