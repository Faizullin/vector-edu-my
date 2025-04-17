import { Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { BaseEditModal } from './base/baseEditModal';
import { BaseSetComponentModal } from './base/baseSetComponentModal';
import { BaseComponentTool } from './base/baseComponentTool';
import React, { useEffect, useRef } from 'react';
import dragula from 'react-dragula';
import { useGet } from '@/hooks/useApi';
import 'dragula/dist/dragula.css';

const baseUrl = '/lms/resources/component/fill-text';

const itemParser = (option) => ({
  value: option.id,
  label: option.title
});

const FillTextFormBody = ({ formik, loading }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const drake = dragula([containerRef.current], {
        moves: (el, source, handle) => handle.classList.contains('drag-handle')
      });

      drake.on('drop', (el, target, source, sibling) => {
        const nodes = Array.from(containerRef.current.children);
        const newLines = nodes.map((node) => {
          const index = parseInt(node.getAttribute('data-index'));
          return formik.values.lines[index];
        });

        const updated = newLines.map((item, i) => ({ ...item, order: i + 1 }));
        formik.setFieldValue('lines', updated);
      });

      return () => drake.destroy();
    }
  }, [formik.values.lines]);

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label column="sm">Title</Form.Label>
        <Form.Control
          type="text"
          {...formik.getFieldProps('title')}
          isInvalid={!!formik.errors.title && formik.touched.title}
          disabled={loading}
        />
        <Form.Control.Feedback type="invalid">{formik.errors.title}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label="Put Words into the Answer"
          {...formik.getFieldProps('put_words')}
          checked={formik.values.put_words}
          disabled={loading}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label column="sm">Lines</Form.Label>

        <div ref={containerRef}>
          {formik.values.lines.map((line, index) => (
            <div key={index} data-index={index} className="border p-3 mb-3 rounded bg-light">
              <div className="row g-2 align-items-start">
                {/* Drag Icon */}
                <div className="col-auto d-flex align-items-center">
                  <i className="fa fa-bars fs-5 drag-handle" style={{ cursor: 'grab' }} />
                </div>

                {/* Remove Button */}
                <div className="col-auto">
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={() => {
                      const newLines = [...formik.values.lines];
                      newLines.splice(index, 1);
                      formik.setFieldValue('lines', newLines);
                    }}
                    disabled={loading}
                  >
                    <i className="fa fa-minus" />
                  </button>
                </div>

                {/* Text Before */}
                <div className="col-md">
                  <Form.Control
                    type="text"
                    placeholder="Text Before"
                    {...formik.getFieldProps(`lines[${index}].text_before`)}
                    isInvalid={!!formik.errors.lines?.[index]?.text_before && formik.touched.lines?.[index]?.text_before}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">{formik.errors.lines?.[index]?.text_before}</Form.Control.Feedback>
                </div>

                {/* Answer */}
                <div className="col-md-2">
                  <Form.Control
                    type="text"
                    placeholder="Answer"
                    {...formik.getFieldProps(`lines[${index}].answer`)}
                    isInvalid={!!formik.errors.lines?.[index]?.answer && formik.touched.lines?.[index]?.answer}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">{formik.errors.lines?.[index]?.answer}</Form.Control.Feedback>
                </div>

                {/* Text After */}
                <div className="col-md">
                  <Form.Control
                    type="text"
                    placeholder="Text After"
                    {...formik.getFieldProps(`lines[${index}].text_after`)}
                    isInvalid={!!formik.errors.lines?.[index]?.text_after && formik.touched.lines?.[index]?.text_after}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">{formik.errors.lines?.[index]?.text_after}</Form.Control.Feedback>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <button
            type="button"
            className="btn btn-secondary btn-sm mt-2"
            onClick={() =>
              formik.setFieldValue('lines', [
                ...formik.values.lines,
                {
                  text_before: '',
                  answer: '',
                  text_after: '',
                  order: formik.values.lines.length + 1
                }
              ])
            }
            disabled={loading}
          >
            <i className="fa fa-plus" />
          </button>
        </div>
      </Form.Group>
    </>
  );
};

export const FillTextEditModal = (props) => (
  <BaseEditModal
    {...props}
    url={baseUrl}
    initialValues={{ title: '', put_words: false, lines: [] }}
    validationSchema={Yup.object({
      title: Yup.string().required(),
      put_words: Yup.boolean().required(),
      lines: Yup.array().of(
        Yup.object().shape({
          text_before: Yup.string().required(),
          answer: Yup.string().required(),
          text_after: Yup.string().required(),
          order: Yup.number().required().min(0)
        })
      )
    })}
    FormBody={FillTextFormBody}
    parseDataFn={(data) => ({
      title: data.title,
      put_words: data.put_words,
      lines: data.lines.map((line) => ({
        text_before: line.text_before,
        answer: line.answer,
        text_after: line.text_after,
        order: line.order
      }))
    })}
  />
);

export const FillTextSetModal = (props) => {
  const api = useGet(`${baseUrl}/`, {
    usePagination: false,
    useInitial: false
  });
  return (
    <BaseSetComponentModal
      {...props}
      title="Select Fill Text Component"
      baseUrl={baseUrl}
      dataLoadApiControl={api}
      dataLoadParserFn={itemParser}
      EditModalComponent={FillTextEditModal}
    />
  );
};

export class FillTextComponentTool extends BaseComponentTool {
  static title = 'Fill Text';
  static name = 'fill-text';

  getEditModalComponent() {
    return FillTextEditModal;
  }

  getSetModalComponent() {
    return FillTextSetModal;
  }

  getRenderDataText() {
    return this.data.obj?.title || this.data.text;
  }
}
