import { useQuery } from "@tanstack/react-query";
import { getFileUrls } from "@/apis/fileAPI"; // bạn đổi path theo cấu trúc của bạn

export const useProductImageUrls = (products: any[]) => {
  const fileNames = products
    .map((p) => p.imageUrl?.[0])
    .filter(Boolean) as string[];

  return useQuery({
    queryKey: ["public-product-images", fileNames],
    queryFn: () => getFileUrls(fileNames),
    enabled: fileNames.length > 0,
    staleTime: 1000 * 60 * 10, // cache 10 phút
  });
};
