    // Start Generation Here
const { db } = require('../../config/firebase');
const userController = require('../userController');

// Mock Firebase modules
jest.mock('../../config/firebase');

describe('User Controller', () => {
  // Setup common test data
  const mockContext = {
    user: {
      uid: 'test-user-123',
    },
  };

  describe('followUser', () => {
    it('should successfully follow a user', async () => {
      const followingId = 'followed-user-456';

      // Mock Firestore queries
      const mockFollowQuery = {
        empty: true,
      };
      db.collection.mockReturnValue({
        where: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockFollowQuery),
          }),
        }),
        add: jest.fn().mockResolvedValue({ id: 'follow-relation-789' }),
      });

      const result = await userController.followUser(null, { followingId }, mockContext);

      expect(db.collection).toHaveBeenCalledWith('user_follows');
      expect(result).toHaveProperty('uid', 'follow-relation-789');
      expect(result).toHaveProperty('user_id', mockContext.user.uid);
      expect(result).toHaveProperty('following_id', followingId);
      expect(result).toHaveProperty('message', 'Successfully followed user');
    });

    it('should throw error when trying to follow oneself', async () => {
      const followingId = 'test-user-123'; // same as user uid

      await expect(userController.followUser(null, { followingId }, mockContext))
        .rejects
        .toThrow('Users cannot follow themselves');
    });

    it('should throw error when already following the user', async () => {
      const followingId = 'followed-user-456';

      // Mock Firestore query with existing follow
      const mockFollowQuery = {
        empty: false,
      };
      db.collection.mockReturnValue({
        where: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockFollowQuery),
          }),
        }),
      });

      await expect(userController.followUser(null, { followingId }, mockContext))
        .rejects
        .toThrow('Already following this user');
    });

    it('should throw error when authentication is missing', async () => {
      const followingId = 'followed-user-456';
      const unauthenticatedContext = { user: null };

      await expect(userController.followUser(null, { followingId }, unauthenticatedContext))
        .rejects
        .toThrow('Authentication required.');
    });

    it('should handle database errors', async () => {
      const followingId = 'followed-user-456';

      // Mock Firestore to throw an error
      db.collection.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(userController.followUser(null, { followingId }, mockContext))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('unfollowUser', () => {
    it('should successfully unfollow a user', async () => {
      const followingId = 'followed-user-456';

      // Mock Firestore query to find the follow relation
      const mockFollowQuery = {
        empty: false,
        docs: [{
          ref: {
            delete: jest.fn().mockResolvedValue(),
          },
        }],
      };
      db.collection.mockReturnValue({
        where: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockFollowQuery),
          }),
        }),
      });

      const result = await userController.unfollowUser(null, { followingId }, mockContext);

      expect(db.collection).toHaveBeenCalledWith('user_follows');
      expect(mockFollowQuery.docs[0].ref.delete).toHaveBeenCalled();
      expect(result).toHaveProperty('message', 'Successfully unfollowed user');
    });

    it('should throw error when follow relationship not found', async () => {
      const followingId = 'followed-user-456';

      // Mock Firestore query with no existing follow
      const mockFollowQuery = {
        empty: true,
      };
      db.collection.mockReturnValue({
        where: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockFollowQuery),
          }),
        }),
      });

      await expect(userController.unfollowUser(null, { followingId }, mockContext))
        .rejects
        .toThrow('Follow relationship not found');
    });

    it('should throw error when authentication is missing', async () => {
      const followingId = 'followed-user-456';
      const unauthenticatedContext = { user: null };

      await expect(userController.unfollowUser(null, { followingId }, unauthenticatedContext))
        .rejects
        .toThrow('Authentication required.');
    });

    it('should handle database errors', async () => {
      const followingId = 'followed-user-456';

      // Mock Firestore to throw an error
      db.collection.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(userController.unfollowUser(null, { followingId }, mockContext))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getFollowers', () => {
    it('should successfully retrieve followers of a user', async () => {
      const userId = 'test-user-123';
      const mockFollowers = [
        { 
          id: 'follow-1',
          data: () => ({ 
            user_id: 'follower-1',
            following_id: userId 
          })
        },
        { 
          id: 'follow-2',
          data: () => ({ 
            user_id: 'follower-2',
            following_id: userId 
          })
        }
      ];

      // Mock the followers query
      const mockFollowersQuery = {
        docs: mockFollowers,
        forEach: (callback) => mockFollowers.forEach(callback)
      };

      // Setup the mock chain
      db.collection.mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockFollowersQuery)
        })
      });

      const result = await userController.getFollowers(null, { userId }, mockContext);

      expect(db.collection).toHaveBeenCalledWith('user_follows');
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        {
          uid: 'follow-1',
          user_id: 'follower-1',
          following_id: userId
        },
        {
          uid: 'follow-2',
          user_id: 'follower-2',
          following_id: userId
        }
      ]);
    });

    it('should return empty array when user has no followers', async () => {
      const userId = 'test-user-123';
      
      // Mock empty followers query
      const mockEmptyQuery = {
        docs: [],
        empty: true,
        forEach: (callback) => {} // Empty forEach implementation
      };

      db.collection.mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockEmptyQuery)
        })
      });

      const result = await userController.getFollowers(null, { userId }, mockContext);
      expect(result).toEqual([]);
    });

    it('should throw error when not authenticated', async () => {
      const userId = 'test-user-123';
      const unauthenticatedContext = { user: null };

      await expect(
        userController.getFollowers(null, { userId }, unauthenticatedContext)
      ).rejects.toThrow('Authentication required.');
    });

    it('should handle database errors', async () => {
      const userId = 'test-user-123';

      // Mock database error
      db.collection.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(
        userController.getFollowers(null, { userId }, mockContext)
      ).rejects.toThrow('Database error');
    });
  });

  // Additional test cases for other userController functions can be added here
});
