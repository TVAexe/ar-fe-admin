'use client';

import { useEffect, useState, useCallback } from 'react';
import { set, useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { useProduct } from '@/hooks/useProducts';
import { useUpdateProduct } from '@/hooks/useProductMutations';
import { getFileUrls, uploadMultipleFiles } from '@/apis/fileAPI';

import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { toastError, toastSuccess } from '@/utils/toast';
import { UpdateProductDTOPayload } from '@/apis/productAPI';

import { useDropzone } from 'react-dropzone';

const mockCategories = [
  { id: 1, name: 'Bar furniture' },
  { id: 2, name: 'Beds' },
  { id: 3, name: 'Bookcases & shelving units' },
];

const UpdateProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const { data: product, isLoading } = useProduct(id);
  const updateMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateProductDTOPayload>();

  // old/new fileNames (DB)
  const [oldFileNames, setOldFileNames] = useState<string[]>([]);
  const [newFileNames, setNewFileNames] = useState<string[]>([]);

  // old/new public URLs (UI)
  const [oldImages, setOldImages] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  /** Load dữ liệu vào form */
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        oldPrice: product.oldPrice,
        saleRate: product.saleRate,
        quantity: product.quantity,
        description: product.description,
        categoryId: product.category?.id,
      });

      const fileNames = product.imageUrl || [];
      setOldFileNames(fileNames);

      const fetchUrls = async () => {
        try {
          const urls = await getFileUrls(fileNames);
          setOldImages(urls);
        } catch (err) {
          console.error(err);
        }
      };
      fetchUrls();
    }
  }, [product, reset]);

  /** Drag & Drop thêm ảnh mới */
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const mergedFiles = [...newFiles, ...acceptedFiles];
      setNewFiles(mergedFiles);

      const previews = mergedFiles.map((file) => URL.createObjectURL(file));
      setNewPreviews(previews);
    },
    [newFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  /** Xóa ảnh cũ */
  const removeOldImage = (index: number) => {
    const tempFiles = [...oldFileNames];
    tempFiles.splice(index, 1);
    setOldFileNames(tempFiles);

    const tempUrls = [...oldImages];
    tempUrls.splice(index, 1);
    setOldImages(tempUrls);
  };

  /** Xóa ảnh mới */
  const removeNewImage = (index: number) => {
    const tempFiles = [...newFiles];
    tempFiles.splice(index, 1);
    setNewFiles(tempFiles);

    const tempPreviews = [...newPreviews];
    tempPreviews.splice(index, 1);
    setNewPreviews(tempPreviews);

    const tempFileNames = [...newFileNames];
    tempFileNames.splice(index, 1);
    setNewFileNames(tempFileNames);
  };

  /** SUBMIT UPDATE */
  const onSubmit = async (data: UpdateProductDTOPayload) => {
    try {
      let uploadedFileNames: string[] = [];

      if (newFiles.length > 0) {
        uploadedFileNames = await uploadMultipleFiles(newFiles);
        setNewFileNames(uploadedFileNames);
      }

      const payload: UpdateProductDTOPayload = {
        ...data,
        imageUrl: [...oldFileNames, ...uploadedFileNames],
      };

      updateMutation.mutate(
        { id, data: payload },
        {
          onSuccess: () => {
            toastSuccess('Cập nhật sản phẩm thành công!');
            router.push('/products');
          },
          onError: () => {
            toastError('Cập nhật thất bại!');
          },
        }
      );
    } catch (err) {
      console.error(err);
      toastError('Lỗi upload hình!');
    }
  };

  if (isLoading) return <p className="p-6 text-center">Đang tải sản phẩm...</p>;

  if (!product) return <p className="p-6 text-center">Không tìm thấy sản phẩm</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-grey-800 mb-2">
            Cập nhật sản phẩm
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 max-w-3xl mx-auto">
          {/* Tên */}
          <Input
            id="name"
            label="Tên sản phẩm"
            type="text"
            placeholder="Nhập tên"
            register={register('name', { required: 'Tên sản phẩm không được để trống' })}
            error={errors.name?.message}
          />

          {/* Giá */}
          <Input
            id="oldPrice"
            type="number"
            label="Giá gốc"
            placeholder="Nhập giá gốc"
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
            placeholder="Nhập % giảm"
            register={register('saleRate', { valueAsNumber: true })}
            error={errors.saleRate?.message}
          />

          {/* Số lượng */}
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

          {/* Mô tả */}
          <Input 
            id="description" 
            label="Mô tả" 
            type="text" 
            placeholder="Nhập mô tả"
            register={register('description')} 
          />

          {/* Category */}
          <div>
            <label className="font-medium">Danh mục</label>
            <select
              className="w-full border mt-1 rounded px-3 py-2"
              {...register('categoryId', {
                required: 'Danh mục là bắt buộc',
                valueAsNumber: true,
              })}
              defaultValue={product.category?.id}
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

          {/* Drag & Drop */}
          <div>
            <label className="font-medium">Ảnh sản phẩm</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded p-6 text-center cursor-pointer mt-1 
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
            >
              <input {...getInputProps()} />
              <p>{isDragActive ? 'Thả ảnh vào đây...' : 'Kéo thả hoặc click để chọn ảnh'}</p>
            </div>

            {/* Ảnh cũ */}
            {oldImages.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-1">Ảnh hiện tại:</p>
                <div className="grid grid-cols-3 gap-4">
                  {oldImages.map((src, idx) => (
                    <div key={idx} className="relative group border rounded overflow-hidden">
                      <img src={src} className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeOldImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full 
                          w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ảnh mới */}
            {newPreviews.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-1">Ảnh mới:</p>
                <div className="grid grid-cols-3 gap-4">
                  {newPreviews.map((src, idx) => (
                    <div key={idx} className="relative group border rounded overflow-hidden">
                      <img src={src} className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full 
                          w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button type="submit" isLoading={updateMutation.isPending}>
            Cập nhật sản phẩm
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductPage;
