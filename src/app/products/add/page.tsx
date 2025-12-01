'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { toastError, toastSuccess } from '@/utils/toast';
import { CreateProductDTOPayload } from '@/apis/productAPI';
import { useCreateProduct } from '@/hooks/useProductMutations';
import ROUTES from '@/config/route';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadMultipleFiles } from '@/apis/fileAPI';

// Tạm thời mock categories
const mockCategories = [
  { id: 1, name: 'Bar furniture' },
  { id: 2, name: 'Beds' },
  { id: 3, name: 'Bookcases & shelving units' },
];

const CreateProductPage = () => {
  const router = useRouter();
  const createMutation = useCreateProduct();

  const { 
    register, 
    handleSubmit, 
    setValue, 
    formState: { errors } 
  } = useForm<CreateProductDTOPayload>();

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Drag & Drop xử lý
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...images, ...acceptedFiles];
    setImages(newFiles);
    setValue('imageUrl', [] as any);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  }, [images, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  // Xóa 1 ảnh
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const onSubmit = async (data: CreateProductDTOPayload) => {
    try {
      // upload files, fileUrls is fileNames + UUID
      const fileNames = await uploadMultipleFiles(images);

      const payload: CreateProductDTOPayload = {
        ...data,
        imageUrl: fileNames.filter(Boolean),
      };

      createMutation.mutate(payload, {
        onSuccess: () => {
          toastSuccess('Tạo sản phẩm thành công!');
          router.push(ROUTES.PRODUCTS);
        },

        onError: () => {
          toastError("Tao sản phẩm thất bại. Vui lòng thử lại.");
        }
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toastError('Tải ảnh lên thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-grey-800 mb-2">
            Thêm sản phẩm mới
          </h2>
        </div>
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-6 max-w-3xl mx-auto"
    >
      {/* Tên sản phẩm */}
      <Input
        id="name"
        type="text"
        label="Tên sản phẩm"
        placeholder="Nhập tên sản phẩm"
        register={register('name', { required: 'Tên sản phẩm là bắt buộc' })}
        error={errors.name?.message}
      />

      {/* Giá */}
      <Input
        id="oldPrice"
        type="number"
        label="Giá gốc"
        placeholder="Nhập giá"
        register={register('oldPrice', {
          required: 'Giá là bắt buộc',
          valueAsNumber: true,
        })}
        error={errors.oldPrice?.message}
      />

      {/* Sale */}
      <Input
        id="saleRate"
        type="number"
        label="Tỉ lệ giảm (%)"
        placeholder="Nhập tỉ lệ giảm"
        register={register('saleRate', { valueAsNumber: true })}
        error={errors.saleRate?.message}
      />

      {/* Quantity */}
      <Input
        id="quantity"
        type="number"
        label="Số lượng"
        placeholder="Nhập số lượng"
        register={register('quantity', {
          required: 'Số lượng là bắt buộc',
          valueAsNumber: true,
        })}
        error={errors.quantity?.message}
      />

      {/* Description */}
      <Input
        id="description"
        type="text"
        label="Mô tả"
        placeholder="Nhập mô tả sản phẩm"
        register={register('description')}
      />

      {/* Category Dropdown */}
      <div>
        <label className="font-medium">Danh mục</label>
        <select
          className="w-full border mt-1 rounded px-3 py-2"
          {...register('categoryId', {
            required: 'Danh mục là bắt buộc',
            valueAsNumber: true,
          })}
          disabled={createMutation.isPending}
        >
          <option value="">Chọn danh mục</option>
          {mockCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Drag & Drop Upload */}
      <div>
        <label className="font-medium">Ảnh sản phẩm</label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded p-6 text-center cursor-pointer mt-1 transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Kéo thả ảnh vào đây...</p>
          ) : (
            <p>Kéo thả hoặc click để chọn ảnh</p>
          )}
        </div>

        {/* Preview Grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {previews.map((src, idx) => (
              <div key={idx} className="relative group border rounded overflow-hidden">
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  onClick={() => removeImage(idx)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" isLoading={createMutation.isPending}>
        Thêm sản phẩm
      </Button>
    </form>
    </div>
    </div>
  );
};

export default CreateProductPage;
