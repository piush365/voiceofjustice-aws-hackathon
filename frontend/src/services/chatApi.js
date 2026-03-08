import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Pre-configured axios instance with API key auth and timeout.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45_000, // 45 s — slightly longer than backend's Bedrock timeout
});

api.interceptors.request.use((config) => {
  const key = import.meta.env.VITE_API_KEY;
  if (key) {
    config.headers['X-API-Key'] = key;
  }
  return config;
});

export async function sendChatMessage(sessionId, message) {
  const response = await api.post('/chat', {
    session_id: sessionId,
    message,
  });

  return response.data;
}

export async function generateLegalNotice(sessionId) {
  const response = await api.post('/generate-document', {
    session_id: sessionId,
  });

  return response.data;
}

