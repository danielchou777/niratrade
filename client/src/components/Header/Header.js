import { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsFillPersonFill } from 'react-icons/bs';
import { AiFillCaretDown } from 'react-icons/ai';
import styled from 'styled-components';
import logo from './logo.png';
import HeaderLogo from './Logo';
import api from '../../utils/api';
import { UserContext } from '../../store/UserContext';
import Swal from 'sweetalert2';

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

const HeaderLogoWrapper = styled.div``;

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
  font-size: 13px;
  position: relative;
  text-transform: uppercase;
  color: #fff;
  margin-left: auto;
  margin-right: 20px;
  padding: 0 10px;
  height: 36px;
  background-color: #222;
  border-radius: 4px;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    cursor: pointer;
    color: #ffc733;
  }
`;

const UserNameStyle = styled.div`
  padding: 0 6px;
  font-size: 13px;
  font-weight: bold;
`;

/* DropdownContent */
const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 1px;
  padding: 10px 0;
  width: 100%;
  background-color: #222;
  border-radius: 4px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 13px;
`;

/* DropdownItem */
const DropdownItem = styled.div`
  color: #fff;
  width: 100%;
  text-align: center;
  cursor: pointer;

  &:hover {
    color: #ffc733;
    // background-color: #3f3a3a;
  }
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
];

function Header() {
  const navigate = useNavigate();
  const [isSignin, setIsSignin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('jwtToken');

    Swal.fire(
      'Logout',
      'You have been successfully logged out.',
      'success'
    ).then(() => {
      setIsSignin(false);
      navigate('/');
    });
  };

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
        setUser('');
        return;
      }

      setUser(result.data);
      setIsSignin(true);
    })();
  }, [user]);

  return (
    <Wrapper>
      {/* <Logo to='/' /> */}
      <HeaderLogoWrapper onClick={() => navigate('/')}>
        <HeaderLogo />
      </HeaderLogoWrapper>
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
        <UserName onClick={handleDropdownToggle}>
          {`Welcome Back`}
          <UserNameStyle>{` ${user.name}`}</UserNameStyle>
          <AiFillCaretDown size={16} />
          {isDropdownOpen ? (
            <DropdownContent>
              {/* Dropdown content goes here */}
              <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
            </DropdownContent>
          ) : null}
        </UserName>
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
