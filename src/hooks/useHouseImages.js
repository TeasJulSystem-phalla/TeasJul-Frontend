import { useState, useCallback, useEffect } from "react";
import { houseApi } from "../api/house.api";

export function useHouseImages(houseId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fetchImages = useCallback(async () => {
    if (!houseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await houseApi.getHouseImages(houseId);
      setImages(data || []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load images. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [houseId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const upload = useCallback(
    async (files) => {
      const fileList = Array.isArray(files) ? files : Array.from(files || []);
      if (fileList.length === 0) return;
      setUploading(true);
      setUploadError(null);
      try {
        const data = await houseApi.uploadHouseImages(houseId, fileList);
        setImages(data || []);
        return data;
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to upload images. Please try again.";
        setUploadError(message);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [houseId]
  );

  const removeImage = useCallback(
    async (imageId) => {
      try {
        await houseApi.deleteHouseImage(houseId, imageId);
        await fetchImages();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to delete the image. Please try again."
        );
        throw err;
      }
    },
    [houseId, fetchImages]
  );

  const setAsPrimary = useCallback(
    async (imageId) => {
      const data = await houseApi.setHouseImagePrimary(houseId, imageId);
      setImages(data || []);
      return data;
    },
    [houseId]
  );

  const moveImage = useCallback(
    async (imageId, direction) => {
      const index = images.findIndex((img) => img.id === imageId);
      if (index === -1) return;
      const target = images[index + direction];
      if (!target) return;
      const data = await houseApi.updateHouseImageOrder(houseId, imageId, target.sortOrder);
      setImages(data || []);
      return data;
    },
    [houseId, images]
  );

  return {
    images,
    loading,
    error,
    uploading,
    uploadError,
    fetchImages,
    upload,
    removeImage,
    setAsPrimary,
    moveImage,
  };
}