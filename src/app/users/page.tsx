'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Loading from '@/components/common/Loading';
import Button from '@/components/common/Button';
import Table, { Column } from '@/components/common/Table';
import { getUsers, UserItem } from '@/apis/userAPI';
import CreateUserModal from '@/components/pages/users/CreateUserModal';
import UpdateUserModal from '@/components/pages/users/UpdateUserModal';
import DeleteUserModal from '@/components/pages/users/DeleteUserModal';

const UsersPage = () => {
  const [page, setPage] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const size = 10;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['users', page, size] as const,
    queryFn: () => getUsers({ page, size }),
    placeholderData: keepPreviousData,
  });

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (user: UserItem) => {
    setSelectedUser(user);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (user: UserItem) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-grey-900 mb-1">
              Failed to load users
            </h3>
            <p className="text-sm text-grey-600">Please try refreshing the page</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const users = data?.data?.result ?? [];
  const meta = data?.data?.meta;
  const totalPages = meta?.pages ?? 1;
  const total = meta?.total ?? 0;

  const columns: Column<UserItem>[] = [
    {
      header: 'ID',
      accessor: 'id',
      className: 'text-grey-800 font-semibold w-16',
    },
    {
      header: 'Name',
      accessor: 'name',
      className: 'text-grey-800 font-medium min-w-[150px]',
    },
    {
      header: 'Email',
      accessor: 'email',
      className: 'text-grey-700 min-w-[200px]',
    },
    {
      header: 'Phone',
      accessor: (row) => row.phoneNumber || '—',
      className: 'text-grey-700 min-w-[120px]',
    },
    {
      header: 'Role',
      accessor: (row) => {
        const roleName = row.role?.name;
        if (!roleName) {
          return (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-400 text-white">
              No Role
            </span>
          );
        }

        // Different colors for different roles
        const getRoleColor = () => {
          const lowerName = roleName.toLowerCase();
          if (lowerName.includes('admin')) return 'bg-red-600';
          if (lowerName.includes('manager')) return 'bg-blue-600';
          if (lowerName.includes('staff')) return 'bg-green-600';
          if (lowerName.includes('user')) return 'bg-purple-600';
          return 'bg-primary';
        };

        return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getRoleColor()}`}>
            {roleName}
          </span>
        );
      },
      className: 'text-center min-w-[120px]',
    },
    {
      header: 'Age',
      accessor: (row) => row.age?.toString() || '—',
      className: 'text-grey-700 text-center w-16',
    },
    {
      header: 'Gender',
      accessor: (row) => {
        if (!row.gender) return '—';
        const genderMap = {
          'MALE': '♂ Male',
          'FEMALE': '♀ Female',
          'OTHER': 'Other'
        };
        return genderMap[row.gender] || row.gender;
      },
      className: 'text-grey-700 text-center min-w-[100px]',
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      cell: (value) => new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      className: 'text-grey-600 text-sm min-w-[120px]',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleEdit(row)}
            classes="w-auto px-3 whitespace-nowrap"
          >
            Edit
          </Button>
          <Button
            variant="warning"
            size="small"
            onClick={() => handleDelete(row)}
            classes="w-auto px-3 whitespace-nowrap"
          >
            Delete
          </Button>
        </div>
      ),
      className: 'text-center min-w-[180px]',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Users Management</h1>
            <div className="text-sm text-grey-600">
              Page {page + 1} of {totalPages} · Total {total}
            </div>
          </div>
          <Button
            variant="contained"
            size="small"
            onClick={handleCreate}
            classes="w-auto"
          >
            Create User
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={users}
          rowKey="id"
          emptyMessage="No users found."
          pagination={{
            currentPage: page,
            totalPages,
            onPageChange: setPage,
            isLoading: isFetching,
          }}
        />
      </div>
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <UpdateUserModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        user={selectedUser}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        user={selectedUser}
      />
    </DashboardLayout>
  );
};

export default UsersPage;