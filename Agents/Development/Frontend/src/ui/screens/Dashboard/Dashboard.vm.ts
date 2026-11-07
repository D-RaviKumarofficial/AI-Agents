import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts';
import { signOut } from '@/store/slices/authSlice.ts';
import { CAPABILITIES, ROLE_LABELS, canApprove, canView } from '@/helpers/config/accessConfig.ts';
import { ServiceResultStatusENUM } from '@/helpers/serviceResult/serviceResultHelpers.ts';
import { dashboardScreenService } from '@/services/screens/dashboardScreenService/MockDashboardScreenService.ts';
import { caseDomainService } from '@/services/domains/caseDomainService/MockCaseDomainService.ts';
import { authService } from '@/services/platform/authService/MockAuthService.ts';
import type { CaseBO } from '@/types/orchestration/CaseBO.ts';

export function useDashboardViewModel() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { capabilityId } = useParams();
  const [cases, setCases] = useState<CaseBO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeCapability = CAPABILITIES.find((item) => item.id === capabilityId);
  const isDenied = Boolean(
    capabilityId && (!activeCapability || !canView(user, activeCapability.id)),
  );
  const accessibleCount = CAPABILITIES.filter((item) => canView(user, item.id)).length;

  const loadDashboardData = useCallback(async (): Promise<void> => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await dashboardScreenService.getCases(user);
      if (result.statusCode === ServiceResultStatusENUM.OK && result.data) setCases(result.data);
      else {
        setCases([]);
        setError(result.message);
      }
    } catch {
      setCases([]);
      setError('Unable to load cases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);
  useEffect(() => {
    setSelectedCaseId(null);
    setReviewNote('');
    setReviewError('');
    setFeedback('');
    setQuery('');
    setStatusFilter('all');
    setSeverityFilter('all');
    setMobileMenuOpen(false);
  }, [capabilityId]);

  const scopedCases = useMemo(
    () =>
      isDenied
        ? []
        : cases.filter((item) => !activeCapability || item.capability === activeCapability.id),
    [cases, activeCapability, isDenied],
  );
  const visibleCases = useMemo(
    () =>
      scopedCases.filter(
        (item) =>
          (statusFilter === 'all' || item.status === statusFilter) &&
          (severityFilter === 'all' || item.severity === severityFilter) &&
          `${item.id} ${item.title} ${item.fraudType} ${item.assignedUnit} ${item.indicators.join(' ')}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [scopedCases, statusFilter, severityFilter, query],
  );
  const selectedCase = visibleCases.find((item) => item.id === selectedCaseId);
  const pendingCount = scopedCases.filter((item) => item.status === 'awaiting-approval').length;
  const highSeverityCount = scopedCases.filter((item) =>
    ['high', 'critical'].includes(item.severity),
  ).length;
  const reviewedCount = scopedCases.filter((item) => item.approval).length;

  const selectCase = (id: string): void => {
    setSelectedCaseId(selectedCaseId === id ? null : id);
    setReviewNote('');
    setReviewError('');
    setFeedback('');
  };
  const resetFilters = (): void => {
    setQuery('');
    setStatusFilter('all');
    setSeverityFilter('all');
  };
  const showPending = (): void => {
    setQuery('');
    setStatusFilter('awaiting-approval');
    setSeverityFilter('all');
  };

  const review = async (decision: 'approved' | 'rejected'): Promise<void> => {
    if (!user || !selectedCase || isReviewing) return;
    setReviewError('');
    setFeedback('');
    if (!canApprove(user, selectedCase.capability)) {
      setReviewError('Your role cannot approve recommendations.');
      return;
    }
    if (reviewNote.trim().length < 10 || reviewNote.length > 500) {
      setReviewError('Add a review note of 10–500 characters before submitting.');
      return;
    }
    setIsReviewing(true);
    try {
      const result = await caseDomainService.review(user, selectedCase, decision, reviewNote);
      if (result.statusCode !== ServiceResultStatusENUM.OK || !result.data) {
        setReviewError(result.message);
        return;
      }
      const updatedCase = result.data;
      setCases((current) =>
        current.map((item) => (item.id === updatedCase.id ? updatedCase : item)),
      );
      // Keep the reviewed record visible after leaving the pending queue.
      setStatusFilter('all');
      setReviewNote('');
      setFeedback(result.message);
    } catch {
      setReviewError('Review could not be saved. Please try again.');
    } finally {
      setIsReviewing(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setCases([]);
    dispatch(signOut());
    navigate('/login', { replace: true });
  };

  return {
    user,
    roleLabel: user ? ROLE_LABELS[user.role] : '',
    capabilities: CAPABILITIES,
    activeCapability,
    isDenied,
    accessibleCount,
    cases,
    scopedCases,
    visibleCases,
    selectedCase,
    isLoading,
    error,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    severityFilter,
    setSeverityFilter,
    pendingCount,
    highSeverityCount,
    reviewedCount,
    selectCase,
    resetFilters,
    showPending,
    reviewNote,
    setReviewNote,
    reviewError,
    isReviewing,
    feedback,
    review,
    logout,
    loadDashboardData,
    mobileMenuOpen,
    setMobileMenuOpen,
    mayView: (id: Parameters<typeof canView>[1]): boolean => canView(user, id),
    mayApprove: (id: Parameters<typeof canApprove>[1]): boolean => canApprove(user, id),
  };
}
