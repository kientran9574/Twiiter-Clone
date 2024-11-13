
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
const Login = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate()
    useEffect(() => {
        const access_token = params.get("access_token")
        localStorage.setItem('access_token', access_token)
        navigate('/')
    }, [params, navigate])
    return (
        <div>Login</div>
    )
}

export default Login    