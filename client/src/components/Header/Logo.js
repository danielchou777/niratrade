import React, { Component } from 'react';
import styled from 'styled-components';
import { ReactComponent as Logo } from './logo.svg';
import { Link, useNavigate } from 'react-router-dom';

const Wrapper = styled.div`
  width: 258px;
  height: 36px;
  fill: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
    & path {
      fill: #ffc733;
    }
  }

  & path {
    fill: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

class HeaderLogo extends Component {
  render() {
    return (
      <Wrapper>
        <Logo />
      </Wrapper>
    );
  }
}

export default HeaderLogo;
