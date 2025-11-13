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
  } = useQuery({
    queryKey: ["loggedInSeller"],
    queryFn: fetchSeller,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return { seller, isLoading, isError, refetch };
};

export default useSeller;
