import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px' }}>
      <LoginForm onSuccess={() => navigate('/home')} />

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>
          Don't have an account?{' '}
          <a
            href="/signup"
            style={{ color: '#1976d2', textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/signup');
            }}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
