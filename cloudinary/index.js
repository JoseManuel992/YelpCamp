const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'YelpCamp/user_avatars',
    allowedFormats: ['jpeg', 'png', 'jpg'],
    format: async (req, file) => {
      const extension = file.mimetype.split('/')[1];
      return extension;
    },
    public_id: (req, file) => 'avatar_' + Date.now()

  }
});

module.exports = {
  cloudinary,
  storage
}
