'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { updateRole, Role } from '@/apis/roleAPI';
import { toastError, toastSuccess } from '@/utils/toast';

interface UpdateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

interface UpdateRoleFormData {
  name: string;
  description: string;
  active: boolean;
}

const UpdateRoleModal: React.FC<UpdateRoleModalProps> = ({ isOpen, onClose, role }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateRoleFormData>();

  const activeValue = watch('active');

  useEffect(() => {
    if (role && isOpen) {
      setValue('name', role.name);
      setValue('description', role.description || '');
      setValue('active', role.active);
    }
  }, [role, setValue, isOpen]);

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; name: string; description?: string; active: boolean }) =>
      updateRole(payload),
    onSuccess: () => {
      toastSuccess('Role updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      handleClose();
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to update role');
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: UpdateRoleFormData) => {
    if (!role) return;
    updateMutation.mutate({
      id: role.id,
      name: data.name,
      description: data.description.trim() || undefined,
      active: data.active,
    });
  };

  if (!isOpen || !role) return null;

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} title="Update Role" noFooter>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Role Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Enter role name"
            register={register('name', {
              required: 'Role name is required',
              minLength: {
                value: 2,
                message: 'Role name must be at least 2 characters',
              },
            })}
            error={errors.name?.message}
            disabled={updateMutation.isPending}
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
            disabled={updateMutation.isPending}
            className={`mt-1 block w-full rounded-md border px-4 py-2 text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 ${
              updateMutation.isPending ? 'cursor-not-allowed bg-gray-100 opacity-50' : 'border-gray-300'
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
                onChange={() => setValue('active', true)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                disabled={updateMutation.isPending}
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
                onChange={() => setValue('active', false)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                disabled={updateMutation.isPending}
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                Inactive
              </span>
            </label>
          </div>
        </div>

        {/* Current Info */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Current Information</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Name:</span>
              <span className="font-medium text-blue-900">{role.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Status:</span>
              <span className={`font-medium ${role.active ? 'text-green-700' : 'text-gray-700'}`}>
                {role.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {role.description && (
              <div className="pt-1 border-t border-blue-200 mt-2">
                <span className="text-blue-700">Description:</span>
                <p className="text-blue-600 mt-1">{role.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Changing status to inactive will prevent this role from being assigned to new users.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outlined"
            size="small"
            onClick={handleClose}
            disabled={updateMutation.isPending}
            classes="w-auto px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            isLoading={updateMutation.isPending}
            disabled={updateMutation.isPending}
            classes="w-auto px-4"
          >
            {updateMutation.isPending ? 'Updating...' : 'Update Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateRoleModal;