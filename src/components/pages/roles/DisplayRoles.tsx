'use client';

import Button from '@/components/common/Button';
import Table, { Column } from '@/components/common/Table';
import { Role } from '@/apis/roleAPI';

interface DisplayRolesProps {
  roles: Role[];
  page: number;
  totalPages: number;
  total: number;
  isFetching: boolean;
  onPageChange: (newPage: number) => void;
  onCreateClick: () => void;
  onEditClick: (role: Role) => void;
  onDeleteClick: (role: Role) => void;
}

const DisplayRoles: React.FC<DisplayRolesProps> = ({
  roles,
  page,
  totalPages,
  total,
  isFetching,
  onPageChange,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}) => {
  const columns: Column<Role>[] = [
    {
      header: 'ID',
      accessor: 'id',
      className: 'text-grey-800 font-semibold w-16',
    },
    {
      header: 'Role Name',
      accessor: 'name',
      className: 'text-grey-800 font-medium',
    },
    {
      header: 'Description',
      accessor: (row) => row.description || '—',
      className: 'text-grey-700',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            row.active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.active ? 'Active' : 'Inactive'}
        </span>
      ),
      className: 'text-center',
    },
    {
      header: 'Created By',
      accessor: 'createdBy',
      className: 'text-grey-600 text-sm',
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      cell: (value) =>
        new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      className: 'text-grey-600 text-sm',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={() => onEditClick(row)}
            classes="w-auto px-3"
          >
            Edit
          </Button>
          <Button
            variant="warning"
            size="small"
            onClick={() => onDeleteClick(row)}
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-grey-900">Roles</h1>
          <p className="text-sm text-grey-600 mt-1">
            Page {page + 1} of {totalPages} · Total {total}
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
        >
          Create Role
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={roles}
            rowKey="id"
            emptyMessage="No roles found."
            pagination={{
              currentPage: page,
              totalPages,
              onPageChange,
              isLoading: isFetching,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DisplayRoles;