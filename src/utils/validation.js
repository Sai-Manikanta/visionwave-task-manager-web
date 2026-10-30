// These mirror the server's rules so people see problems before submitting.
export function isHttpUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function validateTask(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = 'Enter a task title.';
  if (!values.deadline) errors.deadline = 'Choose a deadline.';
  return errors;
}

export function validateProject(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter a project name.';
  return errors;
}

export function validateLogin(values) {
  const errors = {};
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!values.password) errors.password = 'Enter your password.';
  return errors;
}

export function validateSignUp(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter your name.';
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (values.password.length < 8) errors.password = 'Use at least 8 characters.';
  if (values.password.length > 72) errors.password = 'Use at most 72 characters.';
  if (!values.signupCode.trim()) errors.signupCode = 'Enter the team signup code.';
  return errors;
}
