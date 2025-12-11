'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { createUser } from '@/apis/userAPI';
import { getRoles } from '@/apis/roleAPI';
import { toastError, toastSuccess } from '@/utils/toast';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  roleId: number;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormData>({
    defaultValues: {
      gender: 'MALE',
    },
  });

  // Fetch roles
  const { data: rolesData, isLoading: isRolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles({ page: 0, size: 100 }),
    enabled: isOpen,
  });

  const roles = rolesData?.data?.result ?? [];
  const activeRoles = roles.filter((role) => role.active);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toastSuccess('User created successfully!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleClose();
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to create user');
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CreateUserFormData) => {
    createMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      phoneNumber: data.phoneNumber,
      age: Number(data.age),
      gender: data.gender,
      address: data.address,
      role: {
        id: Number(data.roleId),
      },
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} title="Create New User" noFooter>
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
          disabled={createMutation.isPending}
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
          disabled={createMutation.isPending}
        />

        {/* Password */}
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Enter password"
          register={register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
          error={errors.password?.message}
          disabled={createMutation.isPending}
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
          disabled={createMutation.isPending}
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
            disabled={createMutation.isPending}
          />

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              {...register('gender', { required: 'Gender is required' })}
              disabled={createMutation.isPending}
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
            disabled={createMutation.isPending}
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
            disabled={isRolesLoading || createMutation.isPending}
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a role</option>
            {activeRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.roleId && (
            <p className="mt-1 text-sm text-red-500">{errors.roleId.message}</p>
          )}
          {activeRoles.length === 0 && !isRolesLoading && (
            <p className="mt-1 text-sm text-yellow-600">
              No active roles available. Please create an active role first.
            </p>
          )}
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-1">Note</h4>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>Only active roles are available for selection</li>
            <li>Password must be at least 6 characters</li>
            <li>Phone number must be 10-11 digits</li>
          </ul>
        </div>

        {/* Actions */}
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
            {createMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;