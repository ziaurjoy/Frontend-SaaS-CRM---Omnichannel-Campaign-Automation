const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  token?: string;
  businessId?: string;
}

export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
  const { token, businessId, ...customOptions } = options;
  const headers = new Headers(customOptions.headers || {});

  // Add Auth headers
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      headers.set('Authorization', `Bearer ${storedToken}`);
    }
  }

  // Add Multi-Tenant header
  if (businessId) {
    headers.set('X-Business-ID', businessId);
  } else if (typeof window !== 'undefined') {
    const storedBusinessId = localStorage.getItem('active_business_id');
    if (storedBusinessId) {
      headers.set('X-Business-ID', storedBusinessId);
    }
  }

  // Set content type to JSON by default if body is present and not FormData
  if (customOptions.body && !(customOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...customOptions,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || JSON.stringify(errorData);
    } catch {
      errorMsg = response.statusText;
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
