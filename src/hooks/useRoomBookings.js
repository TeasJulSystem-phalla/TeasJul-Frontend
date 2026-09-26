import { useCallback, useEffect, useState } from "react";
import { roomBookingApi } from "../api/roomBooking.api";

export function useRoomBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBookings(await roomBookingApi.getBookings());
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to load room bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (data) => {
    const booking = await roomBookingApi.createBooking(data);
    setBookings((previous) => [booking, ...previous]);
    return booking;
  }, []);

  const cancelBooking = useCallback(async (id) => {
    const booking = await roomBookingApi.cancelBooking(id);
    setBookings((previous) => previous.map((item) => (item.id === id ? booking : item)));
    return booking;
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return { bookings, loading, error, fetchBookings, createBooking, cancelBooking };
}
