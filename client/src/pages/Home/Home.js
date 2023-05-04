import React from 'react';
import styled from 'styled-components';
import tradePic from './trade.png';
import laptopPic from './laptop.png';
import BullLogo from './bull.js';
import portfolioPic from './Portfolio.png';
import homePic from './home-bg2.jpg';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../store/UserContext';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #131010;
  margin: auto;
`;

const Intro1Background = styled.div`
  width: 100%;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url(${homePic});
  background-size: cover;
  background-position: center;
  height: 100vh;
`;

const IntroSec1 = styled.div`
  margin: 0px 100px 0 200px;
  height: 80vh;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const IntroSec1Left = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 60px;
  margin-left: 40px;
`;

const IntroSec1LeftTitle = styled.div`
  font-size: 60px;
  color: white;
  font-weight: bold;
  line-height: 1.2;
`;

const IntroSec1Paragraph = styled.div`
  font-size: 20px;
  width: 80%;
  line-height: 1.5;
  text-align: left;
  color: #bdbcb9;
  margin-top: 20px;
`;

const IntroSec1LeftBtn = styled.button`
  transition: background-color 1s ease-in-out;
  text-transform: uppercase;
  font-size: 16px;
  font-weight: bold;
  width: 50%;
  height: 48px;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  background-color: #ffcf0a;
  color: black;
  margin-top: 40px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const IntroSec1Right = styled.div`
  display: flex;
  flex-direction: column;
`;

const TradePage = styled.div`
  width: 600px;
  height: 480px;
  background-image: url(${laptopPic});
  background-size: cover;
`;

const TradeImg = styled.img`
  border-radius: 14px;
  margin: 160px 0 0 95px;
  width: 410px;
  height: 270px;
`;

const IntroSec2 = styled.div`
  width: 100%;
  // height: 100vh;
  padding: 50px 100px 0 240px;
  display: flex;
  flex-direction: column;
  margin-bottom: 150px;
  margin-top: 100px;
`;

const IntroSec2Title = styled.div`
  font-size: 50px;
  text-align: left;
  color: white;
  font-weight: bold;
  margin-bottom: 20px;
`;

const IntroSec2Paragraph = styled.div`
  font-size: 20px;
  width: 80%;
  line-height: 1.5;
  text-align: left;
  color: #bdbcb9;
  margin-bottom: 60px;
`;

const IntroSec2Pic = styled.img`
  width: 85%;
  // margin-left: 50px;
  height: 40%;
  // background-image: url(${portfolioPic});
  // background-size: cover;
`;

const IntroSec3 = styled.div`
  width: 100%;
  height: 90vh;
  padding: 50px 100px 0 240px;
  display: flex;
  flex-direction: column;
  margin-bottom: 200px;
  margin-top: 100px;
`;

const IntroSec3Title = styled.div`
  font-size: 50px;
  text-align: left;
  color: white;
  font-weight: bold;
`;

const Home = () => {
  const navigate = useNavigate();
  const { user } = React.useContext(UserContext);

  const handleGetStarted = () => {
    if (user) {
      navigate('/trade');
    } else {
      navigate('/signin');
    }
  };

  return (
    <Wrapper>
      <Intro1Background>
        <IntroSec1>
          <IntroSec1Left>
            <IntroSec1LeftTitle>Buy and Trade on NiraTrade!</IntroSec1LeftTitle>
            <IntroSec1Paragraph>
              Get started with the easiest and most secure platform to buy,
              sell, trade, and earn stocks.
            </IntroSec1Paragraph>
            <IntroSec1LeftBtn onClick={handleGetStarted}>
              <BullLogo />
              Get Started
            </IntroSec1LeftBtn>
          </IntroSec1Left>
          <IntroSec1Right>
            <TradePage>
              <TradeImg src={tradePic} alt='trade' />
            </TradePage>
          </IntroSec1Right>
        </IntroSec1>
      </Intro1Background>
      {/* <IntroSec3>
        <IntroSec3Title>Why NiraTrade?</IntroSec3Title>
      </IntroSec3> */}
      <IntroSec2>
        <IntroSec2Title>Build Your Own Portfolio</IntroSec2Title>
        <IntroSec2Paragraph>
          With NiraTrade, the stock exchange platform that empowers investors to
          take control of their financial futures, building your own portfolio
          has never been easier.
        </IntroSec2Paragraph>
        <IntroSec2Pic src={portfolioPic} alt='portfolio' />
      </IntroSec2>
    </Wrapper>
  );
};

export default Home;
