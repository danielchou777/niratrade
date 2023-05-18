import request from 'supertest';
import app from '../app.js';

const requester = request(app);
const expectedExpireTime = +process.env.JWT_LIFETIME;

describe('user', () => {
  test('native sign in with correct password', async () => {
    const user = {
      name: 'test123',
      email: 'test123@gmail.com',
      password: '12345678',
    };

    const res = await requester.post('/api/1.0/user/signin').send(user);

    const data = res.body.data;
    const userExpect = {
      name: user.name,
      email: user.email,
    };

    expect(data.name).toStrictEqual(userExpect.name);
    expect(data.email).toStrictEqual(userExpect.email);
    expect(typeof data.access_token).toStrictEqual('string');
    expect(typeof data.userId).toStrictEqual('string');
    expect(data.access_expired).toStrictEqual(expectedExpireTime);
  });
});
