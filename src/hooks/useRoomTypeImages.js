import { useState, useCallback, useEffect } from "react";
import { roomTypeApi } from "../api/roomType.api";

export function useRoomTypeImages(roomTypeId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fetchImages = useCallback(async () => {
    if (!roomTypeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await roomTypeApi.getRoomTypeImages(roomTypeId);
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
  }, [roomTypeId]);

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
        const data = await roomTypeApi.uploadRoomTypeImages(roomTypeId, fileList);
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
    [roomTypeId]
  );

  const removeImage = useCallback(
    async (imageId) => {
      try {
        await roomTypeApi.deleteRoomTypeImage(roomTypeId, imageId);
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
    [roomTypeId, fetchImages]
  );

  const setAsPrimary = useCallback(
    async (imageId) => {
      const data = await roomTypeApi.setRoomTypeImagePrimary(roomTypeId, imageId);
      setImages(data || []);
      return data;
    },
    [roomTypeId]
  );

  const moveImage = useCallback(
    async (imageId, direction) => {
      const index = images.findIndex((img) => img.id === imageId);
      if (index === -1) return;
      const target = images[index + direction];
      if (!target) return;
      const data = await roomTypeApi.updateRoomTypeImageOrder(
        roomTypeId,
        imageId,
        target.sortOrder
      );
      setImages(data || []);
      return data;
    },
    [roomTypeId, images]
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