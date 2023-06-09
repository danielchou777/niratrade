import React from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import * as EmailValidator from 'email-validator';
import Finance from '../../images/Finance.png';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../store/UserContext';

const SigninWrapper = styled.div`
  display: flex;
  height: 90vh;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: #131010;
  margin: auto;
`;

const SigninPic = styled.div`
  background-image: url(${Finance});
  background-size: 500px;
  background-repeat: no-repeat;
  background-color: #131010;
  background-position: center;
  margin-top: 60px;
  width: 500px;
  height: 700px;
`;

const Signin = styled.div`
  border-radius: 18px;
  color: #fff;
  background-color: #131010;
  width: 450px;
  height: 700px;
  display: flex;
  margin-right: 50px;
  margin-left: 150px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const SigninTitle = styled.div`
  width: 100%;
  padding-bottom: 16px;
  margin-bottom: 30px;
  font-size: 54px;
  font-weight: bold;
`;

const SigninInput = styled.input`
  width: 100%;
  font-size: 18px;
  height: 48px;
  padding: 12px 20px;
  margin: 12px 0;
  color: #fff;
  background-color: #131010;
  box-sizing: border-box;
  border: 2px solid #979797;
  border-radius: 4px;

  &:focus {
    outline: none;
    border: 2px solid #ffcf0a;
  }

  &:hover {
    border: 2px solid #ffcf0a;
  }
`;

const SigninBtn = styled.button`
  transition: background-color 1s ease-in-out;
  text-transform: uppercase;
  font-size: 16px;
  font-weight: bold;
  width: 100%;
  height: 48px;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  background-color: #ffcf0a;
  color: black;
  margin-top: 36px;

  &:hover {
    background-color: #ffcf0a;
    opacity: 0.9;
  }
`;

const DivingLine = styled.div`
  width: 100%;
  padding-bottom: 16px;
  border-top: 1px solid #979797;
  margin-top: 30px;
  text-align: center;
  padding-top: 10px;
  color: #979797;
`;

const CreateAccountBtn = styled.button`
  text-transform: uppercase;
  font-size: 16px;
  font-weight: bold;
  width: 100%;
  height: 48px;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  background-color: #494949;
  color: white;

  &:hover {
    background-color: #494949;
    opacity: 0.9;
  }
`;

function Login() {
  const [email, setEmail] = React.useState('test123@gmail.com');
  const [password, setPassword] = React.useState('12345678');
  const { setUser } = React.useContext(UserContext);

  const navigate = useNavigate();

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill in all fields',
      });
      return;
    }

    if (!EmailValidator.validate(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Invalid email address',
      });
      return;
    }

    api
      .signin(email, password)
      .then((json) => {
        window.localStorage.setItem('jwtToken', json.data.access_token);
        setUser(json.data);
        Swal.fire(
          'Success!',
          'You have successfully logged in to NiraTrade!',
          'success'
        ).then(() => {
          navigate(`/trade`);
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Invalid email or password',
        });
        return;
      });
  }
  return (
    <SigninWrapper>
      <Signin>
        <SigninTitle className='login__title'>
          Start trading on NiraTrade!
        </SigninTitle>

        <SigninInput
          type='email'
          placeholder='Email*'
          defaultValue={'test123@gmail.com'}
          onChange={handleEmailChange}
        />
        <SigninInput
          type='password'
          placeholder='Password*'
          defaultValue={'12345678'}
          onChange={handlePasswordChange}
        />

        <SigninBtn onClick={handleLogin}>Sign In</SigninBtn>

        <DivingLine>or</DivingLine>
        <CreateAccountBtn
          onClick={() => {
            navigate(`/signup`);
          }}
        >
          Create Account
        </CreateAccountBtn>
      </Signin>
      <SigninPic></SigninPic>
    </SigninWrapper>
  );
}

export default Login;
