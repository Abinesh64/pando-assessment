import axios from "axios";

const getAlbums = async () => {
  try {
    const response = await axios.get("http://localhost:8000/api/albums");
    return response;
  } catch (error) {
    console.error("Error fetching albums:", error);
    throw error;
  }
};

const createAlbum = async (name) => {
  try {
    const response = await axios.post("http://localhost:8000/api/albums", {
      name,
    });
    return response;
  } catch (error) {
    console.error("Error creating album:", error);
    throw error;
  }
};

const getAlbumPhotos = async (albumId, page) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/albums/${albumId}/photos`,
      { params: { page } },
    );
    return response;
  } catch (error) {
    console.error("Error fetching album photos:", error);
    throw error;
  }
};

export { getAlbums, createAlbum, getAlbumPhotos };
