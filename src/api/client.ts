import axios from 'axios';
import type { DailyMetricsPayload } from '../types'; // <-- Add the word 'type' here

// 1. Create a central instance. If you deploy this to the cloud later, 
// you only change the baseURL here!
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Export all your API calls in one clean object
export const api = {
  predictDaily: async (data: DailyMetricsPayload) => {
    // Axios automatically handles the JSON.stringify and response.json()
    const response = await apiClient.post('/predict_daily', data);
    return response.data;
  },
  
  analyzeText: async (text: string) => {
    const response = await apiClient.post('/analyze_text', { text });
    return response.data;
  }
};