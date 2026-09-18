import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/endpoints.js';

export type GlobalFilters = {
  comunidadeId?: string;
  categoriaId?: string;
};

const KEYS = ['comunidadeId', 'categoriaId'] as const;
export type FilterKey = (typeof KEYS)[number];

export function useGlobalFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<GlobalFilters>(() => {
    const out: GlobalFilters = {};
    for (const key of KEYS) {
      const value = params.get(key);
      if (value) out[key] = value;
    }
    return out;
  }, [params]);

  const setFilter = (key: FilterKey, value?: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  };

  return { filters, setFilter };
}

export const filterDefaults = {
  useQueries: () => {
    const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: api.listCategories });
    const communitiesQuery = useQuery({ queryKey: ['communities'], queryFn: api.listCommunities });
    return {
      categories: categoriesQuery.data ?? [],
      communities: communitiesQuery.data ?? [],
    };
  },
};