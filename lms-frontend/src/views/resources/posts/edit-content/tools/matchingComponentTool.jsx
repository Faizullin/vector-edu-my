import React, { useRef } from 'react';
import { Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { BaseEditModal } from './base/baseEditModal';
import { BaseSetComponentModal } from './base/baseSetComponentModal';
import { BaseComponentTool } from './base/baseComponentTool';
import { useGet } from '@/hooks/useApi';

const baseUrl = '/lms/resources/component/matching';

const itemParser = (option) => ({
  value: option.id,
  label: option.title
});

const MatchingFormBody = ({ formik, loading }) => {
  const fileInputRefs = useRef([]);

  const handleFileChange = (event, coupleIndex, side) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...formik.values.element_couples];
        updated[coupleIndex][side].image = reader.result;
        updated[coupleIndex][side].text = ''; // Очищаем текст, если изображение
        formik.setFieldValue('element_couples', updated);
      };
      reader.readAsDataURL(file);
    }
  };

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
        <Form.Label column={'sm'}>Matching Pairs</Form.Label>

        {formik.values.element_couples.map((couple, index) => (
          <div key={index} className="border rounded p-3 mb-3 bg-light">
            <div className="row g-3">
              {/* First Element */}
              <div className="col-md-5">
                <Form.Label column={'sm'}>First Element</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Text"
                  value={couple.first.text}
                  onChange={(e) => {
                    const updated = [...formik.values.element_couples];
                    updated[index].first.text = e.target.value;
                    updated[index].first.image = '';
                    formik.setFieldValue('element_couples', updated);
                  }}
                  disabled={loading}
                />
                <Form.Control
                  type="file"
                  accept="image/*"
                  ref={(el) => (fileInputRefs.current[`${index}-first`] = el)}
                  onChange={(e) => handleFileChange(e, index, 'first')}
                  disabled={loading}
                  className="mt-2"
                />
              </div>

              {/* Second Element */}
              <div className="col-md-5">
                <Form.Label column={"sm"}>Second Element</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Text"
                  value={couple.second.text}
                  onChange={(e) => {
                    const updated = [...formik.values.element_couples];
                    updated[index].second.text = e.target.value;
                    updated[index].second.image = '';
                    formik.setFieldValue('element_couples', updated);
                  }}
                  disabled={loading}
                />
                <Form.Control
                  type="file"
                  accept="image/*"
                  ref={(el) => (fileInputRefs.current[`${index}-second`] = el)}
                  onChange={(e) => handleFileChange(e, index, 'second')}
                  disabled={loading}
                  className="mt-2"
                />
              </div>

              {/* Delete button */}
              <div className="col-md-2 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    const updated = [...formik.values.element_couples];
                    updated.splice(index, 1);
                    formik.setFieldValue('element_couples', updated);
                  }}
                  disabled={loading}
                >
                  <i className="fa fa-trash" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            formik.setFieldValue('element_couples', [
              ...formik.values.element_couples,
              {
                first: { text: '', image: '' },
                second: { text: '', image: '' }
              }
            ]);
          }}
          disabled={loading}
        >
          <i className="fa fa-plus" /> Add Pair
        </button>
      </Form.Group>
    </>
  );
};

const MatchingEditModal = (props) => (
  <BaseEditModal
    {...props}
    title={(record) => (record ? `Edit Matching Component [#${record.id}]` : `Create Matching Component`)}
    url={baseUrl}
    initialValues={{
      title: '',
      element_couples: []
    }}
    validationSchema={Yup.object({
      title: Yup.string().required(),
      element_couples: Yup.array().of(
        Yup.object().shape({
          first: Yup.object().shape({
            text: Yup.string(),
            image: Yup.string()
          }),
          second: Yup.object().shape({
            text: Yup.string(),
            image: Yup.string()
          })
        })
      )
    })}
    FormBody={MatchingFormBody}
    parseDataFn={(data) => ({
      title: data.title,
      element_couples: data.element_couples.map((couple) => ({
        first: {
          text: couple.first_element.text,
          image: couple.first_element.image
        },
        second: {
          text: couple.second_element.text,
          image: couple.second_element.image
        }
      }))
    })}
  />
);

const MatchingSetModal = (props) => {
  const api = useGet(`${baseUrl}/`, {
    usePagination: false,
    useInitial: false
  });
  return (
    <BaseSetComponentModal
      {...props}
      title="Select Matching Component"
      baseUrl={baseUrl}
      dataLoadApiControl={api}
      dataLoadParserFn={itemParser}
      EditModalComponent={MatchingEditModal}
    />
  );
};

export class MatchingComponentTool extends BaseComponentTool {
  static title = 'Matching Component';
  static name = 'matching';

  getEditModalComponent() {
    return MatchingEditModal;
  }

  getSetModalComponent() {
    return MatchingSetModal;
  }

  getRenderDataText() {
    return this.data.obj?.title || this.data.text;
  }
}
