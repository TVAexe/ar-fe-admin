'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import axios from '@/utils/axios';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ROUTES from '@/config/route';
import Button from '@/components/common/Button';
import { useDeleteProduct } from '@/hooks/useProductMutations';

interface Product {
  id: number;
  name: string;
  oldPrice: number;
  saleRate?: number;
  quantity: number;
  imageUrl?: string[];
  category?: {
    id: number;
    name: string;
  }
}

interface ProductPageResponse {
  data: {
    meta: {
      page: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: Product[];
  };
}

const PAGE_SIZE = 20;

const fetchProducts = async (page: number): Promise<ProductPageResponse> => {
  const response = await axios.get(`/api/v1/products?page=${page}&pageSize=${PAGE_SIZE}`);
  return response.data;
};

const ProductsPage = () => {
  const router = useRouter();
  const deleteProductMutation = useDeleteProduct();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', page],
    queryFn: () => fetchProducts(page),
    placeholderData: (previousData) => previousData
  });

  const getFinalPrice = (p: Product) =>
    Math.round(p.oldPrice * (1 - (p.saleRate || 0) / 100));

  const products = data?.data?.result ?? [];
  const totalItems = data?.data?.meta?.total ?? 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);


  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter ? p.category?.name === categoryFilter : true;
      return matchSearch && matchCategory;
    });
  }, [products, search, categoryFilter]);

  
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

  return (
    <DashboardLayout>
      <div className="p-6">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-6 mr-200">Danh sách sản phẩm</h1>
          <Button onClick={() => router.push(ROUTES.ADD_PRODUCT)}>
            + Thêm sản phẩm
          </Button>
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
            <option value="Bar furniture">Bar furniture</option>
            <option value="Chair">Chair</option>
            <option value="Table">Table</option>
          </select>
        </div>

        {isLoading && <p>Đang tải sản phẩm...</p>}
        {isError && <p>Lỗi tải sản phẩm</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div 
              key={product.id}
              onClick={() => router.push(ROUTES.PRODUCT_DETAIL(product.id))}
              className="border rounded p-4 hover:shadow-md transition"
              >
              <h2 className="font-semibold">{product.name}</h2>
              <p>
                Giá: {getFinalPrice(product).toLocaleString()} VND
              </p>
              {product.saleRate ? (
                <p className="line-through text-gray-400 text-sm">{product.oldPrice.toLocaleString()} VND</p>
              ) : null}
              <p>Số lượng: {product.quantity}</p>
              <p className="text-sm text-gray-500">
                Danh mục: {product.category?.name ?? 'Không có'}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();           
                  router.push(ROUTES.EDIT_PRODUCT(product.id));
                }}
                className="mt-3 mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Sửa
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProductMutation.mutate(product.id);
                }}
                className="mt-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Xóa
              </button>
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