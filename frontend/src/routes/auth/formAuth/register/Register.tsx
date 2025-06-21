import React from 'react'
import Input from '../../../../components/input/Input'

const Register = () => {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [typeMember, setTypeMember] = React.useState('')

  return (
    <form>
      <h2>Registro</h2>
      <Input label='Nome' value={name} setValue={setName}/>
      <Input label='Email' value={email} setValue={setEmail} type='email'/>
      <Input label='Senha' value={password} setValue={setPassword}/>
      <Input label='Confime sua senha' value={confirmPassword} setValue={setConfirmPassword}/>
      <button>Cadastrar</button>
    </form>
  )
}

export default Register
