import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

 const AuthRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            navigate('/beranda');
        } else {
            navigate('/auth');
        }
    }, [navigate]);

    return null; // Komponen ini tidak mengembalikan JSX apapun
};
export default AuthRedirect