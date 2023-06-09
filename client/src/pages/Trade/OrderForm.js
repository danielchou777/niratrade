import React, { useState } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import { UserContext } from '../../store/UserContext';

const FormGroup = styled.div`
  width: 100%;
  display: flex;
  padding: 1rem;
  flex-direction: column;
  background-color: #131010;
  padding: 2rem 2rem 2rem 2rem;
`;

const Limit = styled.h2`
  color: #fbc200;
  font-size: 0.8rem;
  text-align: left;
  text-transform: uppercase;
  margin-bottom: 1rem;
`;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-radius: 4px;
  width: 50%;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 2px solid #222;
  border-radius: 4px;

  &:focus-within {
    border: 2px solid #fbc200;
    // border-radius: 4px;
  }
`;

const Label = styled.label`
  color: #908e88;
  height: 2.5rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  text-align: center;
  background-color: #222;
`;

const Input = styled.input`
  width: 100%;
  height: 2.5rem;
  padding: 0.5rem;
  border-radius: 4px 0 0 4px;
  border: 1px solid #222;
  border-right: none;
  border-left: none;
  background-color: #222;
  color: #fff;
  font-size: 1rem;
  text-align: right;
  -webkit-appearance: none;

  &:focus {
    outline: none;
  }

  &::placeholder {
    text-align: left;
    opacity: 1;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const Unit = styled.div`
  width: 50px;
  color: #908e88;
  height: 2.5rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  text-align: center;
  background-color: #222;
`;

const BuyButton = styled.button`
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: #55e3b3;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
  font-size: 1rem;

  &:hover {
    background-color: #4dc4a4;
  }
`;

const SellButton = styled.button`
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: #fa6767;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
  font-size: 1rem;

  &:hover {
    background-color: #e85151;
  }
`;

function OrderForm({ onSubmit, socket, refresh, setRefresh, stock }) {
  const [buyQuantity, setBuyQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellQuantity, setSellQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [type, setType] = useState('');
  const { user } = React.useContext(UserContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let order;

    if (!user) {
      Swal.fire('Please login first');
      return;
    }

    if (type === 'buy' && buyQuantity && buyPrice) {
      order = {
        symbol: `${stock}`,
        userId: user.userId,
        price: buyPrice,
        quantity: buyQuantity,
        type: '2',
        side: 'b',
        status: '0',
      };
    }

    if (type === 'sell' && sellQuantity && sellPrice) {
      order = {
        symbol: `${stock}`,
        userId: user.userId,
        price: sellPrice,
        quantity: sellQuantity,
        type: '2',
        side: 's',
        status: '0',
      };
    }

    if (order) {
      const jwtToken = window.localStorage.getItem('jwtToken');
      const response = await onSubmit(order, jwtToken);

      if (response.msg !== 'order received') {
        Swal.fire('Invalid order', response.msg, 'error');
        return;
      }

      setBuyPrice('');
      setBuyQuantity('');
      setSellPrice('');
      setSellQuantity('');

      Swal.fire(
        'Order submitted',
        'Your order has been submitted successfully',
        'success'
      );
    }

    if (!order) {
      Swal.fire('Invalid order', 'Please enter a valid order', 'error');
    }
  };

  return (
    <FormGroup>
      <Limit>Limit</Limit>
      <FormWrapper>
        <Form onSubmit={handleSubmit}>
          <InputWrapper>
            <Label>Price</Label>
            <Input
              type='number'
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
            />
            <Unit>NTD</Unit>
          </InputWrapper>
          <br />
          <InputWrapper>
            <Label>Amount</Label>
            <Input
              type='number'
              value={buyQuantity}
              onChange={(e) => setBuyQuantity(e.target.value)}
            />
            <Unit>Unit</Unit>
          </InputWrapper>
          <br />
          <BuyButton
            type='submit'
            onClick={(e) => {
              setType('buy');
            }}
          >
            Buy
          </BuyButton>
        </Form>
        <Form onSubmit={handleSubmit}>
          <InputWrapper>
            <Label>Price</Label>
            <Input
              type='number'
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
            />
            <Unit>NTD</Unit>
          </InputWrapper>
          <br />
          <InputWrapper>
            <Label>Amount</Label>
            <Input
              type='number'
              value={sellQuantity}
              onChange={(e) => setSellQuantity(e.target.value)}
            />
            <Unit>Unit</Unit>
          </InputWrapper>
          <br />
          <SellButton type='submit' onClick={(e) => setType('sell')}>
            Sell
          </SellButton>
        </Form>
      </FormWrapper>
    </FormGroup>
  );
}

export default OrderForm;
