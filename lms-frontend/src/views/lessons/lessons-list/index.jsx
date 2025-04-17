import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo } from 'react';
import { Col, Dropdown, Row } from 'react-bootstrap';
import MainCard from '@/components/Card/MainCard';
import DataTable from '@/components/table/DataTable';
import { useGet, useMutation } from '@/hooks/useApi';
import { useModalManager } from '@/contexts/ModalContext';
import { LessonCreateEditModal } from './edit-modals';
import BaseDeleteConfirmationModal from '@/components/form/base/BaseDeleteConfirmationModal';
import { toast } from 'react-toastify';

const baseUrl = '/lms/lessons/lessons';

export default function LessonsLessonListPage() {
  const [searchParams, _] = useSearchParams();
  const navigate = useNavigate();
  const { showModal } = useModalManager();
  useEffect(() => {
    if (!searchParams.get('batch_id')) {
      navigate(`/lessons/batches`);
    }
  }, [searchParams]);
  const listUrl = useMemo(() => `${baseUrl}/?batch_id=${searchParams.get('batch_id')}`, [searchParams]);
  const batchDetailControl = useGet(`/lms/lessons/batches/${searchParams.get('batch_id')}/`, {
    useInitial: true,
    usePagination: false
  });
  const listControl = useGet(listUrl, {
    useInitial: false,
    usePagination: true
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
        key: 'is_available_on_free',
        label: 'Is available on free',
        render: (row) => (row.is_available_on_free ? 'true' : 'false')
      },
      {
        key: 'title',
        label: 'Title'
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
      LessonCreateEditModal,
      {
        open: true,
        record: {
          lesson_batch: batchDetailControl.data
        },
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
  }, [showModal, batchDetailControl.data, listControl.fetchData]);
  const handleEdit = useCallback(
    (row) => {
      showModal(
        LessonCreateEditModal,
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
    [listControl.fetchData, deleteControl.mutate]
  );
  const handlePagesView = useCallback(
    (row) => {
      const url = `/lessons/${row.id}/pages/edit-view`;
      navigate(url);
    },
    [navigate]
  );
  return (
    <Row>
      <Col sm={12}>
        <MainCard title="Lessons">
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
                <Dropdown.Item onClick={() => handlePagesView(row)}>Pages View</Dropdown.Item>
              </>
            )}
            onFilterChange={handleFilterChange}
          />
        </MainCard>
      </Col>
    </Row>
  );
}
