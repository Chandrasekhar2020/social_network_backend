const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } = require('firebase/auth');
const { db } = require('../../config/firebase');
const authService = require('../authController');


jest.mock('firebase/auth');
jest.mock('../../config/firebase');

describe('Auth Service', () => {

  const mockUser = {
    uid: 'test-uid-123',
    email: 'test@example.com',
    getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
    emailVerified: true
  };

  const mockUserData = {
    displayName: 'Test User',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    createdAt: '2024-03-20T00:00:00.000Z'
  };

 
  const mockAuth = {
    currentUser: null
  };

  beforeEach(() => {
    
    jest.clearAllMocks();
    
   
    getAuth.mockReturnValue(mockAuth);

 
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });

  
    signInWithEmailAndPassword.mockImplementation((auth, email, password) => {
      return Promise.resolve({ user: mockUser });
    });


    sendPasswordResetEmail.mockImplementation((auth, email) => {
      return Promise.resolve();
    });

  
    sendEmailVerification.mockResolvedValue();

    
    const mockSet = jest.fn().mockResolvedValue();
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: mockSet
      })
    });
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const signupData = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        phoneNumber: '+1234567890'
      };

      await authService.signup(signupData);

     
      expect(createUserWithEmailAndPassword.mock.calls[0]).toEqual(
        expect.arrayContaining([signupData.email, signupData.password])
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with verified email', async () => {
     
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => mockUserData
          })
        })
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'mock-id-token');
    });

    it('should reject login with unverified email', async () => {
      signInWithEmailAndPassword.mockResolvedValue({
        user: { ...mockUser, emailVerified: false }
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(authService.login(loginData)).rejects.toThrow('Email not verified.');
    });

    it('should reject login when user not found in database', async () => {
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

     
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: false
          })
        })
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(authService.login(loginData)).rejects.toThrow('User not found in database');
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email successfully', async () => {
      const result = await authService.forgotPassword({ email: 'test@example.com' });

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user.email', 'test@example.com');
    });

    it('should handle password reset errors', async () => {
      sendPasswordResetEmail.mockRejectedValue(new Error('Reset error'));

      await expect(
        authService.forgotPassword({ email: 'test@example.com' })
      ).rejects.toThrow('Reset error');
    });
  });
}); 
