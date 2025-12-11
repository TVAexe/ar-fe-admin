'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Image from 'next/image';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { createProduct, CreateProductPayload } from '@/apis/productAPI';
import { Category, getCategories } from '@/apis/categoriesAPI';
import CreateCategoryModal from './CreateNewCategoryModal';
import { toastError, toastSuccess } from '@/utils/toast';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateProductFormData {
  name: string;
  oldPrice: number;
  saleRate: number;
  quantity: number;
  description: string;
  categoryId: number | string;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductFormData>();

  // Fetch categories
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: isOpen,
  });

  const categories = categoriesData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toastSuccess('Product created successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      handleClose();
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to create product');
    },
  });

  const handleClose = () => {
    reset();
    setSelectedImages([]);
    setPreviewUrls([]);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = selectedImages.length + newFiles.length;

    if (totalImages > 5) {
      toastError('You can only upload up to 5 images');
      return;
    }

    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

    setSelectedImages((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CreateProductFormData) => {
    if (selectedImages.length === 0) {
      toastError('Please select at least one image');
      return;
    }

    if (!data.categoryId) {
      toastError('Please select a category');
      return;
    }

    const payload: CreateProductPayload = {
      name: data.name,
      oldPrice: Number(data.oldPrice),
      saleRate: Number(data.saleRate),
      quantity: Number(data.quantity),
      description: data.description,
      categoryId: Number(data.categoryId),
      images: selectedImages,
    };

    createMutation.mutate(payload);
  };

  const handleCategoryCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        handleClose={handleClose}
        title="Create New Product"
        noFooter
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-h-[80vh] overflow-y-auto pr-1 md:pr-2"
        >
          {/* Product name */}
          <div className="bg-white">
            <Input
              id="name"
              label="Product Name"
              type="text"
              placeholder="Enter product name"
              register={register('name', {
                required: 'Product name is required',
              })}
              error={errors.name?.message}
              disabled={createMutation.isPending}
            />
          </div>

          {/* Price & Sale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="oldPrice"
              label="Price ($)"
              type="number"
              placeholder="1299.99"
              register={register('oldPrice', {
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' },
              })}
              error={errors.oldPrice?.message}
              disabled={createMutation.isPending}
            />

            <Input
              id="saleRate"
              label="Sale Rate (%)"
              type="number"
              placeholder="20"
              register={register('saleRate', {
                required: 'Sale rate is required',
                min: { value: 0, message: 'Must be 0 or greater' },
                max: { value: 100, message: 'Must be 100 or less' },
              })}
              error={errors.saleRate?.message}
              disabled={createMutation.isPending}
            />
          </div>

          {/* Quantity & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="quantity"
              label="Quantity"
              type="number"
              placeholder="50"
              register={register('quantity', {
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity must be positive' },
              })}
              error={errors.quantity?.message}
              disabled={createMutation.isPending}
            />

            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <div className="flex gap-2">
                <select
                  id="categoryId"
                  {...register('categoryId', {
                    required: 'Category is required',
                  })}
                  disabled={isCategoriesLoading || createMutation.isPending}
                  className="flex-1 mt-1 block rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="">Select a category</option>
                  {categories.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => setIsCreateCategoryModalOpen(true)}
                  classes="w-auto px-3 mt-1"
                >
                  +
                </Button>
              </div>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.categoryId.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Enter product description"
              {...register('description', {
                required: 'Description is required',
              })}
              disabled={createMutation.isPending}
              className={`mt-1 block w-full rounded-md border px-4 py-2 text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } ${createMutation.isPending ? 'cursor-not-allowed bg-gray-100 opacity-50' : ''}`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message as string}
              </p>
            )}
          </div>

          {/* Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Product Images (Max 5)
              </label>
              <span className="text-xs text-gray-500">
                {selectedImages.length} / 5 selected
              </span>
            </div>

            <label
              htmlFor="images"
              className={`flex items-center justify-center w-full px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors ${
                selectedImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedImages.length >= 5
                    ? 'Maximum 5 images reached'
                    : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
              </div>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={selectedImages.length >= 5 || createMutation.isPending}
                className="hidden"
              />
            </label>

            {previewUrls.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Preview
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-full aspect-square bg-gray-200">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          unoptimized
                          sizes="120px"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={createMutation.isPending}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <svg
                          className="w-6 h-6 text-white drop-shadow-lg"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white truncate font-medium">
                          {selectedImages[index]?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={handleClose}
              disabled={createMutation.isPending}
              classes="w-auto px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
              isLoading={createMutation.isPending}
              disabled={createMutation.isPending}
              classes="w-auto px-4"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      <CreateCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </>
  );
};

export default CreateProductModal;
