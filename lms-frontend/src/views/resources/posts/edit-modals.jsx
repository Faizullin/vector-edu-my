import { Button, Col, FloatingLabel, Form as RBForm, Modal, Row, Spinner } from 'react-bootstrap';
import { ErrorMessage, Field, Form, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { CSelect } from '@/components/form/CSelect';
import { useFormManager } from '@/hooks/useFormManager';
import { useGet } from '@/hooks/useApi';
import { ResourcesCategoriesCreateEditModal } from '@/views/resources/categories/edit-modals';
import { useModalManager } from '@/contexts/ModalContext';
import { useEffect } from 'react';

const baseUrl = '/lms/resources/posts';

const categoryDataParser = (row) => ({
  value: row.id,
  label: row.title
});

export function ResourcesPostsCreateEditModal({ open, onClose, record, onSuccess }) {
  const categoryFiltersControl = useGet(`/lms/resources/categories/`, {
    useInitial: false,
    usePagination: false
  });
  const { showModal } = useModalManager();
  const formManager = useFormManager({
    getUrl: (record) => (record ? `${baseUrl}/${record.id}/` : `${baseUrl}/`),
    schema: Yup.object().shape({
      title: Yup.string().required('Title is required'),
      category: Yup.object().nullable(),
      publication_status: Yup.number().oneOf([0, 1], 'Invalid status').required()
    }),
    parseResponse: (response) => response,
    parseFormData: (values) => ({
      ...values,
      category: values.category?.value || null
    }),
    initialValues: {
      title: '',
      category: null,
      publication_status: 0
    },
    onSubmit: (response) => {
      if (response.status === 'success') {
        onSuccess?.(response);
      }
    }
  });

  const { handleSubmit, touched, errors, isSubmitting, values, setValues, setFieldValue } = formManager.formik;

  useEffect(() => {
    if (record) {
      formManager.setRecord(record);
      setValues({
        title: record.title,
        publication_status: record.publication_status,
        category: record.category ? categoryDataParser(record.category) : null
      });
    }
  }, [record]);

  return (
    <Modal show={open} onHide={onClose} size="lg" centered>
      <FormikProvider value={formManager.formik}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{formManager.record?.id ? 'Edit Post' : 'Create Post'}</Modal.Title>
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
                    placeholder="Enter post title"
                  />
                  <ErrorMessage name="title" component={RBForm.Control.Feedback} type="invalid" />
                </FloatingLabel>
              </Col>

              <Col md={12}>
                <label className="form-label">Category</label>
                <Field
                  name="category"
                  component={CSelect}
                  value={values.category}
                  dataLoadFn={categoryFiltersControl.fetchData}
                  dataLoadParserFn={categoryDataParser}
                  actions={{
                    create_edit: {
                      fn: ({ mode, record }) => {
                        let modalData = null;
                        const passData = {
                          open: true,
                          onSuccess: (response_data) => {
                            setFieldValue('category', categoryDataParser(response_data));
                          }
                        };
                        if (mode === 'edit') {
                          if (!record) {
                            throw new Error(`localRecord.category is empty`);
                          }
                          passData.record = record;
                        } else if (mode === 'create') {
                          passData.record = {
                            term: `posts`
                          };
                        } else {
                          throw new Error(`mode must be edit or create`);
                        }
                        modalData = showModal(ResourcesCategoriesCreateEditModal, passData, {
                          destroyOnClose: true,
                          hideOnClose: true
                        });
                      }
                    }
                  }}
                />
                {touched.category && errors.category && (
                  <RBForm.Control.Feedback type="invalid" className="d-block">
                    {errors.category}
                  </RBForm.Control.Feedback>
                )}
              </Col>

              <Col md={12}>
                <label className="form-label">Publication Status</label>
                <Field as={RBForm.Select} name="publication_status" className="form-control">
                  <option value={0}>Draft</option>
                  <option value={1}>Published</option>
                </Field>
                <ErrorMessage name="publication_status" component={RBForm.Control.Feedback} type="invalid" />
              </Col>

              {formManager.saveControl.error && (
                <p className="text-danger mt-2">{formManager.saveControl.error.message || 'Submission failed.'}</p>
              )}
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting || formManager.saveControl.loading}>
              {isSubmitting || formManager.saveControl.loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : formManager.record?.id ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </FormikProvider>
    </Modal>
  );
}
