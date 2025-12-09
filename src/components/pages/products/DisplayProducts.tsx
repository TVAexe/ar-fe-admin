'use client';

import Image from 'next/image';
import Button from '@/components/common/Button';
import Table, { Column } from '@/components/common/Table';
import { ProductItem } from '@/apis/productAPI';

interface DisplayProductsProps {
  products: ProductItem[];
  page: number;
  totalPages: number;
  total: number;
  isFetching: boolean;
  onPageChange: (newPage: number) => void;
  onCreateClick: () => void;
  onEditClick: (productId: number) => void;
  onDeleteClick: (productId: number, productName: string) => void;
}


const DisplayProducts: React.FC<DisplayProductsProps> = ({
  products,
  page,
  totalPages,
  total,
  isFetching,
  onPageChange,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}) => {
  const columns: Column<ProductItem>[] = [
    {
      header: 'ID',
      accessor: 'id',
      className: 'text-grey-800',
    },
    {
      header: 'Image',
      accessor: (row) => (
        <div className="flex gap-2">
          {row.imageUrl.slice(0, 2).map((url, index) => {
            // Check if URL is valid (starts with http:// or https://)
            const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://'));
            
            if (!isValidUrl) {
              return (
                <div key={index} className="relative w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-400">No img</span>
                </div>
              );
            }
            
            return (
              <div key={index} className="relative w-12 h-12">
                <Image
                  src={url}
                  alt={row.name}
                  fill
                  className="object-cover rounded"
                  sizes="48px"
                />
              </div>
            );
          })}
        </div>
      ),
      className: 'text-grey-800',
    },
    {
      header: 'Name',
      accessor: 'name',
      className: 'text-grey-800',
    },
    {
      header: 'Category',
      accessor: (row) => row.category.name,
      className: 'text-grey-700',
    },
    {
      header: 'Price',
      accessor: (row) => (
        <div>
          <div className="text-grey-800 font-semibold">
            ${(row.oldPrice * (1 - row.saleRate / 100)).toFixed(2)}
          </div>
          {row.saleRate > 0 && (
            <div className="text-xs text-grey-500 line-through">
              ${row.oldPrice.toFixed(2)}
            </div>
          )}
        </div>
      ),
      className: 'text-grey-700',
    },
    {
      header: 'Sale Rate',
      accessor: (row) => (
        <span className={row.saleRate > 0 ? 'text-red-600 font-semibold' : 'text-grey-600'}>
          {row.saleRate > 0 ? `-${row.saleRate}%` : '—'}
        </span>
      ),
      className: 'text-center',
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      className: 'text-grey-700 text-center',
    },
    {
      header: 'Created By',
      accessor: 'createdBy',
      className: 'text-grey-600 text-sm',
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      cell: (value) => new Date(value).toLocaleDateString(),
      className: 'text-grey-600 text-sm',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={() => onEditClick(row.id)}
            classes="w-auto px-3"
          >
            Edit
          </Button>
          <Button
            variant="warning"
            size="small"
            onClick={() => onDeleteClick(row.id, row.name)}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="text-sm text-grey-600">
            Page {page + 1} of {totalPages} · Total {total}
          </div>
        </div>
        <Button
          variant="contained"
          size="small"
          onClick={onCreateClick}
          classes="w-auto"
        >
          Create Product
        </Button>
      </div>

      <Table
        columns={columns}
        data={products}
        rowKey="id"
        emptyMessage="No products found."
        pagination={{
          currentPage: page,
          totalPages,
          onPageChange,
          isLoading: isFetching,
        }}
      />
    </div>
  );
};

export default DisplayProducts;