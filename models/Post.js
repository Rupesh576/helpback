import mongoose from 'mongoose';

// This schema is the blueprint for all our posts in the database.
// It's designed to handle both text-only posts and image posts with captions.
const postSchema = new mongoose.Schema(
  {
    // 'type' determines if the post is text or an image.
    // It's required and must be one of the two values.
    type: {
      type: String,
      enum: ['text', 'image'],
      required: true,
    },

    // 'content' is for the body of a text-only post.
    // It's only required if the post 'type' is 'text'.
    content: {
      type: String,
      required: function () {
        return this.type === 'text';
      },
      trim: true,
    },

    // 'imageUrl' stores the URL of the uploaded image from Cloudinary.
    // It's only required if the post 'type' is 'image'.
    imageUrl: {
      type: String,
      required: function () {
        return this.type === 'image';
      },
    },
    
    // 'public_id' is the unique ID for the image on Cloudinary.
    // We need this to be able to delete the image from Cloudinary later.
    cloudinaryPublicId: {
      type: String,
      required: function () {
          return this.type === 'image';
      }
    },

    // 'caption' is the text that accompanies an image.
    // It's optional.
    caption: {
      type: String,
      trim: true,
    },

    // 'likes' stores the number of hearts/likes a post has received.
    likes: {
      type: Number,
      default: 0,
    },

    // 'isHidden' is our flag for moderation.
    // Admins can toggle this to show/hide a post from public view.
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    // 'timestamps: true' automatically adds 'createdAt' and 'updatedAt' fields.
    // We will use 'createdAt' for sorting and filtering posts by date.
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

export default Post;