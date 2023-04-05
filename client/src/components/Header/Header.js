import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import logo from './logo.png';

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
  letter-spacing: 5px;
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

  return (
    <Wrapper>
      <Logo to='/' />
      <ServiceLinks>
        {services.map(({ name, displayText }, index) => (
          <ServiceLink
            $isActive={services === name}
            key={index}
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
              navigate(`/${name}`);
            }}
          >
            {displayText}
          </ServiceLink>
        ))}
      </ServiceLinks>
    </Wrapper>
  );
}

export default Header;
