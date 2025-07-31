import Post from '../models/Post.js';
import { io } from '../server.js';
import cloudinary from '../config/cloudinary.js';

// --- Existing Public Functions (createPost, getPosts, likePost) ---
// (These functions from the previous step remain unchanged)
const createPost = async (req, res) => {
  try {
    const { type, content, caption } = req.body;
    let newPost;

    if (type === 'text') {
      if (!content) return res.status(400).json({ message: 'Text content is required.' });
      newPost = new Post({ type, content });
    } else if (type === 'image') {
      if (!req.file) return res.status(400).json({ message: 'Image file is required.' });
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: 'image-gallery-app' }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        uploadStream.end(req.file.buffer);
      });
      newPost = new Post({ type: 'image', imageUrl: uploadResult.secure_url, cloudinaryPublicId: uploadResult.public_id, caption: caption || '' });
    } else {
      return res.status(400).json({ message: 'Invalid post type.' });
    }
    const savedPost = await newPost.save();
    io.emit('newPost', savedPost);
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error while creating post.' });
  }
};

const getPosts = async (req, res) => {
  try {
    const { date } = req.query;
    let query = { isHidden: false };
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.createdAt = { $gte: today, $lt: tomorrow };
    }
    const posts = await Post.find(query).sort({ createdAt: 'desc' });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error while fetching posts.' });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    post.likes += 1;
    const updatedPost = await post.save();
    io.emit('postLiked', { _id: updatedPost._id, likes: updatedPost.likes });
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error while liking post.' });
  }
};


// --- NEW Admin-Only Functions ---

/**
 * @desc    Get all posts including hidden ones for the admin panel
 * @route   GET /api/posts/all
 * @access  Private (Admin)
 */
const getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: 'desc' });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching all posts for admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Toggle the hidden status of a post
 * @route   PATCH /api/posts/:id/hide
 * @access  Private (Admin)
 */
const toggleHidePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    post.isHidden = !post.isHidden;
    const updatedPost = await post.save(); // Use the updated document

    // --- FIX ---
    // Emit an event with the full post data. The frontend can now decide
    // whether to add or remove it based on the `isHidden` property.
    io.emit('postVisibilityChanged', { post: updatedPost });
    // --- END FIX ---

    res.status(200).json({ message: `Post has been ${updatedPost.isHidden ? 'hidden' : 'made visible'}.` });
  } catch (error) {
    console.error('Error toggling post visibility:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private (Super Admin only)
 */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // If the post is an image, delete it from Cloudinary first
    if (post.type === 'image' && post.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(post.cloudinaryPublicId);
    }

    // Delete the post from the database
    await Post.deleteOne({ _id: req.params.id });

    // Emit an event to tell clients to remove this post from their state
    io.emit('postDeleted', { postId: post._id });

    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { createPost, getPosts, likePost, getAllPostsAdmin, toggleHidePost, deletePost };

