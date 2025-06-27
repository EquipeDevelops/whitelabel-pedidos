import React from 'react'
import Input from '../../../../components/input/Input'
import { Link } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  return (
    <form>
      <h2>Login</h2>
      <Input value={email} setValue={setEmail} label='Email'/>
      <Input value={password} setValue={setPassword} label='Senha'/>
      <button>Entrar</button>
      <Link to="/auth/esqueci-minha-senha">Esqueceu sua senha?</Link>
    </form>
  )
}

export default Login
