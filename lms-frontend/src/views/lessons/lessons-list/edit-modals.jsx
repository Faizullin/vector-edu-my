import { useEffect, useState } from 'react';
import { Button, Col, FloatingLabel, Form as RBForm, Modal, Row, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useMutation } from '@/hooks/useApi';
import { CSelect } from '@/components/form/CSelect';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';

const baseUrl = '/lms/lessons/lessons';

export function LessonCreateEditModal({ open, onClose, record, onSuccess }) {
  const saveControl = useMutation();
  const [localRecord, setLocalRecord] = useState(record || {});

  const isEditMode = Boolean(localRecord.id);

  const lessonBatchOption = localRecord.lesson_batch
    ? {
        value: localRecord.lesson_batch.id,
        label: localRecord.lesson_batch.title
      }
    : null;

  const initialValues = {
    title: localRecord.title || '',
    description: localRecord.description || '',
    is_available_on_free: localRecord.is_available_on_free || false,
    lesson_batch: lessonBatchOption
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    is_available_on_free: Yup.boolean(),
    lesson_batch: Yup.object().nullable()
  });

  const handleSubmit = async (values, actions) => {
    try {
      const payload = {
        ...values,
        lesson_batch: values.lesson_batch?.value || null
      };

      if (!isEditMode) {
        const createdData = await saveControl.mutate(`${baseUrl}/`, 'POST', payload);
        setLocalRecord(createdData);
        toast.success('Lesson created! Switching to update mode...');
        onSuccess?.();
      } else {
        await saveControl.mutate(`${baseUrl}/${localRecord.id}/`, 'PUT', payload);
        toast.success('Lesson updated!');
        onSuccess?.();
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
  const batchLocalOptions = lessonBatchOption ? [lessonBatchOption] : [];

  useEffect(() => {
    setLocalRecord(record || {});
  }, [record]);

  return (
    <Modal show={open} onHide={onClose} size="lg" centered>
      <Formik enableReinitialize initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ handleSubmit, touched, errors, setFieldValue, isSubmitting, values }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>{isEditMode ? 'Edit Lesson' : 'Create Lesson'}</Modal.Title>
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
                      placeholder="Enter lesson title"
                    />
                    <ErrorMessage name="title" component={RBForm.Control.Feedback} type="invalid" />
                  </FloatingLabel>
                </Col>

                <Col md={12}>
                  <FloatingLabel label="Description">
                    <Field
                      name="description"
                      as="textarea"
                      className={`form-control ${touched.description && errors.description ? 'is-invalid' : ''}`}
                      placeholder="Lesson description"
                      rows={4}
                      style={{ minHeight: '120px' }}
                    />
                    <ErrorMessage name="description" component={RBForm.Control.Feedback} type="invalid" />
                  </FloatingLabel>
                </Col>

                <Col md={12}>
                  <RBForm.Check
                    type="switch"
                    id="isAvailableOnFree"
                    label="Available on Free"
                    checked={values.is_available_on_free}
                    onChange={(e) => setFieldValue('is_available_on_free', e.target.checked)}
                  />
                </Col>

                <Col md={12}>
                  <label className="form-label">Lesson Batch</label>
                  <Field name="lesson_batch" component={CSelect} localOptions={batchLocalOptions} value={values.lesson_batch} />
                  {touched.lesson_batch && errors.lesson_batch && (
                    <RBForm.Control.Feedback type="invalid" className="d-block">
                      {errors.lesson_batch}
                    </RBForm.Control.Feedback>
                  )}
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
}
