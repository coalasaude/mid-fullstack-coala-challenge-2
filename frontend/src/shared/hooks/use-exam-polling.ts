'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient, ApiError } from '@/core/api';
import type { ExamListItem } from '@/shared/types';
import { useI18n } from '@/shared/i18n';

interface UseExamPollingResult {
  exams: ExamListItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useExamPolling(intervalMs = 5000): UseExamPollingResult {
  const { t } = useI18n();
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const fetchExams = useCallback(
    async (isInitial: boolean) => {
      if (isInitial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      try {
        const data = await apiClient.exams.list();
        if (cancelledRef.current) return;
        setExams(data);
        setError(null);
      } catch (err) {
        if (cancelledRef.current) return;
        setError(
          err instanceof ApiError ? err.message : t('errors.loadExams'),
        );
      } finally {
        if (cancelledRef.current) return;
        if (isInitial) setLoading(false);
        setRefreshing(false);
      }
    },
    [t],
  );

  const refresh = useCallback(() => fetchExams(false), [fetchExams]);

  useEffect(() => {
    cancelledRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing UI with the exams API (external system) via initial fetch + polling
    void fetchExams(true);
    const id = window.setInterval(() => {
      void fetchExams(false);
    }, intervalMs);
    return () => {
      cancelledRef.current = true;
      window.clearInterval(id);
    };
  }, [fetchExams, intervalMs]);

  return { exams, loading, refreshing, error, refresh };
}
