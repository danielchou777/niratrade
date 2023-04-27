import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import { UserContext } from '../../store/UserContext';
import { toFormatedTime } from '../../utils/util';
import Swal from 'sweetalert2';

const Wrapper = styled.div`
  width: 100%;
  color: white;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  background-color: #131010;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const PositionTitle = styled.div`
  color: #fbc200;
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: 1rem;
  margin-right: 1rem;
`;

const PositionHeaders = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
`;

const HeaderDate = styled.div`
  width: 18%;
  color: #bdbcb9;
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const Header = styled.div`
  width: 12%;
  color: #bdbcb9;
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const OpenOrderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  margin-bottom: 1.5rem;
`;

const OpenOrderDate = styled.div`
  font-size: 0.9rem;
  width: 18%;
  text-align: left;
  color: #bdbcb9;
`;

const OpenOrder = styled.div`
  font-size: 0.9rem;
  width: 12%;
  text-align: left;
  color: #bdbcb9;
  text-transform: capitalize;
`;

const OpenOrderSide = styled.div`
  font-size: 0.9rem;
  width: 12%;
  text-align: left;
  text-transform: capitalize;
  color: ${({ side }) => (side === 'b' ? '#55e3b3' : '#fa6767')};
`;

const SelectorBarContainer = styled.div`
  // width: 100%;
  margin-right: auto;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9rem;
  height: 50px;
  background-color: #131010;
  // border-bottom: 1px solid #313131;
`;

const Borderline = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #313131;
`;

const SelectorItem = styled.div`
  cursor: pointer;
  color: #bdbcb9;
  font-weight: bold;
`;

const Dropdown = styled.select`
  margin-left: 16px;
  margin-right: 16px;
  padding: 8px;
  align-items: center;
  border: 2px solid #313131;
  border-radius: 4px;
  color: #bdbcb9;
  background-color: #313131;

  &:focus-within {
    border: 2px solid #fbc200;
  }
  &:focus {
    outline: none;
  }
`;

const SearchBtn = styled.div`
  background-color: #ffcf0a;
  width: 80px;
  height: 36px;
  cursor: pointer;
  color: black;
  font-weight: bold;
  margin-left: 40px;
  margin-right: 16px;
  display: flex;
  border-radius: 4px;
  justify-content: center;
  text-align: center;
  align-items: center;

  &:hover {
    background-color: #ffcf0a;
    opacity: 0.9;
    cursor: pointer;
  }
`;

const ResetBtn = styled.div`
  background-color: #666;
  color: #fff;
  cursor: pointer;
  width: 80px;
  height: 36px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    opacity: 0.9;
    cursor: pointer;
  }
`;

function UserPosition(props) {
  const [openOrders, setOpenOrders] = React.useState(null);
  const { user } = React.useContext(UserContext);

  const thousandSeparator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const [selectedSymbol, setSelectedSymbol] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSide, setSelectedSide] = useState('All');

  const handleSymbolChange = (symbol) => {
    setSelectedSymbol(symbol);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handleSideChange = (side) => {
    setSelectedSide(side);
  };

  const handleReset = () => {
    setSelectedSymbol('All');
    setSelectedStatus('All');
    setSelectedSide('All');

    setOpenOrders(null);
  };

  const handleSearch = async () => {
    if (!user) return;
    const { result } = await api.getAllPositions(
      selectedSymbol,
      selectedStatus,
      selectedSide
    );

    if (result.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Oops...',
        text: 'No result found',
      });
    }

    setOpenOrders(result);
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <PositionTitle>Orders</PositionTitle>
      </TitleWrapper>
      <SelectorBarContainer>
        <SelectorItem
          className={selectedSymbol ? 'active' : ''}
          // onClick={() => handleSymbolChange(selectedSymbol ? '' : 'Symbol')}
        >
          Symbol
        </SelectorItem>
        {selectedSymbol && (
          <Dropdown
            value={selectedSymbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
          >
            <option value='All'>All</option>
            <option value='DAN'>DAN</option>
            <option value='APPL'>APPL</option>
          </Dropdown>
        )}
        <SelectorItem
          className={'active'}
          // onClick={() => handleStatusChange(selectedStatus ? '' : 'Status')}
        >
          Status
        </SelectorItem>
        {selectedStatus && (
          <Dropdown
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value='All'>All</option>
            <option value='Open'>Open</option>
            <option value='Closed'>Closed</option>
          </Dropdown>
        )}
        <SelectorItem
          className={selectedSide ? 'active' : ''}
          // onClick={() => handleSideChange(selectedSide ? '' : 'Side')}
        >
          Side
        </SelectorItem>
        {selectedSide && (
          <Dropdown
            value={selectedSide}
            onChange={(e) => handleSideChange(e.target.value)}
          >
            <option value='All'>All</option>
            <option value='Buy'>Buy</option>
            <option value='Sell'>Sell</option>
          </Dropdown>
        )}
        <SearchBtn onClick={handleSearch}>Search</SearchBtn>
        <ResetBtn onClick={handleReset}>Reset</ResetBtn>
      </SelectorBarContainer>
      <Borderline />
      <PositionHeaders>
        <HeaderDate>Date</HeaderDate>
        <Header>Pair</Header>
        <Header>Status</Header>
        <Header>Type</Header>
        <Header>Side</Header>
        <Header>Price(NTD)</Header>
        <Header>Amount</Header>
        <Header>Filled</Header>
        <Header>Total(NTD)</Header>
      </PositionHeaders>
      {openOrders &&
        openOrders.map((order) => {
          const {
            symbol,
            side,
            type,
            price,
            status,
            unfilled_quantity,
            created_at,
            quantity,
          } = order;

          const time = toFormatedTime(created_at);

          return (
            <OpenOrderWrapper key={order.id}>
              <OpenOrderDate>{time}</OpenOrderDate>
              <OpenOrder>{symbol}/NTD</OpenOrder>
              <OpenOrder>{status === '2' ? 'Closed' : 'Open'}</OpenOrder>
              <OpenOrder>{type === '2' ? 'limit' : 'NULL'}</OpenOrder>
              <OpenOrderSide side={side}>
                {side === 'b' ? 'buy' : 'sell'}
              </OpenOrderSide>
              <OpenOrder>{price}</OpenOrder>
              <OpenOrder>{`${
                quantity - unfilled_quantity
              }/${quantity}`}</OpenOrder>
              <OpenOrder>
                {Math.floor(((quantity - unfilled_quantity) * 100) / quantity)}%
              </OpenOrder>
              <OpenOrder>{thousandSeparator(price * quantity)}</OpenOrder>
            </OpenOrderWrapper>
          );
        })}
    </Wrapper>
  );
}

export default UserPosition;
