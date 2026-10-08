export function extractErrorMessage(error, defaultMessage = "Something went wrong. Please try again.") {
  if (!error) return defaultMessage;

  // If the error is an axios/fetch error response with a specific message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.response?.data && typeof error.response.data === 'string') {
    return error.response.data;
  }

  // If it's a standard JS Error
  if (error.message && error.message !== 'Network Error') {
    return error.message;
  }

  return defaultMessage;
}
