'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { updateUser, UserItem } from '@/apis/userAPI';
import { getRoles } from '@/apis/roleAPI';
import { toastError, toastSuccess } from '@/utils/toast';

interface UpdateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
}

interface UpdateUserFormData {
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  roleId: number;
}

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({ isOpen, onClose, user }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UpdateUserFormData>();

  // Fetch roles
  const { data: rolesData, isLoading: isRolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles({ page: 0, size: 100 }),
    enabled: isOpen,
  });

  const roles = rolesData?.data?.result ?? [];

  useEffect(() => {
    if (user && isOpen) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('phoneNumber', user.phoneNumber || '');
      setValue('age', user.age || 0);
      setValue('gender', user.gender || 'MALE');
      setValue('address', user.address || '');
      // Safe access with optional chaining and default value
      setValue('roleId', user.role?.id || 0);
    }
  }, [user, setValue, isOpen]);

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toastSuccess('User updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleClose();
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to update user');
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: UpdateUserFormData) => {
    if (!user) return;

    const payload: any = {
      id: user.id,
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      age: Number(data.age),
      gender: data.gender,
      address: data.address,
      role: {
        id: Number(data.roleId),
      },
    };

    updateMutation.mutate(payload);
  };

  if (!isOpen || !user) return null;

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} title="Update User" noFooter>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Name */}
        <Input
          id="name"
          label="Full Name"
          type="text"
          placeholder="Enter full name"
          register={register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
          error={errors.name?.message}
          disabled={updateMutation.isPending}
        />

        {/* Email */}
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="user@example.com"
          register={register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email format',
            },
          })}
          error={errors.email?.message}
          disabled={updateMutation.isPending}
        />

        {/* Phone Number */}
        <Input
          id="phoneNumber"
          label="Phone Number"
          type="text"
          placeholder="0901234567"
          register={register('phoneNumber', {
            required: 'Phone number is required',
            pattern: {
              value: /^[0-9]{10,11}$/,
              message: 'Invalid phone number (10-11 digits)',
            },
          })}
          error={errors.phoneNumber?.message}
          disabled={updateMutation.isPending}
        />

        {/* Age & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="age"
            label="Age"
            type="number"
            placeholder="25"
            register={register('age', {
              required: 'Age is required',
              min: { value: 1, message: 'Age must be greater than 0' },
              max: { value: 150, message: 'Invalid age' },
            })}
            error={errors.age?.message}
            disabled={updateMutation.isPending}
          />

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              {...register('gender', { required: 'Gender is required' })}
              disabled={updateMutation.isPending}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            rows={2}
            placeholder="Enter full address"
            {...register('address', { required: 'Address is required' })}
            disabled={updateMutation.isPending}
            className={`mt-1 block w-full rounded-md border px-4 py-2 text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="roleId"
            {...register('roleId', { required: 'Role is required' })}
            disabled={isRolesLoading || updateMutation.isPending}
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a role</option>
            {roles.filter(r => r.active).map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.roleId && (
            <p className="mt-1 text-sm text-red-500">{errors.roleId.message}</p>
          )}
        </div>

        {/* Current Info */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Current Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700">Current Role:</span>
              <span className="font-medium text-blue-900 ml-1">{user.role?.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-blue-700">User ID:</span>
              <span className="font-medium text-blue-900 ml-1">#{user.id}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
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
            {updateMutation.isPending ? 'Updating...' : 'Update User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateUserModal;