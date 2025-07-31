import express from 'express';
import {
  createPost,
  getPosts,
  likePost,
  getAllPostsAdmin,
  toggleHidePost,
  deletePost,
} from '../../controllers/postController.js';
import upload from '../../middleware/uploadMiddleware.js';
import { protect, isSuperAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// --- Public Routes ---
router.get('/', getPosts);
router.post('/', upload.single('image'), createPost);
router.post('/:id/like', likePost);

// --- Admin Routes ---
// GET all posts (including hidden ones) for the admin panel
router.get('/all', protect, getAllPostsAdmin);

// PATCH to hide/unhide a post (accessible by both Moderator and Super Admin)
router.patch('/:id/hide', protect, toggleHidePost);

// DELETE a post (accessible ONLY by Super Admin)
router.delete('/:id', protect, isSuperAdmin, deletePost);

export default router;
