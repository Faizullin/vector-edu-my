// components/BaseEditModal.tsx
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import { useEffect, useMemo } from 'react';
import useApiForm from '../../../hooks/useFormManager';

export const BaseEditModal = ({
  title,
  open,
  onClose,
  onSubmit,
  url,
  method = 'post',
  initialValues,
  validationSchema,
  record,
  FormBody,
  parseDataFn = (data) => data,
  apiClientPrepareData = (data) => data
}) => {
  const isEdit = useMemo(() => Boolean(record), [record]);

  const { formik, loading, errors } = useApiForm({
    initialValues,
    validationSchema,
    url: isEdit ? `${url}${record?.id}/` : url,
    method: isEdit ? 'patch' : method,
    onSuccess: (response) => {
      onSubmit({ record: response.data });
    },
    prepareData: apiClientPrepareData
  });

  useEffect(() => {
    if (record) {
      const parsed = parseDataFn(record);
      formik.setValues(parsed);
    }
  }, [record]);

  return (
    <Modal show={open} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? `Edit ${title}` : `Create ${title}`}</Modal.Title>
      </Modal.Header>
      <Formik {...formik}>
        <Form onSubmit={formik.handleSubmit}>
          <Modal.Body>
            {errors?.non_field_errors && <Alert variant="danger">{errors.non_field_errors}</Alert>}
            {errors?.detail && <Alert variant="danger">{errors.detail}</Alert>}
            <FormBody formik={formik} loading={loading} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : isEdit ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Formik>
    </Modal>
  );
};
