import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsFillPersonFill } from 'react-icons/bs';
import styled from 'styled-components';
import logo from './logo.png';
import api from '../../utils/api';
import { UserContext } from '../../store/UserContext';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 80px;
  width: 100%;
  padding: 0 54px 0 60px;
  z-index: 99;
  background-color: black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #424141;
`;

const Logo = styled(Link)`
  width: 258px;
  height: 36px;
  background-image: url(${logo});
  background-size: contain;
`;

const ServiceLinks = styled.div`
  margin: 0 0 0 57px;
  display: flex;
`;

const ServiceLink = styled.a`
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding-left: 39px;
  padding-right: 11px;
  position: relative;
  text-decoration: none;
  color: white;

  &:hover {
    color: #ffc733;
    cursor: pointer;
  }

  & + &::before {
    content: '|';
    position: absolute;
    left: 0;
    color: #3f3a3a;
  }
`;

const Signin = styled.div`
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  color: black;
  margin-left: auto;
  margin-right: 20px;
  padding: 0 10px;
  width: 100px;
  height: 36px;
  background-color: #ffcf0a;
  border-radius: 4px;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: #ffcf0a;
    opacity: 0.9;
    cursor: pointer;
  }
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  color: #fff;
  margin-left: auto;
  margin-right: 20px;
  padding: 0 10px;
  height: 36px;
  background-color: #000;
  border-radius: 4px;
  text-align: center;
  display: flex;
  align-items: center;
`;

const services = [
  {
    name: 'trade',
    displayText: 'Trade',
  },
  {
    name: 'wallet',
    displayText: 'Wallet',
  },
  {
    name: 'about',
    displayText: 'About us',
  },
];

function Header() {
  const navigate = useNavigate();
  const [isSignin, setIsSignin] = useState(false);

  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    (async function fetchStocks() {
      if (user) {
        setIsSignin(true);
        return;
      }

      const jwtToken = window.localStorage.getItem('jwtToken');
      if (!jwtToken) return;

      const result = await api.getUserProfile(jwtToken);

      if (result.msg === 'Invalid Credentials') {
        window.localStorage.removeItem('jwtToken');
        return;
      }

      setUser(result.data);
      setIsSignin(true);
    })();
  }, [user]);

  return (
    <Wrapper>
      <Logo to='/' />
      <ServiceLinks>
        {services.map(({ name, displayText }, index) => (
          <ServiceLink
            $isActive={services === name}
            key={index}
            onClick={() => {
              navigate(`/${name}`);
            }}
          >
            {displayText}
          </ServiceLink>
        ))}
      </ServiceLinks>
      {isSignin ? (
        <UserName>{`Welcome Back ${user.name}`}</UserName>
      ) : (
        <Signin onClick={() => navigate(`/signin`)}>
          <BsFillPersonFill size={20} />
          Sign In
        </Signin>
      )}
    </Wrapper>
  );
}

export default Header;
