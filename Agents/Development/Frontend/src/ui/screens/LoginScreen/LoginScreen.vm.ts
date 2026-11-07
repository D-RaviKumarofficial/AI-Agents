import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks.ts';
import { signIn } from '@/store/slices/authSlice.ts';
import {
  authService,
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
} from '@/services/platform/authService/MockAuthService.ts';
import { ServiceResultStatusENUM } from '@/helpers/serviceResult/serviceResultHelpers.ts';

export function useLoginScreenViewModel() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectDemo = (value: string): void => {
    setEmail(value);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  const login = async (): Promise<void> => {
    if (isLoading) return;
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email address and password.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.statusCode !== ServiceResultStatusENUM.OK || !result.data) {
        setError(result.message);
        return;
      }
      dispatch(signIn(result.data));
      setPassword('');
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    isLoading,
    login,
    selectDemo,
    demoAccounts: DEMO_ACCOUNTS,
    demoPassword: DEMO_PASSWORD,
  };
}
