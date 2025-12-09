'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Loading from '@/components/common/Loading';
import DisplayProducts from '@/components/pages/products/DisplayProducts';
import CreateProductModal from '@/components/pages/products/CreateNewProductModal';
import UpdateProductModal from '@/components/pages/products/UpdateProductModal';
import DeleteProductModal from '@/components/pages/products/DeleteConfirmModal';
import { getProducts } from '@/apis/productAPI';

const ProductsPage = () => {
  const [page, setPage] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const size = 5;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['products', page, size] as const,
    queryFn: () => getProducts({ page, size }),
    placeholderData: keepPreviousData,
  });

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (productId: number) => {
    setSelectedProductId(productId);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (productId: number, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setIsDeleteModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedProductId(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProductId(null);
    setSelectedProductName('');
  };

  if (isLoading) return <Loading />;

  if (error) {
    return <DashboardLayout>Failed to load products.</DashboardLayout>;
  }

  const products = data?.data?.result ?? [];
  const meta = data?.data?.meta;
  const totalPages = meta?.pages ?? 1;
  const total = meta?.total ?? 0;

  return (
    <DashboardLayout>
      <DisplayProducts
        products={products}
        page={page}
        totalPages={totalPages}
        total={total}
        isFetching={isFetching}
        onPageChange={setPage}
        onCreateClick={handleCreate}
        onEditClick={handleEdit}
        onDeleteClick={handleDelete}
      />

      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <UpdateProductModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        productId={selectedProductId}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        productId={selectedProductId}
        productName={selectedProductName}
      />
    </DashboardLayout>
  );
};

export default ProductsPage;