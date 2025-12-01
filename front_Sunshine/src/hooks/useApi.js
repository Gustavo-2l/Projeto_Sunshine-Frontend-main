/**
* Custom hooks for API operations
* Provides reusable logic for common API patterns
*/
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
 
/**
* Generic hook for API calls with loading and error states
*/
export const useApiCall = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Erro na operação');
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);
 
  useEffect(() => {
    execute();
  }, [execute]);
 
  return { data, loading, error, refetch: execute };
};
 
/**
* Hook for mutations (create, update, delete operations)
*/
export const useMutation = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Erro na operação');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);
 
  return { mutate, loading, error };
};