const mongoose = require("mongoose");
const Album = require("../models/albums.model.js");
const Photo = require("../models/photos.model.js");

const staticUserId = "6a7ad6edd0202e50c4aa428a";

const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ user: staticUserId }).sort({
      createdAt: -1,
    });

    const albumsWithCover = await Promise.all(
      albums.map(async (album) => {
        const cover = await Photo.findOne({
          album: album._id,
          flagUseStatus: true,
        });

        return {
          ...album.toObject(),
          coverUrl: cover ? cover.url : null,
        };
      }),
    );

    res.json(albumsWithCover);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAlbum = async (req, res) => {
  try {
    const newAlbum = await Album.create({
      name: req.body.name,
      user: new mongoose.Types.ObjectId(staticUserId),
    });

    res.status(200).json({ success: true, data: newAlbum });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAlbumPhotos = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const photos = await Photo.find({
      album: req.params.id,
      flagUseStatus: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAlbums,
  createAlbum,
  getAlbumPhotos,
};
