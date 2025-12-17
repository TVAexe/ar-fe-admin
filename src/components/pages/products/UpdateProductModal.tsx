'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Image from 'next/image';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import { updateProduct, UpdateProductPayload, getProductById } from '@/apis/productAPI';
import { uploadMultipleFiles, deleteFile } from '@/apis/fileAPI';
import { getCategories, Category } from '@/apis/categoriesAPI';
import CreateCategoryModal from './CreateNewCategoryModal';
import { toastError, toastSuccess } from '@/utils/toast';

interface UpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number | null;
}

interface UpdateProductFormData {
  name: string;
  oldPrice: number;
  saleRate: number;
  quantity: number;
  description: string;
  categoryId: number | string;
}

const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
  isOpen,
  onClose,
  productId,
}) => {
  const queryClient = useQueryClient();
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const [newModelFile, setNewModelFile] = useState<File | null>(null);
  const [newModelFileName, setNewModelFileName] = useState<string>('');
  const [isModelRemoved, setIsModelRemoved] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UpdateProductFormData>();

  // Fetch product details
  const {
    data: productData,
    isLoading: isLoadingProduct,
    error: productError,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId!),
    enabled: isOpen && productId !== null,
  });

  // Fetch categories
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: isOpen,
  });

  const categories = categoriesData?.data ?? [];
  const product = productData?.data;

  // Existing images from product
  const existingImageUrls = product?.imageUrl ?? [];

  // Set form values when product data is loaded
  useEffect(() => {
    if (product && isOpen) {
      setValue('name', product.name);
      setValue('oldPrice', product.oldPrice);
      setValue('saleRate', product.saleRate);
      setValue('quantity', product.quantity);
      setValue('description', product.description);
      setValue('categoryId', product.category.id);
    }
  }, [product, setValue, isOpen]);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductPayload }) =>
      updateProduct(id, payload),
    onSuccess: () => {
      toastSuccess('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      handleClose();
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to update product');
      setIsProcessing(false);
    },
  });

  const handleClose = () => {
    reset();
    setNewImages([]);
    setNewPreviewUrls([]);
    setRemovedImageUrls([]);
    setNewModelFile(null);
    setNewModelFileName('');
    setIsModelRemoved(false);
    setIsProcessing(false);
    onClose();
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const remainingExistingImages = existingImageUrls.filter(
      (url) => !removedImageUrls.includes(url)
    );
    const totalImages = remainingExistingImages.length + newImages.length + newFiles.length;

    if (totalImages > 5) {
      toastError('You can only have up to 5 images in total');
      return;
    }

    const newUrls = newFiles.map((file) => URL.createObjectURL(file));

    setNewImages((prev) => [...prev, ...newFiles]);
    setNewPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  const removeExistingImage = (url: string) => {
    setRemovedImageUrls((prev) => [...prev, url]);
  };

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.glb')) {
      toastError('Please select a valid .glb file');
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toastError('Model file size must be less than 50MB');
      return;
    }

    setNewModelFile(file);
    setNewModelFileName(file.name);
    setIsModelRemoved(false); // Reset removed flag if uploading new file
  };

  const removeNewModelFile = () => {
    setNewModelFile(null);
    setNewModelFileName('');
  };

  const removeExistingModel = () => {
    setIsModelRemoved(true);
    setNewModelFile(null);
    setNewModelFileName('');
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newPreviewUrls[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: UpdateProductFormData) => {
    if (!productId) {
      toastError('Product ID is missing');
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Calculate remaining existing images
      const remainingExistingUrls = existingImageUrls.filter(
        (url) => !removedImageUrls.includes(url)
      );

      // 2. Delete removed images from S3 (parallel)
      if (removedImageUrls.length > 0) {
        await Promise.allSettled(
          removedImageUrls.map(async (url) => {
            try {
              await deleteFile(url);
            } catch (error) {
              console.error('❌ Failed to delete:', url, error);
            }
          })
        );
      }

      // 3. Upload new images and get URLs
      let newImageUrls: string[] = [];
      if (newImages.length > 0) {
        const uploadResponse = await uploadMultipleFiles(newImages);
        // Extract fileUrls from response data
        if (uploadResponse && uploadResponse.data && uploadResponse.data.fileUrls) {
          newImageUrls = Array.isArray(uploadResponse.data.fileUrls) 
            ? uploadResponse.data.fileUrls 
            : [];
        }
      }

      // 4. Upload new model file if provided
      let finalModelUrl: string | undefined = product?.arModel?.glbUrl || undefined;
      
      if (newModelFile) {
        // Upload new model file
        const modelUploadResponse = await uploadMultipleFiles([newModelFile]);
        if (modelUploadResponse && modelUploadResponse.data && modelUploadResponse.data.fileUrls) {
          const modelUrls = Array.isArray(modelUploadResponse.data.fileUrls) 
            ? modelUploadResponse.data.fileUrls 
            : [];
          if (modelUrls.length > 0) {
            // Delete old model if exists
            if (product?.arModel?.glbUrl) {
              try {
                await deleteFile(product.arModel.glbUrl);
              } catch (error) {
                console.error('❌ Failed to delete old model:', error);
              }
            }
            finalModelUrl = modelUrls[0];
          }
        }
      } else if (isModelRemoved) {
        // Delete old model if removed
        if (product?.arModel?.glbUrl) {
          try {
            await deleteFile(product.arModel.glbUrl);
          } catch (error) {
            console.error('❌ Failed to delete model:', error);
          }
        }
        finalModelUrl = undefined;
      }

      // 5. Calculate final image URLs
      const finalImageUrls = [...remainingExistingUrls, ...newImageUrls];
      if (finalImageUrls.length === 0) {
        toastError('Please keep at least one image');
        setIsProcessing(false);
        return;
      }

      if (finalImageUrls.length > 5) {
        toastError('Maximum 5 images allowed');
        setIsProcessing(false);
        return;
      }

      if (!data.categoryId) {
        toastError('Please select a category');
        setIsProcessing(false);
        return;
      }

      // 6. Update product with final URLs and modelUrl
      const payload: UpdateProductPayload = {
        name: data.name,
        oldPrice: Number(data.oldPrice),
        saleRate: Number(data.saleRate),
        quantity: Number(data.quantity),
        description: data.description,
        categoryId: Number(data.categoryId),
        imageUrl: finalImageUrls,
        modelUrl: finalModelUrl,
      };
      updateMutation.mutate({ id: productId, payload });
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Failed to process images');
      setIsProcessing(false);
    }
  };

  const handleCategoryCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  if (!isOpen) return null;

  if (isLoadingProduct) {
    return (
      <Modal isOpen={isOpen} handleClose={handleClose} title="Update Product" noFooter>
        <Loading />
      </Modal>
    );
  }

  if (productError) {
    return (
      <Modal isOpen={isOpen} handleClose={handleClose} title="Update Product" noFooter>
        <div className="text-center text-red-600 py-4">Failed to load product details.</div>
      </Modal>
    );
  }

  const remainingExistingImages = existingImageUrls.filter(
    (url) => !removedImageUrls.includes(url)
  );
  const totalImages = remainingExistingImages.length + newImages.length;

  return (
    <>
      <Modal isOpen={isOpen} handleClose={handleClose} title="Update Product" noFooter>
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
              disabled={isProcessing}
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
              disabled={isProcessing}
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
              disabled={isProcessing}
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
              disabled={isProcessing}
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
                  disabled={isCategoriesLoading || isProcessing}
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
              disabled={isProcessing}
              className={`mt-1 block w-full rounded-md border px-4 py-2 text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } ${isProcessing ? 'cursor-not-allowed bg-gray-100 opacity-50' : ''}`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message as string}
              </p>
            )}
          </div>

          {/* 3D Model Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                3D Model File (.glb)
              </label>
              {(product?.arModel?.glbUrl && !isModelRemoved) && !newModelFile && (
                <span className="text-xs text-blue-600 font-medium">
                  ✓ Model exists
                </span>
              )}
              {newModelFile && (
                <span className="text-xs text-green-600 font-medium">
                  ✓ New model selected
                </span>
              )}
            </div>

            {/* Current Model Display */}
            {product?.arModel?.glbUrl && !isModelRemoved && !newModelFile && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14a5 5 0 015-5h6a5 5 0 015 5v6a5 5 0 01-5 5h-6a5 5 0 01-5-5v-6z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10v10m8-10v10M8 14h8" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800">Current 3D Model</h4>
                      <a
                        href={product.arModel.glbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Model
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeExistingModel}
                    disabled={isProcessing}
                    className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-md hover:bg-red-50"
                    title="Remove model"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* New Model Upload */}
            {(!product?.arModel?.glbUrl || isModelRemoved) && !newModelFile && (
              <label
                htmlFor="modelFile"
                className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
              >
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M8 14a5 5 0 015-5h22a5 5 0 015 5v20a5 5 0 01-5 5H13a5 5 0 01-5-5V14z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 14v20m12-20v20M8 24h32" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">Click to upload 3D model (.glb)</p>
                  <p className="text-xs text-gray-500">GLB format, max 50MB</p>
                </div>
                <input
                  id="modelFile"
                  type="file"
                  accept=".glb"
                  onChange={handleModelFileChange}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>
            )}

            {/* Replace existing model */}
            {product?.arModel?.glbUrl && !isModelRemoved && !newModelFile && (
              <label
                htmlFor="modelFileReplace"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-colors"
              >
                <div className="text-center">
                  <p className="text-sm text-blue-700 font-medium">Replace with new model</p>
                  <p className="text-xs text-blue-600">Click to upload a new .glb file</p>
                </div>
                <input
                  id="modelFileReplace"
                  type="file"
                  accept=".glb"
                  onChange={handleModelFileChange}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>
            )}

            {/* New Model File Selected */}
            {newModelFile && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800">{newModelFileName}</p>
                      <p className="text-xs text-green-600">
                        {(newModelFile.size / (1024 * 1024)).toFixed(2)} MB - Ready to upload
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeNewModelFile}
                    disabled={isProcessing}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {isModelRemoved && !newModelFile && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-sm text-red-700">
                  <strong>⚠️ Model will be removed</strong> - The 3D model will be deleted when you save.
                </p>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Product Images (Max 5)
              </label>
              <span className="text-xs text-gray-500">{totalImages} / 5 selected</span>
            </div>

            {/* Existing Images */}
            {remainingExistingImages.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-700 mb-3">
                  Current Images ({remainingExistingImages.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {remainingExistingImages.map((url, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-full aspect-square bg-gray-200">
                        <Image
                          src={url}
                          alt={`Existing ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="120px"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        disabled={isProcessing}
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <label
              htmlFor="images"
              className={`flex items-center justify-center w-full px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors ${
                totalImages >= 5 || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
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
                  {totalImages >= 5
                    ? 'Maximum 5 images reached'
                    : 'Click to upload new images'}
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
              </div>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleNewImageChange}
                disabled={totalImages >= 5 || isProcessing}
                className="hidden"
              />
            </label>

            {/* New Images Preview */}
            {newPreviewUrls.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-700 mb-3">
                  New Images ({newPreviewUrls.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {newPreviewUrls.map((url, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-full aspect-square bg-gray-200">
                        <Image
                          src={url}
                          alt={`New ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          unoptimized
                          sizes="120px"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        disabled={isProcessing}
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
                          {newImages[index]?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product?.modelUrl && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-700 mb-2">Current 3D Model</h4>
            <a
              href={product.modelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View 3D Model
            </a>
          </div>
            )}

            {/* Upload Progress */}
            {isProcessing && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-yellow-700 font-medium">
                    Processing images and updating product... Please wait.
                  </p>
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
              disabled={isProcessing}
              classes="w-auto px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
              isLoading={isProcessing}
              disabled={isProcessing}
              classes="w-auto px-4"
            >
              {isProcessing ? 'Processing...' : 'Update Product'}
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

export default UpdateProductModal;