'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Loading from '@/components/common/Loading';
import DisplayRoles from '@/components/pages/roles/DisplayRoles';
import CreateRoleModal from '@/components/pages/roles/CreateRoleModal';
import UpdateRoleModal from '@/components/pages/roles/UpdateRoleModal';
import DeleteRoleModal from '@/components/pages/roles/DeleteRoleModal';
import { getRoles, Role } from '@/apis/roleAPI';

const RolesPage = () => {
  const [page, setPage] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const size = 10;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['roles', page, size] as const,
    queryFn: () => getRoles({ page, size }),
    placeholderData: keepPreviousData,
  });

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedRole(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
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
              Failed to load roles
            </h3>
            <p className="text-sm text-grey-600">Please try refreshing the page</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const roles = data?.data?.result ?? [];
  const meta = data?.data?.meta;
  const totalPages = meta?.pages ?? 1;
  const total = meta?.total ?? 0;

  return (
    <DashboardLayout>
      <DisplayRoles
        roles={roles}
        page={page}
        totalPages={totalPages}
        total={total}
        isFetching={isFetching}
        onPageChange={setPage}
        onCreateClick={handleCreate}
        onEditClick={handleEdit}
        onDeleteClick={handleDelete}
      />

      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <UpdateRoleModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        role={selectedRole}
      />

      <DeleteRoleModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        role={selectedRole}
      />
    </DashboardLayout>
  );
};

export default RolesPage;