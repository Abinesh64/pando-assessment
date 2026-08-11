import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import TrashIcon from "../assets/icons/TrashIcon";
import RestoreIcon from "../assets/icons/RestoreIcon";
import DownloadIcon from "../assets/icons/DownloadIcon";
import CustomModel from "./CustomModel";
import {
  trashPhoto,
  restorePhoto,
  deletePhoto,
} from "../services/imageServices";

const DEFAULT_PAGE_SIZE = 10;

const ImagesList = ({
  fetchImages,
  pageSize = DEFAULT_PAGE_SIZE,
  onImageClick,
  sourcePage = "photos",
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [deleteImage, setDeleteImage] = useState(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const observerRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await fetchImages(pageRef.current);

      const newImages = Array.isArray(data) ? data : [];

      setImages((prevImages) => [...prevImages, ...newImages]);
      if (newImages.length < pageSize) {
        hasMoreRef.current = false;
        setHasMore(false);
      } else {
        pageRef.current += 1;
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [fetchImages, pageSize]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const lastElementRef = useCallback(
    (node) => {
      // Remove previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) {
        return;
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return;
          }

          loadMore();
        },
        {
          threshold: 0.1,
        },
      );

      observerRef.current.observe(node);
    },
    [loadMore],
  );

  // Cleanup observer
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const removeImage = (id) => {
    setImages((prevImages) => prevImages.filter((image) => image._id !== id));
  };

  const handleConfirmDelete = async () => {
    if (!deleteImage) {
      return;
    }

    try {
      if (sourcePage === "trash") {
        await deletePhoto(deleteImage._id);
        toast("Photo deleted permanently");
      } else {
        await trashPhoto(deleteImage._id);
        toast("Photo moved to trash");
      }
      removeImage(deleteImage._id);
    } catch (error) {
      console.error("Error deleting image:", error);
    } finally {
      setDeleteImage(null);
    }
  };

  const handleRestore = async (image) => {
    try {
      await restorePhoto(image._id);
      removeImage(image._id);
    } catch (error) {
      console.error("Error restoring image:", error);
    }
  };

  const handleDownload = async (image) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = image.name || "photo";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      window.open(image.url, "_blank");
    }
  };

  const renderIcons = (image) => {
    return (
      <>
        {sourcePage === "trash" && (
          <RestoreIcon
            width={20}
            height={20}
            onClick={() => handleRestore(image)}
          />
        )}
        <DownloadIcon
          width={20}
          height={20}
          onClick={() => handleDownload(image)}
        />
        <TrashIcon
          width={20}
          height={20}
          onClick={() => setDeleteImage(image)}
        />
      </>
    );
  };

  return (
    <>
      {images.length === 0 && !loading ? (
        <p>No photos yet.</p>
      ) : (
        <div className="photo-grid">
          {images.map((image) => (
            <div key={image._id} className="photo-item">
              <div className="photo-item-image">
                <img
                  src={image.url}
                  alt={image.name || "Uploaded photo"}
                  onClick={() => onImageClick?.(image)}
                />
                <div className="photo-item-actions">{renderIcons(image)}</div>
              </div>

              <div className="photo-item-info">
                <p className="photo-item-name">{image.name}</p>
                {image.description && (
                  <p className="photo-item-description">
                    {image.description}
                  </p>
                )}
                {image.tags?.length > 0 && (
                  <div className="photo-item-tags">
                    {image.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Infinite scroll sentinel */}
      <div
        ref={lastElementRef}
        style={{
          textAlign: "center",
          padding: "20px",
        }}
      >
        {loading && <p>Loading more items...</p>}

        {!loading && !hasMore && images.length > 0 && (
          <p>No more items to display.</p>
        )}
      </div>
      <CustomModel show={!!deleteImage} onClose={() => setDeleteImage(null)}>
        {deleteImage && (
          <div>
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this image?</p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setDeleteImage(null)}>Cancel</button>
              <button onClick={handleConfirmDelete}>Confirm</button>
            </div>
          </div>
        )}
      </CustomModel>
    </>
  );
};

export default ImagesList;
