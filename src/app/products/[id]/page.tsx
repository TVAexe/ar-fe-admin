'use client';

import { useParams } from 'next/navigation';
import { useProduct } from '@/hooks/useProducts';
import { useEffect, useState } from 'react';
import { getFileUrls } from '@/apis/fileAPI';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const ProductDetailPage = () => {
  const params = useParams();
  const id = Number(params?.id);

  const { data: product, isLoading, isError } = useProduct(id);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lấy public URLs cho ảnh
  useEffect(() => {
    const fetchImageUrls = async () => {
      if (product?.imageUrl && Array.isArray(product.imageUrl) && product.imageUrl.length > 0) {
        try {
          const urls = await getFileUrls(product.imageUrl);
          setImageUrls(urls);
        } catch (err) {
          console.error('Failed to fetch image URLs', err);
        }
      }
    };
    fetchImageUrls();
  }, [product]);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  if (isLoading) return <p className="p-6 text-center">Đang tải sản phẩm...</p>;
  if (isError || !product) return <p className="p-6 text-center">Không tìm thấy sản phẩm</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row gap-8">
      {/* Image carousel */}
      <div className="md:w-1/2 relative">
        {imageUrls.length > 0 ? (
          <div className="relative">
            <img
              src={imageUrls[currentIndex]}
              alt={product.name}
              className="w-full h-[400px] object-cover rounded-lg"
            />
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="flex mt-2 space-x-2 justify-center">
              {imageUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`thumb-${idx}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                    idx === currentIndex ? 'border-blue-500' : 'border-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center rounded-lg">
            Không có ảnh
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="md:w-1/2 flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="flex items-baseline gap-4">
          <p className="text-xl font-semibold text-red-600">
            {Math.round(product.oldPrice * (1 - (product.saleRate || 0) / 100)).toLocaleString()} VND
          </p>
          {product.saleRate ? (
            <p className="text-sm line-through text-gray-400">{product.oldPrice.toLocaleString()} VND</p>
          ) : null}
        </div>

        <p className="text-gray-700">{product.description}</p>

        <p>
          <span className="font-semibold">Số lượng: </span>
          {product.quantity}
        </p>
        <p>
          <span className="font-semibold">Danh mục: </span>
          {product.category?.name}
        </p>
        <p>
          <span className="font-semibold">Người tạo: </span>
          {product.createdBy}
        </p>
        <p>
          <span className="font-semibold">Ngày tạo: </span>
          {new Date(product.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ProductDetailPage;
