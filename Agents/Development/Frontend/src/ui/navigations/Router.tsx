import { useEffect, type ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dashboard } from '@/ui/screens/Dashboard/Dashboard.tsx';
import { LoginScreen } from '@/ui/screens/LoginScreen/LoginScreen.tsx';
import { ErrorBoundary } from '@/ui/reusables/ErrorBoundary/ErrorBoundary.tsx';
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts';
import { signOut } from '@/store/slices/authSlice.ts';
import { store } from '@/store/store.ts';

function AuthGuard(): ReactElement {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(
      () => dispatch(signOut()),
      Math.max(0, user.expiresAt - Date.now()),
    );
    return (): void => window.clearTimeout(timer);
  }, [user, dispatch]);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function LoginRoute(): ReactElement {
  const user = useAppSelector((state) => state.auth.user);
  return user ? <Navigate to="/dashboard" replace /> : <LoginScreen />;
}

export function AppRouter(): ReactElement {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <a className="skip-link" href="#main-content">
            Skip to main content
          </a>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/:capabilityId" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  );
}
