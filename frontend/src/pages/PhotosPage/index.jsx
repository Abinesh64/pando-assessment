import { useCallback, useEffect, useState } from "react";

import Button from "../../components/ui/Button";
import CustomModel from "../../components/CustomModel";
import PreviewImage from "../../components/PreviewImage";

import { uploadImage, getUserPhotos } from "../../services/imageServices";
import ImagesList from "../../components/ImagesList";

const PAGE_SIZE = 10;

const Photos = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 600);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchPhotos = useCallback(
    async (page) => {
      const response = await getUserPhotos(page, true, search);

      return response.data;
    },
    [search],
  );

  const resetUploadForm = () => {
    setName("");
    setDescription("");
    setTags("");
    setFile(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || uploading) {
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("tags", tags);

    setUploading(true);

    try {
      await uploadImage(formData);

      resetUploadForm();
      setShowUploadModal(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photos-page">
      <header>
        <h1>Photos</h1>

        <div className="header-actions">
          <input
            type="text"
            placeholder="Search by name, tags or description"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <Button onClick={() => setShowUploadModal(true)}>Add Image</Button>
        </div>
      </header>

      <section>
        <h2>Uploaded Photos</h2>

        <ImagesList
          key={`${search}-${refreshKey}`}
          fetchImages={fetchPhotos}
          pageSize={PAGE_SIZE}
          onImageClick={setShowPreview}
          sourcePage="photos"
        />
      </section>

      <CustomModel
        show={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          resetUploadForm();
        }}
      >
        <form className="upload-form" onSubmit={handleUpload}>
          <h2>Add Image</h2>

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button disabled={!file || uploading} type="submit">
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </CustomModel>

      <CustomModel show={!!showPreview} onClose={() => setShowPreview(null)}>
        {showPreview && (
          <PreviewImage photo={showPreview} sourcePage="photos" />
        )}
      </CustomModel>
    </div>
  );
};

export default Photos;
