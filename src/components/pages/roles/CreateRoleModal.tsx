'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { createRole } from '@/apis/roleAPI';
import { toastError, toastSuccess } from '@/utils/toast';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateRoleFormData {
  name: string;
  description: string;
  active: boolean;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateRoleFormData>({
    defaultValues: {
      active: true,
      description: '',
    },
  });

  const activeValue = watch('active');

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toastSuccess('Role created successfully!');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      handleClose();
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to create role');
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CreateRoleFormData) => {
    createMutation.mutate({
      name: data.name,
      description: data.description.trim() || undefined,
      active: data.active,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} title="Create New Role" noFooter>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Role Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Enter role name (e.g., MANAGER, STAFF)"
            register={register('name', {
              required: 'Role name is required',
              minLength: {
                value: 2,
                message: 'Role name must be at least 2 characters',
              },
            })}
            error={errors.name?.message}
            disabled={createMutation.isPending}
            label=""
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Enter role description"
            {...register('description')}
            disabled={createMutation.isPending}
            className={`mt-1 block w-full rounded-md border px-4 py-2 text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 ${
              createMutation.isPending ? 'cursor-not-allowed bg-gray-100 opacity-50' : 'border-gray-300'
            }`}
          />
        </div>

        {/* Active Status */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="true"
                {...register('active')}
                checked={activeValue === true}
                onChange={() => {}}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                disabled={createMutation.isPending}
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                Active
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="false"
                {...register('active')}
                checked={activeValue === false}
                onChange={() => {}}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                disabled={createMutation.isPending}
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                Inactive
              </span>
            </label>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Active roles can be assigned to users. Inactive roles cannot be assigned.
          </p>
        </div>

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
            {createMutation.isPending ? 'Creating...' : 'Create Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRoleModal;