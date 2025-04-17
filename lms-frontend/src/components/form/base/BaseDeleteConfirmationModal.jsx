import React, { useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useModalManager } from '@/contexts/ModalContext';

function BaseDeleteConfirmationModal({
  open,
  onClose,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item?',
  onConfirm,
  loading
}) {
  const modalManager = useModalManager();
  const handleConfirm = useCallback(() => {
    onConfirm({
      modalManager
    });
  }, [modalManager]);

  return (
    <Modal show={open} onHide={onClose} animation>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default BaseDeleteConfirmationModal;
