const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('siproker_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('siproker_token');
      window.location.href = '/login';
      return Promise.reject(new Error('Unauthorized'));
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = new Error(data?.message || 'Something went wrong');
      error.response = { data, status: response.status };
      return Promise.reject(error);
    }

    // Return format compatible with existing axios code (res.data)
    return { data, status: response.status };
  } catch (err) {
    if (!err.response) {
      err.response = { data: { message: err.message }, status: 500 };
    }
    return Promise.reject(err);
  }
};

const api = {
  get: (url, config) => request(url, { method: 'GET', ...config }),
  post: (url, body, config) => request(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...config }),
  put: (url, body, config) => request(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...config }),
  patch: (url, body, config) => request(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, ...config }),
  delete: (url, config) => request(url, { method: 'DELETE', ...config }),
};

export default api;
