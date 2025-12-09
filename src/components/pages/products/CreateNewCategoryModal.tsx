'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { createCategory } from '@/apis/categoriesAPI';
import { toastError, toastSuccess } from '@/utils/toast';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated?: () => void;
}

interface CreateCategoryFormData {
  name: string;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ 
  isOpen, 
  onClose,
  onCategoryCreated 
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryFormData>();

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toastSuccess('Category created successfully!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleClose();
      onCategoryCreated?.();
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to create category');
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CreateCategoryFormData) => {
    createMutation.mutate({
      name: data.name.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      title="Create New Category"
      noFooter
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="categoryName"
          label="Category Name"
          type="text"
          placeholder="Enter category name"
          register={register('name', {
            required: 'Category name is required',
            minLength: {
              value: 2,
              message: 'Category name must be at least 2 characters',
            },
          })}
          error={errors.name?.message}
          disabled={createMutation.isPending}
        />

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
            {createMutation.isPending ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCategoryModal;