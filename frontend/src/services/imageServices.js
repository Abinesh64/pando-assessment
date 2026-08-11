import axios from "axios";
const uploadImage = async (formData) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/photos",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

const getUserPhotos = async (page, flagUseStatus = true, search = "") => {
  try {
    const response = await axios.get("http://localhost:8000/api/photos", {
      params: { page, flagUseStatus, search },
    });
    return response;
  } catch (error) {
    console.error("Error fetching photos:", error);
    throw error;
  }
};

const trashPhoto = async (id) => {
  try {
    const response = await axios.patch(
      `http://localhost:8000/api/photos/${id}/trash`,
    );
    return response;
  } catch (error) {
    console.error("Error trashing photo:", error);
    throw error;
  }
};

const restorePhoto = async (id) => {
  try {
    const response = await axios.patch(
      `http://localhost:8000/api/photos/${id}/restore`,
    );
    return response;
  } catch (error) {
    console.error("Error restoring photo:", error);
    throw error;
  }
};

const deletePhoto = async (id) => {
  try {
    const response = await axios.delete(
      `http://localhost:8000/api/photos/${id}`,
    );
    return response;
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw error;
  }
};

const addPhotoToAlbum = async (photoId, albumId) => {
  try {
    const response = await axios.patch(
      `http://localhost:8000/api/photos/${photoId}/album`,
      { albumId },
    );
    return response;
  } catch (error) {
    console.error("Error adding photo to album:", error);
    throw error;
  }
};

export {
  uploadImage,
  getUserPhotos,
  trashPhoto,
  restorePhoto,
  deletePhoto,
  addPhotoToAlbum,
};
