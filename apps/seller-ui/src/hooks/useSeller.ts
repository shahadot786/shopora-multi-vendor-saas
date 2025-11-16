import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const fetchSeller = async () => {
  const response = await axiosInstance.get("/api/seller-logged-in");
  return response.data.seller;
};

const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery({
    queryKey: ["loggedInSeller"],
    queryFn: fetchSeller,
    // staleTime: 2 * 60 * 1000,
    // retry: 1,
  });

  return { seller, isLoading, isError, refetch };
};

export default useSeller;
