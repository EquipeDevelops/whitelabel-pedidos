import React from 'react'
import style from './style.module.css'
import FormAuth from './formAuth/FormAuth'

const Auth = () => {
  return (
    <main className={style.mainContainer}>
      <div className={style.imgContainer}>
      </div>
      <FormAuth />
    </main>
  )
}

export default Auth
