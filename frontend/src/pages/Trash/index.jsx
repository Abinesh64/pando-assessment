import { useCallback, useState } from "react";

import CustomModel from "../../components/CustomModel";
import PreviewImage from "../../components/PreviewImage";

import { getUserPhotos } from "../../services/imageServices";
import ImagesList from "../../components/ImagesList";

const PAGE_SIZE = 10;

const Trash = () => {
  const [showPreview, setShowPreview] = useState(null);

  const fetchPhotos = useCallback(async (page) => {
    const response = await getUserPhotos(page, false);

    return response.data;
  }, []);
  return (
    <div className="photos-page">
      <header>
        <h1>Trash</h1>
      </header>

      <section>
        <h2>Deleted Photos</h2>

        <ImagesList
          fetchImages={fetchPhotos}
          pageSize={PAGE_SIZE}
          onImageClick={setShowPreview}
          sourcePage="trash"
        />
      </section>

      <CustomModel show={!!showPreview} onClose={() => setShowPreview(null)}>
        {showPreview && <PreviewImage photo={showPreview} sourcePage="trash" />}
      </CustomModel>
    </div>
  );
};

export default Trash;
