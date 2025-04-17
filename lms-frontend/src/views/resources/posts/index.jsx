import MainCard from '@/components/Card/MainCard';
import { Col, Dropdown, Row } from 'react-bootstrap';
import { useCallback, useMemo } from 'react';
import DataTable from '@/components/table/DataTable';
import { useNavigate } from 'react-router-dom';
import { useGet, useMutation } from '@/hooks/useApi';
import BaseDeleteConfirmationModal from '@/components/form/base/BaseDeleteConfirmationModal';
import { toast } from 'react-toastify';
import { useModalManager } from '@/contexts/ModalContext';
import { ResourcesPostsCreateEditModal } from '@/views/resources/posts/edit-modals';

const baseUrl = '/lms/resources/posts';

export default function ResourcesPostPage() {
  const navigate = useNavigate();
  const { showModal } = useModalManager();
  const listControl = useGet(`${baseUrl}/`, {
    useInitial: false
  });
  const deleteControl = useMutation();
  const columns = useMemo(() => {
    return [
      {
        key: 'id',
        label: 'Id',
        sortable: true
      },
      {
        key: 'title',
        label: 'Title'
      },
      {
        key: 'author',
        label: 'Author',
        render: (row) => (row.author ? row.author.username : null)
      },
      {
        key: 'category',
        label: 'Category',
        render: (row) => (row.category ? row.category.title : null)
      },
      {
        key: 'publication_status',
        label: 'Published'
      },
      {
        key: 'created_at',
        label: 'Created',
        dataType: 'datetime',
        sortable: true
      },
      {
        key: 'updated_at',
        label: 'Updated',
        dataType: 'datetime',
        sortable: true
      }
    ];
  }, []);
  const handleFilterChange = useCallback(
    (filter) => {
      listControl.fetchData(filter);
    },
    [listControl.fetchData]
  );
  const handleCreate = useCallback(() => {
    showModal(
      ResourcesPostsCreateEditModal,
      {
        open: true,
        onSuccess: () => {
          listControl.fetchData();
        },
        onClose: () => {}
      },
      {
        destroyOnClose: true,
        hideOnClose: true
      }
    );
  }, [showModal, listControl.fetchData]);
  const handleEdit = useCallback(
    (row) => {
      showModal(
        ResourcesPostsCreateEditModal,
        {
          open: true,
          record: row,
          onSuccess: () => {
            listControl.fetchData();
          }
        },
        {
          destroyOnClose: true,
          hideOnClose: true
        }
      );
    },
    [listControl.fetchData]
  );
  const handleDelete = useCallback(
    (row) => {
      const modal = showModal(
        BaseDeleteConfirmationModal,
        {
          open: true,
          title: 'Delete Item',
          message: `Are you sure you want to delete "${row.title}"?`,
          loading: listControl.loading,
          onConfirm: async () => {
            try {
              await deleteControl.mutate(`${baseUrl}/${row.id}/`, 'DELETE');
              toast.success('Item deleted successfully!');
              await listControl.fetchData();
              modal.hide();
            } catch (err) {
              toast.error('Failed to delete item.');
            }
          }
        },
        {
          destroyOnClose: true,
          hideOnClose: true
        }
      );
    },
    [listControl.fetchData]
  );
  const handleEditContent = useCallback(
    (row) => {
      const url = `/resources/posts/${row.id}/edit-content?type=editor1`;
      navigate(url);
    },
    [navigate]
  );
  return (
    <Row>
      <Col sm={12}>
        <MainCard title="Pasts">
          <div className="align-items-center m-l-0 row">
            <div className="col-sm-6"></div>
            <div className="text-end col-sm-6">
              <button type="button" className="btn-sm btn-round mb-3 btn btn-success" onClick={handleCreate}>
                <i className="feather icon-plus"></i> Add
              </button>
            </div>
          </div>
          <DataTable
            columns={columns}
            control={listControl}
            onEdit={handleEdit}
            onDelete={handleDelete}
            extraActions={(row) => (
              <>
                <Dropdown.Item onClick={() => handleEditContent(row)}>Edit Content</Dropdown.Item>
              </>
            )}
            onFilterChange={handleFilterChange}
          />
        </MainCard>
      </Col>
    </Row>
  );
}
