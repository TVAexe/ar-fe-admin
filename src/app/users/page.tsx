'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Loading from '@/components/common/Loading';
import Button from '@/components/common/Button';
import Table, { Column } from '@/components/common/Table';
import { getUsers, UserItem } from '@/apis/userAPI';

const UsersPage = () => {
  const [page, setPage] = useState(0);
  const size = 5;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['users', page, size] as const,
    queryFn: () => getUsers({ page, size }),
    placeholderData: keepPreviousData,
  });

  const handleCreate = () => {
    // TODO: navigate to create-user page or open modal
  };

  const handleEdit = (_userId: number) => {
    // TODO: navigate to edit-user page or open modal
  };

  const handleDelete = (_userId: number) => {
    // TODO: trigger delete mutation
  };

  if (isLoading) return <Loading />;

  if (error) {
    return <DashboardLayout>Failed to load users.</DashboardLayout>;
  }

  const users = data?.data?.result ?? [];
  const meta = data?.data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  const columns: Column<UserItem>[] = [
    {
      header: 'ID',
      accessor: 'id',
      className: 'text-grey-800',
    },
    {
      header: 'Name',
      accessor: 'name',
      className: 'text-grey-800',
    },
    {
      header: 'Email',
      accessor: 'email',
      className: 'text-grey-700',
    },
    {
      header: 'Phone',
      accessor: 'phoneNumber',
      cell: (value) => value ?? '—',
      className: 'text-grey-700',
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      cell: (value) => new Date(value).toLocaleString(),
      className: 'text-grey-600',
    },
    {
      header: 'Updated',
      accessor: 'updatedAt',
      cell: (value) => (value ? new Date(value).toLocaleString() : '—'),
      className: 'text-grey-600',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleEdit(row.id)}
            classes="w-auto px-3"
          >
            Edit
          </Button>
          <Button
            variant="warning"
            size="small"
            onClick={() => handleDelete(row.id)}
            classes="w-auto px-3"
          >
            Delete
          </Button>
        </div>
      ),
      className: 'text-center',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <div className="text-sm text-grey-600">
              Page {page + 1} of {totalPages} · Total {meta?.total ?? 0}
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
    </DashboardLayout>
  );
};

export default UsersPage;
