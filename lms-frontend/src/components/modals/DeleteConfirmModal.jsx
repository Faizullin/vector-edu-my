import { memo, useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';

export const DeleteConfirmModal = memo(({ show, handleClose, passData, props }) => {
  const handleConfirm = useCallback(() => {
    if(props.onConfirm) {
      props.onConfirm(passData.record);
    }
  }, [props]);
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this item?</p>
        {passData?.description && <p className="text-muted">{passData.description}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
