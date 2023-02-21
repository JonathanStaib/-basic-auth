'use strict';

const { app } = require('../src/server');
const supertest = require('supertest');
const { sequelizeDatabase } = require('../src/server');
const request = supertest(app);

beforeAll(async () => {
  await sequelizeDatabase.sync();
});

afterAll(async () => {
  await sequelizeDatabase.drop();
});

describe('Sign-In, Sign-Up', () => {

  it('creates a new user!', async () => {
    let response = await request.post('/signup').send({
      username: 'Tester',
      password: 'pass123',
    });

    expect(response.status).toEqual(201);
    expect(response.body.username).toEqual('Tester');
    expect(response.body.password).toBeTruthy();
    expect(response.body.id).toBeTruthy();
  });

  it('find pre-existing user', async () => {
    let response = await request.post('/signin').auth(
      'Tester',
      'pass123',
    );
    console.log('response: ', response);
    expect(response.status).toEqual(200);
    expect(response.body.username).toEqual('Tester');
    expect(response.body.id).toBeTruthy();
  });

});