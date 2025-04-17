import { Button, Form, Modal } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import { CSelect } from '@/components/form/CSelect';
import { useGet } from '@/hooks/useApi';
import { useModalManager } from '@/contexts/ModalContext';

export const BaseSetComponentModal = ({
  open,
  onClose,
  onSubmit,
  title,
  dataLoadApiControl,
  dataLoadParserFn,
  EditModalComponent,
  record,
  baseUrl,
  self,
  onExited
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const { showModal, updateModal } = useModalManager();
  const detailControl = useGet(`${baseUrl}/`, {
    useInitial: false,
    usePagination: false
  });
  const createEditAction = useMemo(
    () => ({
      fn: ({mode, record}) => {
        const actionsApi = self.config.getActionsApi();
        const editData = {};
        if(mode === "create") {} else if (mode === "edit") {
          editData.record = record;
        }
        const modal = showModal(
          EditModalComponent,
          {
            open: true,
            ...editData,
            onSubmit: (response) => {
              setSelectedRecord(response.record);
              setSelectedValue(dataLoadParserFn(response.record));
            }
            // onCancel: () => {
            //   setSelectedRecord(null);
            //   setSelectedValue(null);
            // }
          },
          {
            hideOnClose: true,
            destroyOnClose: true
          }
        );
      }
    }),
    [selectedRecord, showModal, selectedValue]
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedValue) {
      detailControl
        .fetchData(
          {},
          {
            url: `${baseUrl}/${selectedValue.value}/`
          }
        )
        .then((data) => {
          onSubmit({
            record: data
          });
        });
    }
  };
  useEffect(() => {
    if (record) {
      setSelectedRecord(record);
      setSelectedValue(dataLoadParserFn(record));
    }
  }, [record]);
  return (
    <Modal show={open} onHide={onClose} onExited={onExited} size="lg" centered animation>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label column={'sm'}>Select</Form.Label>
            <CSelect
              field={{ name: 'component' }}
              form={{ setFieldValue: (_, val) => setSelectedValue(val) }}
              value={selectedValue}
              dataLoadFn={dataLoadApiControl.fetchData}
              dataLoadParserFn={dataLoadParserFn}
              actions={{
                create_edit: createEditAction
              }}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
