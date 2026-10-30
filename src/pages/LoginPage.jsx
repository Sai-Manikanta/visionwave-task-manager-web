import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateLogin } from '../utils/validation.js';

export default function LoginPage() {
  const { login } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    const found = validateLogin(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await login(values);
    } catch (error) {
      setErrors(error.fields);
      setFormError(error.message);
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Log in"
      footer={
        <>
          New to the team?{' '}
          <Link to="/signup" className="link">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        <Field label="Email" error={errors.email}>
          {(props) => <input {...props} type="email" autoComplete="email" value={values.email} onChange={set('email')} />}
        </Field>
        <Field label="Password" error={errors.password}>
          {(props) => <input {...props} type="password" autoComplete="current-password" value={values.password} onChange={set('password')} />}
        </Field>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthCard>
  );
}
