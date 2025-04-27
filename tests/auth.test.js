const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');


const testUser = {
  username: 'tester',
  email: 'tksdk',
  password: 'Tes234'
};

let token;

beforeAll(async () => {
  const testDbUri = process.env.MONGODB_URI ;
  await mongoose.connect(testDbUri);
});

// Clean up after tests
afterAll(async () => {
  await User.deleteMany({});
  await LoginLog.deleteMany({});
  await mongoose.connection.close();
});

describe('Authentication System', () => {
  // Register user tests
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
    });
    
    it('should not register user with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
    
    it('should validate password requirements', async () => {
      const weakPasswordUser = {
        username: 'weakuser',
        email: 'weak@example.com',
        password: 'weak'
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser);
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Password must');
    });
  });
  
  // Login tests
  describe('POST /api/auth/login', () => {
    it('should login user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      
      // Save token for protected route tests
      token = res.body.token;
    });
    
    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
  
  // Protected routes tests
  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
    });
    
    it('should not access protected route without token', async () => {
      const res = await request(app)
        .get('/api/users/profile');
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
  
  // Logout test
  describe('POST /api/auth/logout', () => {
    it('should logout user', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });
});