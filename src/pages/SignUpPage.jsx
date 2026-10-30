import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateSignUp } from '../utils/validation.js';

export default function SignUpPage() {
  const { register } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', password: '', signupCode: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    const found = validateSignUp(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await register(values);
    } catch (error) {
      setErrors(error.fields);
      setFormError(error.message);
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="link">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        <Field label="Name" error={errors.name}>
          {(props) => <input {...props} autoComplete="name" value={values.name} onChange={set('name')} />}
        </Field>
        <Field label="Email" error={errors.email}>
          {(props) => <input {...props} type="email" autoComplete="email" value={values.email} onChange={set('email')} />}
        </Field>
        <Field label="Password" error={errors.password} hint="At least 8 characters.">
          {(props) => <input {...props} type="password" autoComplete="new-password" value={values.password} onChange={set('password')} />}
        </Field>
        <Field label="Team signup code" error={errors.signupCode} hint="Ask a teammate for this code.">
          {(props) => <input {...props} autoComplete="off" value={values.signupCode} onChange={set('signupCode')} />}
        </Field>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  );
}
