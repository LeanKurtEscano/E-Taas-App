

const getErrorMessage = (err: any): string => {
  // Network/timeout errors
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'Please check your network connection and try again.';
  }
  
  if (err.message === 'Network Error' || !err.response) {
    return 'Please check your network connection and try again.';
  }

  // Server errors (5xx)
  if (err.response?.status >= 500) {
    return 'Something went wrong. Please try again later.';
  }

  // Client errors (4xx)
  if (err.response?.status >= 400 && err.response?.status < 500) {
    return err.response?.data?.message || 'Unable to process your request.';
  }

  return 'Please check your network connection and try again.';
};