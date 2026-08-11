import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAlbums, createAlbum } from "../services/albumServices";
import { addPhotoToAlbum } from "../services/imageServices";

const PreviewImage = ({ photo, sourcePage = "photos" }) => {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [newAlbumName, setNewAlbumName] = useState("");

  useEffect(() => {
    if (sourcePage === "trash") {
      return;
    }

    getAlbums()
      .then((response) => setAlbums(response.data))
      .catch((error) => console.error("Error loading albums:", error));
  }, [sourcePage]);

  if (!photo) return null;

  const handleAddToAlbum = async () => {
    if (!selectedAlbumId) {
      return;
    }

    try {
      const album = albums.find((a) => a._id === selectedAlbumId);
      await addPhotoToAlbum(photo._id, selectedAlbumId);
      toast(`Added to ${album ? album.name : "album"}`);
    } catch (error) {
      console.error("Error adding photo to album:", error);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      return;
    }

    try {
      const response = await createAlbum(newAlbumName.trim());
      const newAlbum = response.data.data;

      await addPhotoToAlbum(photo._id, newAlbum._id);

      setAlbums((prevAlbums) => [...prevAlbums, newAlbum]);
      setNewAlbumName("");
      toast(`Album "${newAlbum.name}" created`);
    } catch (error) {
      console.error("Error creating album:", error);
    }
  };

  return (
    <div className="photo-preview">
      <img src={photo.url} alt={photo.name} />
      <h3>{photo.name}</h3>
      {photo.description && <p>{photo.description}</p>}
      <p>Uploaded on: {new Date(photo.createdAt).toLocaleDateString()}</p>

      {sourcePage !== "trash" && (
        <div className="album-picker">
          <select
            value={selectedAlbumId}
            onChange={(e) => setSelectedAlbumId(e.target.value)}
          >
            <option value="">Select an album</option>
            {albums.map((album) => (
              <option key={album._id} value={album._id}>
                {album.name}
              </option>
            ))}
          </select>
          <button onClick={handleAddToAlbum}>Add to album</button>

          <input
            type="text"
            placeholder="New album name"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
          />
          <button onClick={handleCreateAlbum}>Create album</button>
        </div>
      )}
    </div>
  );
};

export default PreviewImage;
