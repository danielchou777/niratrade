import React, { Component } from 'react';
import styled from 'styled-components';
import { ReactComponent as Bull } from './bull.svg';

const Wrapper = styled.div`
  width: 40px;
  height: 100%;
  margin-right: 8px;
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
    fill: black;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

class BullLogo extends Component {
  render() {
    return (
      <Wrapper>
        <Bull />
      </Wrapper>
    );
  }
}

export default BullLogo;
