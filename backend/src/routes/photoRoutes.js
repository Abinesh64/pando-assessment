const express = require("express");
const multer = require("multer");
const photosController = require("../controllers/photos.controller.js");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", photosController.getPhotos);
router.post("/", upload.single("image"), photosController.uploadPhoto);
router.patch("/:id/trash", photosController.trashPhoto);
router.patch("/:id/restore", photosController.restorePhoto);
router.patch("/:id/album", photosController.addPhotoToAlbum);
router.delete("/:id", photosController.deletePhoto);

module.exports = router;
