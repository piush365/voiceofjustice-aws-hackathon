export function getApiErrorMessage(error, fallbackMessage) {
  // Axios timeout (ECONNABORTED)
  if (error?.code === 'ECONNABORTED') {
    return '⏱️ The request timed out. The server may be busy — please try again in a moment.';
  }

  // Network error (no response received at all)
  if (error?.message === 'Network Error' || !error?.response) {
    return '🔌 Cannot reach the server. Please check your connection and try again.';
  }

  // Server returned a detailed error message
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim().length > 0) {
    return detail;
  }

  return fallbackMessage;
}


