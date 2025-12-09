'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { deleteProduct } from '@/apis/productAPI';
import { toastError, toastSuccess } from '@/utils/toast';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number | null;
  productName?: string;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
}) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      toastSuccess('Product deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to delete product');
    },
  });

  const handleConfirmDelete = () => {
    if (!productId) {
      toastError('Product ID is missing');
      return;
    }
    deleteMutation.mutate(productId);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      handleClose={onClose}
      title="Delete Product"
      noFooter
    >
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-grey-900">
            Are you sure you want to delete this product?
          </h3>
          {productName && (
            <p className="text-sm text-grey-600">
              Product: <span className="font-semibold text-grey-800">{productName}</span>
            </p>
          )}
          <p className="text-sm text-red-600">
            This action cannot be undone. All product data will be permanently removed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outlined"
            size="small"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            classes="w-auto px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="warning"
            size="small"
            onClick={handleConfirmDelete}
            isLoading={deleteMutation.isPending}
            disabled={deleteMutation.isPending}
            classes="w-auto px-4"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProductModal;