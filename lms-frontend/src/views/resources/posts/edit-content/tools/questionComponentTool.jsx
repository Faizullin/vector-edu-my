import { Button, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { BaseEditModal } from './base/baseEditModal';
import { BaseSetComponentModal } from './base/baseSetComponentModal';
import { BaseComponentTool } from './base/baseComponentTool';
import { useGet } from '../../../../../hooks/useApi';
import React from 'react';

const baseUrl = '/lms/resources/component/question';
const questionItemParser = (option) => ({
  value: option.id,
  label: option.text
});

const QuestionFormBody = ({ formik, loading }) => {
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label column={'sm'}>Question Text</Form.Label>
        <Form.Control
          type="text"
          {...formik.getFieldProps('text')}
          isInvalid={!!formik.errors.text && formik.touched.text}
          disabled={loading}
        />
        <Form.Control.Feedback type="invalid">{formik.errors.text}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label column={'sm'}>Answers</Form.Label>
        <div>
          {formik.values.answers.map((answer, index) => {
            const { value, ...correct_props } = formik.getFieldProps(`answers[${index}].is_correct`);
            return (
              <div key={index} className="d-flex align-items-center mb-2">
                <Form.Control
                  type="text"
                  placeholder={`Answer ${index + 1}`}
                  {...formik.getFieldProps(`answers[${index}].text`)}
                  isInvalid={!!formik.errors.answers?.[index]?.text && formik.touched.answers?.[index]?.text}
                  disabled={loading}
                  className="me-2"
                />
                <Form.Check
                  type="checkbox"
                  label="Correct"
                  {...correct_props}
                  checked={value}
                  isInvalid={!!formik.errors.answers?.[index]?.is_correct && formik.touched.answers?.[index]?.is_correct}
                  disabled={loading}
                  className="me-2"
                />
                <button
                  className="btn btn-danger btn-sm"
                  type="button"
                  onClick={() => {
                    const newAnswers = [...formik.values.answers];
                    newAnswers.splice(index, 1);
                    formik.setFieldValue('answers', newAnswers);
                  }}
                  disabled={loading}
                >
                  <i className="fa fa-trash" />
                </button>
              </div>
            );
          })}
        </div>
        <Button
          variant={'secondary'}
          size="sm"
          className="mt-2"
          onClick={() => formik.setFieldValue('answers', [...formik.values.answers, { text: '', is_correct: false }])}
          disabled={loading}
        >
          <i className="fa fa-plus" />
        </Button>
        {formik.errors.answers && typeof formik.errors.answers === 'string' && (
          <div className="invalid-feedback d-block">{formik.errors.answers}</div>
        )}
      </Form.Group>
    </>
  );
};

export const QuestionEditModal = (props) => (
  <BaseEditModal
    {...props}
    url={baseUrl}
    initialValues={{ text: '', answers: [] }}
    validationSchema={Yup.object({
      text: Yup.string().required(),
      answers: Yup.array().of(
        Yup.object().shape({
          item_id: Yup.string().optional(),
          text: Yup.string().required(),
          is_correct: Yup.boolean().required()
        })
      )
    })}
    FormBody={QuestionFormBody}
    parseDataFn={(data) => ({
      text: data.text,
      answers: data.answers.map((answer) => ({
        text: answer.text,
        is_correct: answer.is_correct,
        ...(answer.id && { item_id: answer.id })
      }))
    })}
  />
);

export const QuestionSetModal = (props) => {
  const api = useGet(`${baseUrl}/`, {
    usePagination: false,
    useInitial: false
  });
  return (
    <BaseSetComponentModal
      {...props}
      title="Select Question Component"
      baseUrl={baseUrl}
      dataLoadApiControl={api}
      dataLoadParserFn={questionItemParser}
      EditModalComponent={QuestionEditModal}
    />
  );
};

export class QuestionComponentTool extends BaseComponentTool {
  static title = 'Question';
  static name = 'question';

  getEditModalComponent() {
    return QuestionEditModal;
  }

  getSetModalComponent() {
    return QuestionSetModal;
  }

  getRenderDataText() {
    return this.data.obj?.text || this.data.text;
  }
}
