const express = require("express");
const albumsController = require("../controllers/albums.controller.js");
const router = express.Router();

router.get("/", albumsController.getAlbums);
router.post("/", albumsController.createAlbum);
router.get("/:id/photos", albumsController.getAlbumPhotos);

module.exports = router;
