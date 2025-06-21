import React from 'react';
import Login from './login/Login';
import Register from './register/Register';
import style from './style.module.css';

const FormAuth = () => {
  const [methodAction, setMethodAction] = React.useState(true);

  return (
    <div className={style.mainContainer}>
      <div>
        <div className={style.changeMethodButtons}>
          <button onClick={() => setMethodAction(true)} className={methodAction ? style.active : ''}>Login</button>
          <button onClick={() => setMethodAction(false)} className={!methodAction ? style.active : ''}>Cadastro</button>
        </div>
        {methodAction ? <Login /> : <Register />}
      </div>
    </div>
  );
};

export default FormAuth;
