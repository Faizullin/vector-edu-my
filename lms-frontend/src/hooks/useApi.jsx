import { useCallback, useEffect, useState } from 'react';
import apiClient from '../services/api';
import { fetchResources } from '@/services/apiResources';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

export function useGet(apiUrl, config = {}) {
  // Merge default config with the user-provided config
  const updatedConfig = {
    usePagination: true, // default to pagination
    useInitial: false, // default: don't auto-fetch on mount
    useDisplayError: true,
    ...config
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // The main fetch function
  const fetchData = useCallback(async (filters = {}, overrideConfig = {}) => {
    const use_config = {
      url: overrideConfig.url !== undefined ? overrideConfig.url : apiUrl,
      usePagination: overrideConfig.usePagination !== undefined ? overrideConfig.usePagination : updatedConfig.usePagination,
      useInitial: overrideConfig.useInitial !== undefined ? overrideConfig.useInitial : updatedConfig.useInitial,
      useDisplayError: overrideConfig.useDisplayError !== undefined ? overrideConfig.useDisplayError : updatedConfig.useDisplayError
    };

    setLoading(true);
    try {
      // Prepare request params
      const params = { ...filters };
      if (!use_config.usePagination) {
        // E.g., your API might use `disablePagination: true` as a param
        params.disablePagination = true;
      }

      // Perform GET using the helper
      const response = await fetchResources(use_config.url, params);
      // Suppose your API returns { data: { results: [...], totalPages: X } } in a 200
      if (response.status === 200) {
        if (use_config.usePagination) {
          // Adapt to your API’s field names
          setData(response.data.results);
          setTotalPages(response.data.totalPages ?? 1);
        } else {
          setData(response.data);
        }
      }
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      console.error(`Failed to fetch resources: ${error}`);
      if (use_config.useDisplayError) {
        if (error instanceof AxiosError) {
          if(error.response.status === 500) {
            toast.error("Unknown server error");
          } else if (error.response.status === 404) {
            toast.error("Resource not found");
          } else {
            const error_data = error.response.data;
            if (error_data && error_data.message) {
              toast.error(`${error_data.message}`);
            } else {
              toast.error("An unexpected request error occurred");
            }
          }
        }
      }
      throw error; // Let the caller handle errors if needed
    }
  }, [apiUrl]);

  // Optionally auto-fetch on mount if `useInitial` is true
  useEffect(() => {
    if (updatedConfig.useInitial) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  return {
    data,
    loading,
    totalPages,
    fetchData // so the consumer can manually call or re-call
  };
}

export function useMutation(config = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updatedConfig = {
    useDisplayError: true,
    ...config
  }

  /**
   * mutate(url, method, data, options)
   * @param {string} url - endpoint
   * @param {string} method - HTTP method (POST, PUT, DELETE, etc.)
   * @param {object?} data - request body (for POST/PUT)
   * @param {object?} options - optional axios config (headers, etc.)
   * @param {object?} overrideConfig - override the default config
   */
  const mutate = async (url, method, data = null, options = {}, overrideConfig = {}) => {
    const use_config = {
      useDisplayError: overrideConfig.useDisplayError !== undefined ? overrideConfig.useDisplayError : updatedConfig.useDisplayError
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient({
        url,
        method,
        data,
        ...options
      });
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err);
      if (use_config.useDisplayError && err instanceof AxiosError) {
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else if (err.response?.status === 500) {
          toast.error("Unknown server error");
        } else {
          toast.error("Request failed");
        }
      }
      throw err;
    }
  };

  return { mutate, loading, error };
}
