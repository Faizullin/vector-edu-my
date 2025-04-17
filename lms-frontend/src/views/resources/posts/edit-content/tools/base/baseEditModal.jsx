import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { FormikProvider } from 'formik';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormManager } from '@/hooks/useFormManager';

export const BaseEditModal = ({
  title = (record) => (record ? `Edit Component` : `Create Component`),
  open,
  onClose,
  onAfterClose,
  onSubmit,
  url,
  initialValues,
  validationSchema,
  record,
  FormBody,
  parseDataFn = (data) => data,
  apiClientPrepareData = (data) => data,
  onExited
}) => {
  const getUrl = (record) => (record ? `${url}/${record?.id}/` : `${url}/`);
  const formManager = useFormManager({
    getUrl,
    schema: validationSchema,
    parseResponse: (response) => response,
    parseFormData: apiClientPrepareData,
    initialValues,
    onSubmit: (response) => {
      if (response.status === 'success') {
        onSubmit({ record: response.payload });
      }
    }
  });
  const isEditMode = useMemo(() => Boolean(formManager.record), [formManager.record]);
  useEffect(() => {
    if (record) {
      formManager.getControl
        .fetchData(
          {},
          {
            url: getUrl(record)
          }
        )
        .then((payload) => {
          formManager.setRecord(payload);
          const parsed = parseDataFn(payload);
          formManager.formik.setValues(parsed);
        });
    }
  }, [record]);
  const handleClose = useCallback(() => {
    formManager.formik.resetForm();
    onClose?.();
    onAfterClose?.();
  }, [onClose, onAfterClose]);
  const loading = useMemo(() => formManager.saveControl.loading, [formManager.saveControl.loading]);
  const displayTitle = useMemo(() => {
    if (typeof title == 'function') {
      return title(formManager.record);
    } else if (typeof title == 'string') {
      return title;
    } else {
      return 'Edit Component';
    }
  }, [title, formManager.record]);
  return (
    <Modal show={open} onHide={handleClose} onExited={onExited} size="lg" centered animation>
      <FormikProvider value={formManager.formik}>
        <Form onSubmit={formManager.formik.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{displayTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formManager.formik.errors['non_field_errors'] && (
              <Alert variant="danger">{formManager.formik.errors['non_field_errors']}</Alert>
            )}
            {formManager.formik.errors['detail'] && <Alert variant="danger">{formManager.formik.errors['detail']}</Alert>}
            <FormBody formik={formManager.formik} loading={loading} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : isEditMode ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </FormikProvider>
    </Modal>
  );
};
