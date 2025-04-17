import React, { useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import * as Yup from 'yup';
import dragula from 'react-dragula';
import { BaseEditModal } from './base/baseEditModal';
import { BaseSetComponentModal } from './base/baseSetComponentModal';
import { BaseComponentTool } from './base/baseComponentTool';
import { useGet } from '@/hooks/useApi';

const baseUrl = '/lms/resources/component/order';

const itemParser = (option) => ({
  value: option.id,
  label: option.title
});

const PutInOrderFormBody = ({ formik, loading }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const drake = dragula([containerRef.current], {
        moves: (el, source, handle) => handle.classList.contains('drag-handle')
      });

      drake.on('drop', () => {
        const nodes = Array.from(containerRef.current.children);
        const newElements = nodes.map((node) => {
          const index = parseInt(node.getAttribute('data-index'));
          return formik.values.elements[index];
        });

        const updated = newElements.map((item, i) => ({ ...item, order: i + 1 }));
        formik.setFieldValue('elements', updated);
      });

      return () => drake.destroy();
    }
  }, [formik.values.elements]);

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label column={'sm'}>Title</Form.Label>
        <Form.Control
          type="text"
          {...formik.getFieldProps('title')}
          isInvalid={!!formik.errors.title && formik.touched.title}
          disabled={loading}
        />
        <Form.Control.Feedback type="invalid">{formik.errors.title}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label column={'sm'}>Items (Put in Order)</Form.Label>
        <div ref={containerRef}>
          {formik.values.elements.map((item, index) => (
            <div key={index} data-index={index} className="border p-2 mb-2 bg-light rounded d-flex align-items-center">
              <i className="fa fa-bars drag-handle me-2" style={{ cursor: 'grab' }} />
              <Form.Control
                type="text"
                placeholder="Text"
                {...formik.getFieldProps(`elements[${index}].text`)}
                isInvalid={!!formik.errors.elements?.[index]?.text && formik.touched.elements?.[index]?.text}
                disabled={loading}
              />
              <button
                className="btn btn-sm btn-danger ms-2"
                type="button"
                onClick={() => {
                  const newElements = [...formik.values.elements];
                  newElements.splice(index, 1);
                  formik.setFieldValue('elements', newElements);
                }}
                disabled={loading}
              >
                <i className="fa fa-minus" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm mt-2"
          onClick={() =>
            formik.setFieldValue('elements', [
              ...formik.values.elements,
              {
                text: '',
                order: formik.values.elements.length + 1
              }
            ])
          }
          disabled={loading}
        >
          <i className="fa fa-plus" />
        </button>
      </Form.Group>

      <style>
        {`
          .gu-mirror {
            background-color: #f8f9fa;
            border: 1px dashed #aaa;
            padding: 10px;
            opacity: 0.9;
            border-radius: 5px;
            cursor: grabbing !important;
          }
        `}
      </style>
    </>
  );
};

const PutInOrderEditModal = (props) => (
  <BaseEditModal
    {...props}
    title={(record) => (record ? `Edit Put In Order Component [#${record.id}]` : 'Create Put In Order Component')}
    url={baseUrl}
    initialValues={{ title: '', elements: [] }}
    validationSchema={Yup.object({
      title: Yup.string().required(),
      elements: Yup.array().of(
        Yup.object().shape({
          text: Yup.string().required(),
          order: Yup.number().required().min(1)
        })
      )
    })}
    FormBody={PutInOrderFormBody}
    parseDataFn={(data) => ({
      title: data.title,
      elements: data.elements.map((el) => ({
        text: el.text,
        order: el.order
      }))
    })}
  />
);

const PutInOrderSetModal = (props) => {
  const api = useGet(`${baseUrl}/`, {
    usePagination: false,
    useInitial: false
  });
  return (
    <BaseSetComponentModal
      {...props}
      title="Select Put In Order Component"
      baseUrl={baseUrl}
      dataLoadApiControl={api}
      dataLoadParserFn={itemParser}
      EditModalComponent={PutInOrderEditModal}
    />
  );
};

export class PutInOrderComponentTool extends BaseComponentTool {
  static title = 'Put In Order';
  static name = 'put-in-order';

  getEditModalComponent() {
    return PutInOrderEditModal;
  }

  getSetModalComponent() {
    return PutInOrderSetModal;
  }

  getRenderDataText() {
    return this.data.obj?.title || this.data.text;
  }
}
