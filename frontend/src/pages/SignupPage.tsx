import { useNavigate } from 'react-router-dom';
import { SignupForm } from '../components/SignupForm';

export function SignupPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px' }}>
      <SignupForm onSuccess={() => navigate('/home')} />

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>
          Already have an account?{' '}
          <a
            href="/login"
            style={{ color: '#1976d2', textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
