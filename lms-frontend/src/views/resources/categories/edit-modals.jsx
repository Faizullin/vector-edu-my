import { useEffect, useState } from 'react';
import { Button, Col, FloatingLabel, Form as RBForm, Modal, Row, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useMutation } from '@/hooks/useApi';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';

const baseUrl = '/lms/resources/categories/';

export const ResourcesCategoriesCreateEditModal = ({ open, onClose, record, onSuccess }) => {
  const saveControl = useMutation();
  const [localRecord, setLocalRecord] = useState(record || {});

  const isEditMode = Boolean(localRecord.id);

  const initialValues = {
    title: localRecord.title || '',
    term: localRecord.term || record?.term || '',
    description: localRecord.description || ''
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    term: Yup.string().required('Term is required'),
    description: Yup.string().nullable()
  });

  const handleSubmit = async (values, actions) => {
    try {
      if (!isEditMode) {
        const newRecordData = await saveControl.mutate(`${baseUrl}/`, 'POST', values);
        setLocalRecord(newRecordData);
        toast.success('Category created! Switching to update mode...');
        onSuccess?.(newRecordData);
      } else {
        const newRecordData = await saveControl.mutate(`${baseUrl}/${localRecord.id}/`, 'PUT', values);
        setLocalRecord(newRecordData);
        toast.success('Category updated!');
        onSuccess?.(newRecordData);
      }
    } catch (err) {
      if (err?.response?.status === 400 && err.response?.data) {
        const serverErrors = err.response.data;
        if (serverErrors.non_field_errors) {
          toast.error(serverErrors.non_field_errors.join(', '));
        }
        if (serverErrors.message) {
          Object.entries(serverErrors.message).forEach(([field, messages]) => {
            actions.setFieldError(field, messages);
          });
        }
      } else {
        toast.error(err?.message || 'Something went wrong.');
      }
    } finally {
      actions.setSubmitting(false);
    }
  };

  useEffect(() => {
    setLocalRecord(record || {});
  }, [record]);

  return (
    <Modal show={open} onHide={onClose} size="lg" centered>
      <Formik enableReinitialize initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ handleSubmit, touched, errors, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>{isEditMode ? 'Edit Category' : 'Create Category'}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Row className="g-3">
                <Col md={12}>
                  <FloatingLabel label="Title">
                    <Field
                      name="title"
                      as={RBForm.Control}
                      type="text"
                      isInvalid={touched.title && !!errors.title}
                      placeholder="Enter category title"
                    />
                    <ErrorMessage name="title" component={RBForm.Control.Feedback} type="invalid" />
                  </FloatingLabel>
                </Col>

                <Col md={12}>
                  <FloatingLabel label="Term">
                    <Field
                      name="term"
                      as={RBForm.Control}
                      type="text"
                      isInvalid={touched.term && !!errors.term}
                      placeholder="Enter category term"
                    />
                    <ErrorMessage name="term" component={RBForm.Control.Feedback} type="invalid" />
                  </FloatingLabel>
                </Col>

                <Col md={12}>
                  <FloatingLabel label="Description">
                    <Field
                      name="description"
                      as="textarea"
                      className={`form-control ${touched.description && errors.description ? 'is-invalid' : ''}`}
                      placeholder="Category description"
                      rows={4}
                      style={{ minHeight: '120px' }}
                    />
                    <ErrorMessage name="description" component={RBForm.Control.Feedback} type="invalid" />
                  </FloatingLabel>
                </Col>

                {saveControl.error && <p className="text-danger mt-2">{saveControl.error.message || 'Submission failed.'}</p>}
              </Row>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting || saveControl.loading}>
                {isSubmitting || saveControl.loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
