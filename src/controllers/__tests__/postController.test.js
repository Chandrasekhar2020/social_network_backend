const { db } = require('../../config/firebase');
const postService = require('../postController');


jest.mock('../../config/firebase');

describe('Post Service', () => {
 
  const mockContext = {
    user: {
      uid: 'test-user-123',
      user_id: 'test-user-123'
    }
  };

  const mockPost = {
    id: 'test-post-123',
    user_id: 'test-user-123',
    content: {
      heading: 'Test Heading',
      description: 'Test Description',
      likes: 0,
      comments: 0,
      shares: 0
    },
    createdAt: '2024-03-20T00:00:00.000Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('should fetch all posts successfully', async () => {
      
      const mockSnapshot = {
        forEach: (callback) => {
          callback({
            id: mockPost.id,
            data: () => mockPost
          });
        }
      };

      const mockOrderBy = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockSnapshot)
      });

      db.collection.mockReturnValue({
        orderBy: mockOrderBy
      });

      const result = await postService.getAllPosts(null, null, mockContext);

      expect(db.collection).toHaveBeenCalledWith('posts');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockPost,
        id: mockPost.id,
        isOwner: true
      });
    });

    it('should handle errors when fetching posts', async () => {
      db.collection.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(postService.getAllPosts(null, null, mockContext))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getPostById', () => {
    it('should fetch a single post successfully', async () => {
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: mockPost.id,
        data: () => mockPost
      });

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet
        })
      });

      const result = await postService.getPostById(null, { postId: mockPost.id }, mockContext);

      expect(db.collection).toHaveBeenCalledWith('posts');
      expect(result).toEqual({
        ...mockPost,
        id: mockPost.id,
        isOwner: true
      });
    });

    it('should throw error when post not found', async () => {
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: false
          })
        })
      });

      await expect(postService.getPostById(null, { postId: 'non-existent' }, mockContext))
        .rejects
        .toThrow('Post not found.');
    });

    it('should throw error when user not authenticated', async () => {
      await expect(postService.getPostById(null, { postId: mockPost.id }, { user: null }))
        .rejects
        .toThrow('Authentication required.');
    });
  });

  describe('createPost', () => {
    const newPostData = {
      heading: 'New Post',
      description: 'New Description'
    };

    it('should create a post successfully', async () => {
      const mockAdd = jest.fn().mockResolvedValue({ id: 'new-post-123' });
      db.collection.mockReturnValue({
        add: mockAdd
      });

      const result = await postService.createPost(null, newPostData, mockContext);

      expect(db.collection).toHaveBeenCalledWith('posts');
      expect(mockAdd).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'new-post-123');
      expect(result).toHaveProperty('message', 'Post created successfully');
    });

    it('should throw error when required fields are missing', async () => {
      await expect(postService.createPost(null, { heading: 'Only Heading' }, mockContext))
        .rejects
        .toThrow('Missing heading or description.');
    });

    it('should throw error when user not authenticated', async () => {
      await expect(postService.createPost(null, newPostData, { user: null }))
        .rejects
        .toThrow('Authentication required.');
    });
  });

  describe('updatePost', () => {
    const updateData = {
      postId: 'test-post-123',
      heading: 'Updated Heading',
      description: 'Updated Description'
    };

    it('should update a post successfully', async () => {
      const mockUpdate = jest.fn().mockResolvedValue();
      const mockGet = jest.fn()
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ user_id: mockContext.user.uid })
        })
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ ...mockPost, ...updateData })
        });

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
          update: mockUpdate
        })
      });

      const result = await postService.updatePost(null, updateData, mockContext);

      expect(mockUpdate).toHaveBeenCalled();
      expect(result).toHaveProperty('message', 'Post updated successfully');
    });

    it('should throw error when post not found', async () => {
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: false
          })
        })
      });

      await expect(postService.updatePost(null, updateData, mockContext))
        .rejects
        .toThrow('Post not found.');
    });

    it('should throw error when user not authorized', async () => {
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ user_id: 'different-user' })
          })
        })
      });

      await expect(postService.updatePost(null, updateData, mockContext))
        .rejects
        .toThrow('Not authorized to update this post.');
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      const mockDelete = jest.fn().mockResolvedValue();
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ user_id: mockContext.user.uid })
      });

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
          delete: mockDelete
        })
      });

      const result = await postService.deletePost(null, { postId: 'test-post-123' }, mockContext);

      expect(mockDelete).toHaveBeenCalled();
      expect(result).toBe('Post deleted successfully');
    });

    it('should throw error when post not found', async () => {
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: false
          })
        })
      });

      await expect(postService.deletePost(null, { postId: 'non-existent' }, mockContext))
        .rejects
        .toThrow('Post not found.');
    });

    it('should throw error when user not authorized', async () => {
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ user_id: 'different-user' })
          })
        })
      });

      await expect(postService.deletePost(null, { postId: 'test-post-123' }, mockContext))
        .rejects
        .toThrow('Not authorized to delete this post.');
    });
  });
}); 
