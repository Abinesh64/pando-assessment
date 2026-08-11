import { useCallback, useEffect, useState } from "react";

import Button from "../../components/ui/Button";
import CustomModel from "../../components/CustomModel";
import PreviewImage from "../../components/PreviewImage";
import ImagesList from "../../components/ImagesList";

import {
  getAlbums,
  createAlbum,
  getAlbumPhotos,
} from "../../services/albumServices";

const PAGE_SIZE = 10;

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showPreview, setShowPreview] = useState(null);

  const loadAlbums = useCallback(async () => {
    try {
      const response = await getAlbums();
      setAlbums(response.data);
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    getAlbums()
      .then((response) => {
        if (!cancelled) {
          setAlbums(response.data);
        }
      })
      .catch((error) => console.error("Error fetching albums:", error));

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateAlbum = async (e) => {
    e.preventDefault();

    if (!newAlbumName.trim() || creating) {
      return;
    }

    setCreating(true);

    try {
      await createAlbum(newAlbumName.trim());
      setNewAlbumName("");
      await loadAlbums();
    } catch (error) {
      console.error("Error creating album:", error);
    } finally {
      setCreating(false);
    }
  };

  const fetchSelectedAlbumPhotos = useCallback(
    async (page) => {
      const response = await getAlbumPhotos(selectedAlbum._id, page);
      return response.data;
    },
    [selectedAlbum],
  );

  return (
    <div className="photos-page">
      {!selectedAlbum ? (
        <>
          <header>
            <h1>Albums</h1>

            <form onSubmit={handleCreateAlbum}>
              <input
                type="text"
                placeholder="New album name"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
              />

              <Button disabled={!newAlbumName.trim() || creating} type="submit">
                {creating ? "Creating..." : "Create album"}
              </Button>
            </form>
          </header>

          {albums.length === 0 ? (
            <p>No albums yet.</p>
          ) : (
            <div className="album-grid">
              {albums.map((album) => (
                <div
                  key={album._id}
                  className="album-folder"
                  onClick={() => setSelectedAlbum(album)}
                >
                  {album.coverUrl && (
                    <img src={album.coverUrl} alt={album.name} />
                  )}
                  <p className="album-folder-name">{album.name}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <header>
            <h1>{selectedAlbum.name}</h1>
            <Button onClick={() => setSelectedAlbum(null)}>
              Back to albums
            </Button>
          </header>

          <ImagesList
            key={selectedAlbum._id}
            fetchImages={fetchSelectedAlbumPhotos}
            pageSize={PAGE_SIZE}
            onImageClick={setShowPreview}
            sourcePage="albums"
          />
        </>
      )}

      <CustomModel show={!!showPreview} onClose={() => setShowPreview(null)}>
        {showPreview && (
          <PreviewImage photo={showPreview} sourcePage="albums" />
        )}
      </CustomModel>
    </div>
  );
};

export default Albums;
