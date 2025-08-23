import { useState, useEffect, useCallback } from 'react';
import { SubCriteria, subCriteriaApi } from '@/lib/api';

export interface UseSubCriteriaOptions {
  criterionId?: string;
  loadOnMount?: boolean;
}

export interface UseSubCriteriaReturn {
  subCriteria: SubCriteria[];
  loading: boolean;
  error: string | null;
  loadSubCriteria: (criterionId: string) => Promise<void>;
  updateSubCriteria: (criterionId: string, data: Array<{ label: string; value: number; order: number }>) => Promise<boolean>;
  resetToDefault: () => Promise<void>;
  getDefaultTemplate: () => Promise<void>;
}

export const useSubCriteria = (options: UseSubCriteriaOptions = {}): UseSubCriteriaReturn => {
  const { criterionId, loadOnMount = true } = options;

  const [subCriteria, setSubCriteria] = useState<SubCriteria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubCriteria = useCallback(async (targetCriterionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await subCriteriaApi.getSubCriteria(targetCriterionId);
      
      if (response.success && response.data) {
        setSubCriteria(response.data.subCriteria);
      } else {
        throw new Error(response.message || 'Failed to load sub-criteria');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load sub-criteria');
      console.warn('Could not load sub-criteria:', err.message);
      
      // Try to load default template as fallback
      await getDefaultTemplate();
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubCriteria = useCallback(async (
    targetCriterionId: string,
    data: Array<{ label: string; value: number; order: number }>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await subCriteriaApi.updateSubCriteria(targetCriterionId, data);
      
      if (response.success && response.data) {
        setSubCriteria(response.data.subCriteria);
        return true;
      } else {
        throw new Error(response.message || 'Failed to update sub-criteria');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update sub-criteria');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDefaultTemplate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await subCriteriaApi.getDefaultTemplate();
      
      if (response.success && response.data) {
        // Convert template to SubCriteria format (without id and criterionId)
        const defaultSubCriteria: SubCriteria[] = response.data.subCriteria.map((item, index) => ({
          id: `default-${index}`,
          criterionId: '',
          label: item.label,
          value: item.value,
          order: item.order,
        }));
        
        setSubCriteria(defaultSubCriteria);
      } else {
        // Fallback to hardcoded defaults
        const fallbackDefaults: SubCriteria[] = [
          { id: 'default-1', criterionId: '', label: 'Sangat Rendah', value: 1, order: 1 },
          { id: 'default-2', criterionId: '', label: 'Rendah', value: 2, order: 2 },
          { id: 'default-3', criterionId: '', label: 'Sedang', value: 3, order: 3 },
          { id: 'default-4', criterionId: '', label: 'Tinggi', value: 4, order: 4 },
          { id: 'default-5', criterionId: '', label: 'Sangat Tinggi', value: 5, order: 5 },
        ];
        
        setSubCriteria(fallbackDefaults);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load default template');
      
      // Last resort: hardcoded defaults
      const fallbackDefaults: SubCriteria[] = [
        { id: 'default-1', criterionId: '', label: 'Sangat Rendah', value: 1, order: 1 },
        { id: 'default-2', criterionId: '', label: 'Rendah', value: 2, order: 2 },
        { id: 'default-3', criterionId: '', label: 'Sedang', value: 3, order: 3 },
        { id: 'default-4', criterionId: '', label: 'Tinggi', value: 4, order: 4 },
        { id: 'default-5', criterionId: '', label: 'Sangat Tinggi', value: 5, order: 5 },
      ];
      
      setSubCriteria(fallbackDefaults);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetToDefault = useCallback(async () => {
    await getDefaultTemplate();
  }, [getDefaultTemplate]);

  // Load sub-criteria on mount if criterionId provided
  useEffect(() => {
    if (loadOnMount && criterionId) {
      loadSubCriteria(criterionId);
    } else if (loadOnMount && !criterionId) {
      // Load default template if no criterionId provided
      getDefaultTemplate();
    }
  }, [criterionId, loadOnMount, loadSubCriteria, getDefaultTemplate]);

  return {
    subCriteria,
    loading,
    error,
    loadSubCriteria,
    updateSubCriteria,
    resetToDefault,
    getDefaultTemplate,
  };
};