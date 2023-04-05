import styled from 'styled-components';
import api from '../../utils/api';
import OrderForm from './OrderForm';
import OrderBooks from './OrderBook';

import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:3000';

const Wrapper = styled.div`
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

function Trade() {
  const socket = socketIOClient(ENDPOINT);
  return (
    <Wrapper>
      <OrderForm onSubmit={api.sendOrder} socket={socket} />
      <OrderBooks socket={socket} />
    </Wrapper>
  );
}

export default Trade;
