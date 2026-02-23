const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Ensure method is a valid string
  const method = options.method || 'GET';
  
  // Validate that method is a string
  if (typeof method !== 'string') {
    console.error('Invalid HTTP method:', method);
    throw new Error('Invalid HTTP method provided');
  }

  const config = {
    method: method.toUpperCase(), // Ensure method is uppercase
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Add credentials for cookies if needed
    credentials: 'include',
  };

  // Only add body for non-GET requests
  if (options.body && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD') {
    config.body = options.body;
  }

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  config.signal = controller.signal;

  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`Making ${config.method} request to:`, url);
    if (config.body && config.method !== 'GET') {
      try {
        console.log('Request body:', JSON.parse(config.body));
      } catch (e) {
        console.log('Request body (raw):', config.body);
      }
    }
    
    const res = await fetch(url, config);
    clearTimeout(timeoutId); // Clear timeout on successful response

    if (res.status === 401) {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('linkedId');
      localStorage.removeItem('schoolName');
      localStorage.removeItem('branchName');
      
      // Check if we're not already on the login page
      if (!window.location.pathname.includes('/')) {
        window.location.href = '/';
      }
      
      throw new Error('Session expired. Please login again.');
    }

    // Handle 204 No Content (successful delete, etc.)
    if (res.status === 204) {
      return { success: true, data: null };
    }

    // Try to parse the response as JSON
    let data;
    const contentType = res.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Invalid JSON response from server');
      }
    } else {
      // If not JSON, get text
      const text = await res.text();
      console.warn(`Server returned non-JSON response (${res.status}):`, text.substring(0, 200));
      
      // For successful responses with text, wrap it in an object
      if (res.ok) {
        return { 
          success: true, 
          data: text,
          message: text 
        };
      } else {
        throw new Error(text || `Request failed with status ${res.status}`);
      }
    }
    
    console.log('Response status:', res.status);
    console.log('Response data:', data);
    
    if (!res.ok) {
      // Extract error message from various possible locations
      const errorMessage = 
        data.message || 
        data.error || 
        (typeof data === 'string' ? data : `Request failed with status ${res.status}`);
      
      // Log detailed error information
      console.error('API Error Details:', {
        status: res.status,
        statusText: res.statusText,
        data: data,
        endpoint: endpoint,
        method: config.method
      });
      
      // Create error object with additional properties
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      error.endpoint = endpoint;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId); // Clear timeout on error as well
    
    // Handle abort errors (timeout)
    if (error.name === 'AbortError') {
      console.error('Request timeout:', endpoint);
      throw new Error('Request timeout. Please check your connection and try again.');
    }
    
    // Handle network errors
    if (error.message === 'Failed to fetch') {
      console.error('Network error - server may be down:', error);
      throw new Error('Unable to connect to server. Please check if the server is running.');
    }
    
    console.error('API Request Error:', error);
    throw error;
  }
}

// Helper function for form data (file uploads, etc.)
export async function apiRequestFormData(endpoint, formData, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const method = options.method || 'POST';
  
  const config = {
    method: method.toUpperCase(),
    headers: {
      ...headers,
      ...options.headers,
    },
    body: formData,
    credentials: 'include',
  };

  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`Making ${config.method} (FormData) request to:`, url);
    
    const res = await fetch(url, config);

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('linkedId');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }

    let data;
    const contentType = res.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      if (res.ok) {
        return { success: true, message: text };
      } else {
        throw new Error(text || `Request failed with status ${res.status}`);
      }
    }
    
    if (!res.ok) {
      const errorMessage = data.message || data.error || 'Request failed';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API FormData Request Error:', error);
    throw error;
  }
}

// Helper function to check if server is running
export async function checkServerHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(`${BASE_URL}/health`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return res.ok;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
}