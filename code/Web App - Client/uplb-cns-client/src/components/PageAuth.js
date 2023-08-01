import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../components/AuthHook';

const PageAuth = ({ children }) => {

  const { user, isAuthenticated, setAuth } = useStore();
  const navigate = useNavigate();

  // Check if user session has expired
  useEffect(() => {

    if (!user && !isAuthenticated) {

      fetch('https://uplb-cns-server.onrender.com/auth/refresh',
        { method: 'GET', credentials: 'include'}
      )
      .then(res => res.json() )
      .then(body => {
        if (body.success) {
          setAuth(body.user, body.success);
        }
        else {
          navigate('/');
          toast(body.message, {type: 'error', position:'top-center', hideProgressBar: true, closeButton: false})
        }
      })
      .catch(e => {
        toast(e.toString(), {type: 'error', position:'top-center', hideProgressBar: true, closeButton: false})
        navigate('/');
      })
    }
  }, [isAuthenticated]);

  if (isAuthenticated) return children;
}

export default PageAuth;

// Reference for the PageAuth component: 
// httpss://gist.github.com/mjackson/d54b40a094277b7afdd6b81f51a0393f