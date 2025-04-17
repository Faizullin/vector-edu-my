import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, ListGroup, Row, Spinner } from 'react-bootstrap';
import MainCard from '@/components/Card/MainCard';
import BaseDeleteConfirmationModal from '@/components/form/base/BaseDeleteConfirmationModal';
import { useModalManager } from '@/contexts/ModalContext';
import { useGet, useMutation } from '@/hooks/useApi';
import { toast } from 'react-toastify';
import dragula from 'react-dragula';

import 'dragula/dist/dragula.css';

const baseUrl = '/lms/lessons/pages';

const getOrderSortedPages = (pages) => {
  return pages.sort((a, b) => a.order - b.order);
};

export default function LessonsLessonPagesPage() {
  const { lesson_id } = useParams();
  const navigate = useNavigate();
  const modalManager = useModalManager();
  const [pages, setPages] = useState([]);
  const listControl = useGet(`${baseUrl}/?lesson_id=${lesson_id}`, {
    useInitial: true,
    usePagination: false
  });
  const addControl = useMutation();
  const deleteControl = useMutation();
  const reorderControl = useMutation();
  const getEditorControl = useMutation();
  const handleCreate = useCallback(() => {
    addControl.mutate(`${baseUrl}/`, 'POST', { lesson: lesson_id }).then((response_data) => {
      setPages((pages) => getOrderSortedPages([...pages, response_data]));
    });
  }, []);
  const handleDelete = useCallback(
    (row) => {
      const modal = modalManager.showModal(
        BaseDeleteConfirmationModal,
        {
          open: true,
          title: 'Delete Item',
          message: `Are you sure you want to delete "Lesson #${row.id}"?`,
          loading: deleteControl.loading,
          onConfirm: async ({ modalManager }) => {
            try {
              await deleteControl.mutate(`${baseUrl}/${row.id}/`, 'DELETE');
              toast.success('Item deleted successfully!');
              await listControl.fetchData();
              modalManager.hideModal(modal.id);
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
    [listControl.fetchData, deleteControl.mutate, modalManager]
  );
  const listRef = useRef(null);
  useEffect(() => {
    if (listControl.data) {
      setPages(getOrderSortedPages(listControl.data));
    }
  }, [listControl.data]);
  useEffect(() => {
    if (listRef.current) {
      const drake = dragula([listRef.current], {
        // Optionally specify a mirror container for a custom drag preview
        // mirrorContainer: listRef.current,
        // Add more Dragula options if needed
      });

      // On drop, reorder 'pages' based on the new DOM order
      drake.on('drop', (el, target, source, _) => {
        // Collect DOM elements
        const items = Array.from(target.children);
        // Map back to data array
        const newOrder = items.map((child) => {
          const id = child.getAttribute('data-id');
          return pages.find((p) => String(p.id) === id);
        });
        setPages(newOrder);
      });

      return () => {
        // Clean up
        drake.destroy();
      };
    }
  }, [pages, lesson_id]);
  const handleOpenEditor = useCallback(
    (row) => {
      getEditorControl.mutate(`${baseUrl}/${row.id}/get-editor/`, 'POST').then((response) => {
        navigate(`/resources/posts/${response.post.id}/edit-content?type=editor1`);
      });
    },
    [lesson_id, navigate]
  );
  const handleSaveReorder = useCallback(() => {
    reorderControl
      .mutate(`${baseUrl}/reorder/`, 'POST', {
        ordered_ids: pages.map((p) => p.id),
        lesson_id
      })
      .then((response_data) => {
        setPages(getOrderSortedPages(response_data));
        toast.success('Pages reordered successfully!');
      });
  }, [pages, lesson_id, reorderControl.mutate]);
  return (
    <Row>
      <Col sm={12}>
        <MainCard title="Lesson Pages">
          <div className="align-items-center m-l-0 row">
            <div className="col-sm-6"></div>
            <div className="text-end col-sm-6">
              <Button variant="info" size="sm" onClick={handleSaveReorder} disabled={reorderControl.loading} className={'me-2'}>
                <i className="feather icon-save" /> Save Order
              </Button>
              <Button variant="success" size="sm" onClick={handleCreate} disabled={addControl.loading}>
                <i className="feather icon-plus" /> Add Page
              </Button>
            </div>
          </div>

          {listControl.loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : pages.length === 0 ? (
            <div className="text-muted">No pages available.</div>
          ) : (
            <ListGroup ref={listRef}>
              {pages.map((page, _) => (
                <ListGroup.Item
                  key={page.id}
                  data-id={page.id}
                  className="d-flex justify-content-between align-items-center"
                  style={{ cursor: 'move' }}
                >
                  <div>
                    <strong>#{page.id}</strong> - {page.title}
                  </div>
                  <div>
                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenEditor(page)}>
                      Open Editor
                    </Button>
                  </div>
                  <div>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(page)}>
                      Delete
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </MainCard>
      </Col>
    </Row>
  );
}
