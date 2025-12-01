'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ROUTES from '@/config/route';
import Button from '@/components/common/Button';
import { useProducts } from '@/hooks/useProducts';
import { useDeleteProduct } from '@/hooks/useProductMutations';
import { ProductDTOResponse, ProductPageResponse } from '@/apis/productAPI';
import { useGetCategories } from '@/apis/categoryAPI';
import { Category } from '@/apis/categoryAPI';
import { useProductImageUrls } from '@/hooks/useProductImageUrls';

const PAGE_SIZE = 20;

const ProductsPage = () => {
  const router = useRouter();
  const deleteProductMutation = useDeleteProduct();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading, isError } = useProducts(
    page,
    PAGE_SIZE,
    search.trim() === "" ? undefined : search,
    categoryFilter ? Number(categoryFilter) : undefined
  );
  const { data: categories = [] } = useGetCategories();

  const getFinalPrice = (p: ProductDTOResponse) =>
    Math.round(p.oldPrice * (1 - (p.saleRate || 0) / 100));

  const products = data?.data.result || [];
  const totalItems = data?.data.meta.total || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const { data: publicImageUrls = [] } = useProductImageUrls(products);

  const imageMap = useMemo(() => {
    const map: Record<string, string> = {};
    products.forEach((p, index) => {
      const fileName = p.imageUrl?.[0];
      if (fileName) {
        map[fileName] = publicImageUrls[index];
      }
      });
    return map;
  }, [products, publicImageUrls]);


  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (page > 3) pages.push('...');

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push('...');

    pages.push(totalPages);

    return pages;
  };

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const pagination = getPaginationNumbers();

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);
  
  return (
    <DashboardLayout>
      <div className="p-6">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-6">Danh sách sản phẩm</h1>
          <div>
            <Button onClick={() => router.push(ROUTES.ADD_PRODUCT)}>
            + Thêm sản phẩm
          </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            className="border rounded px-3 py-2 w-60"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded px-3 py-2"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <p>Đang tải sản phẩm...</p>}
        {isError && <p>Lỗi tải sản phẩm</p>}

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(ROUTES.PRODUCT_DETAIL(product.id))}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer bg-white"
            >
              {/* Ảnh sản phẩm */}
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={imageMap[product.imageUrl?.[0]] || "/no-image.png"}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Nội dung dưới ảnh */}
              <div className="p-3">
                <h2 className="font-semibold text-sm mb-1 truncate">{product.name}</h2>

                <p className="font-bold text-red-500 text-sm">
                  {getFinalPrice(product).toLocaleString()} VND
                </p>

                {product.saleRate ? (
                  <p className="line-through text-gray-400 text-xs">
                    {product.oldPrice.toLocaleString()} VND
                  </p>
                ) : null}

                <p className="text-xs text-gray-600">SL: {product.quantity}</p>
                <p className="text-xs text-gray-500">
                  {product.category?.name ?? "Không có danh mục"}
                </p>

                {/* Nút hành động */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(ROUTES.EDIT_PRODUCT(product.id));
                    }}
                    className="flex-1 px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProductMutation.mutate(product.id);
                    }}
                    className="flex-1 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button onClick={prevPage} disabled={page === 1} className="p-2 border rounded disabled:opacity-50">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            {pagination.map((p, idx) => (
              <button
                key={idx}
                onClick={() => typeof p === 'number' && setPage(p)}
                className={`px-3 py-1 border rounded ${
                  page === p ? 'bg-blue-500 text-white' : 'bg-white'
                } ${p === '...' ? 'cursor-default' : ''}`}
                disabled={p === '...'}
              >
                {p}
              </button>
            ))}

            <button
              onClick={nextPage}
              disabled={page === totalPages}
              className="p-2 border rounded disabled:opacity-50"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;