const mongoose = require("mongoose");
const axios = require("axios");
const Photo = require("../models/photos.model.js");
const Album = require("../models/albums.model.js");

const getPhotos = async (req, res) => {
  const { page = 1, limit = 10, flagUseStatus = true, search = "" } = req.query;

  try {
    const query = { flagUseStatus };

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { description: regex }, { tags: regex }];
    }

    // Fetch photos with pagination (We can do cursor-based pagination for better performance in large datasets)
    const photos = await Photo.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert file buffer to base64 format for ImgBB
    const base64Image = req.file.buffer.toString("base64");

    const formData = new URLSearchParams();
    formData.append("image", base64Image);

    const imgbbResponse = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
    );

    const hostedUrl = imgbbResponse.data.data.url;

    const tags = req.body.tags
      ? req.body.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const staticUserId = "6a7ad6edd0202e50c4aa428a"; // static user
    const newDoc = await Photo.create({
      name: req.body.name || req.file.originalname || "Untitled",
      description: req.body.description || "",
      tags,
      url: hostedUrl,
      user: new mongoose.Types.ObjectId(staticUserId),
    });

    res.status(200).json({ success: true, data: newDoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const trashPhoto = async (req, res) => {
  try {
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { flagUseStatus: false },
      { new: true },
    );

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.json(photo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const restorePhoto = async (req, res) => {
  try {
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { flagUseStatus: true },
      { new: true },
    );

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.json(photo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addPhotoToAlbum = async (req, res) => {
  const { albumId } = req.body;

  try {
    const album = await Album.findById(albumId);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { album: album._id, albumName: album.name },
      { new: true },
    );

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.json(photo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPhotos,
  uploadPhoto,
  trashPhoto,
  restorePhoto,
  deletePhoto,
  addPhotoToAlbum,
};
