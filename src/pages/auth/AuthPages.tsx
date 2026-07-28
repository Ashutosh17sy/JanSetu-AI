import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { UserRole } from '@/services/types';

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { signIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const from = (location.state as { from?: string })?.from;

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!', 'You are now signed in.');
      navigate(from || '/app', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed.';
      toast.error('Sign in failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your civic complaints and tasks.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@city.gov.in"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/30" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        New to JanSetu AI?{' '}
        <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

interface SignupForm {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export function SignupPage() {
  const { signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({ defaultValues: { role: 'citizen' } });

  const role = watch('role');

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.full_name, data.role);
      toast.success('Account created', 'Please sign in with your new credentials.');
      navigate('/login', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed.';
      toast.error('Sign up failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string; desc: string }[] = [
    { value: 'citizen', label: 'Citizen', desc: 'Report & track civic issues' },
    { value: 'admin', label: 'Municipal Admin', desc: 'Oversee all operations' },
    { value: 'officer', label: 'Department Officer', desc: 'Assign & manage complaints' },
    { value: 'worker', label: 'Field Worker', desc: 'Execute assigned tasks' },
  ];

  return (
    <AuthLayout title="Create your account" subtitle="Join JanSetu AI to report and resolve civic issues.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          placeholder="Aarav Sharma"
          error={errors.full_name?.message}
          {...register('full_name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@city.gov.in"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">I am a...</p>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => (
              <label
                key={r.value}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  role === r.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <input type="radio" value={r.value} className="sr-only" {...register('role')} />
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{r.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{r.desc}</p>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
