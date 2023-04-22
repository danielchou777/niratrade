import React from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import * as EmailValidator from 'email-validator';
import Investment from '../../images/Investment.png';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../store/UserContext';

const SignupWrapper = styled.div`
  display: flex;
  height: 90vh;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: #131010;
  margin: auto;
`;

const SignupPic = styled.div`
  background-image: url(${Investment});
  background-size: 500px;
  background-repeat: no-repeat;
  background-color: #131010;
  background-position: center;
  margin-top: 60px;
  width: 500px;
  height: 700px;
`;

const Signup = styled.div`
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

const SignupTitle = styled.div`
  width: 100%;
  padding-bottom: 16px;
  margin-bottom: 30px;
  font-size: 54px;
  font-weight: bold;
`;

const SignupInput = styled.input`
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

const SignupBtn = styled.button`
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

function Register() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { setUser } = React.useContext(UserContext);

  const navigate = useNavigate();

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  function handleSignup(e) {
    e.preventDefault();
    if (!email || !password || !name) {
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

    if (password.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Password must be at least 8 characters',
      });
      return;
    }

    api
      .signup(name, email, password)
      .then((json) => {
        if (json.msg) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: json.msg,
          });
          return;
        }
        window.localStorage.setItem('jwtToken', json.data.access_token);
        setUser(json.data);
        navigate(`/trade`);
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'failed registration',
        });
        return;
      });
  }
  return (
    <SignupWrapper>
      <Signup>
        <SignupTitle className='Signup__title'>
          Begin your journey with US!
        </SignupTitle>

        <SignupInput placeholder='Name*' onChange={handleNameChange} />

        <SignupInput
          type='email'
          placeholder='Email*'
          onChange={handleEmailChange}
        />
        <SignupInput
          type='password'
          placeholder='Password*'
          onChange={handlePasswordChange}
        />

        <SignupBtn onClick={handleSignup}>Sign up</SignupBtn>
      </Signup>
      <SignupPic></SignupPic>
    </SignupWrapper>
  );
}

export default Register;
