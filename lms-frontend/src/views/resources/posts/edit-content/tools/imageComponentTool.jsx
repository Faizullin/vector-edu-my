import React from 'react';
import { Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { BaseEditModal } from './base/baseEditModal';
import { BaseSetComponentModal } from './base/baseSetComponentModal';
import { BaseComponentTool } from './base/baseComponentTool';
import { BaseInlineEditableComponentView } from './base/baseInlineEditableComponentView';
import { getTruncated } from '@/utils/truncated';
import { useGet } from '@/hooks/useApi';

const baseUrl = '/lms/resources/component/image';

const itemParser = (option) => ({
  value: option.id,
  label: getTruncated(option.description, 50)
});

const ImageFormBody = ({ formik, loading }) => {
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label column={'sm'}>Description</Form.Label>
        <Form.Control
          type="text"
          {...formik.getFieldProps('description')}
          isInvalid={!!formik.errors.description && formik.touched.description}
          disabled={loading}
        />
        <Form.Control.Feedback type="invalid">{formik.errors.description}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label column={'sm'}>Image</Form.Label>
        <Form.Control
          type="file"
          name="image_file"
          onChange={(event) => {
            formik.setFieldValue('image_file', event.currentTarget.files[0]);
          }}
          isInvalid={!!formik.errors.image_file && formik.touched.image_file}
          disabled={loading}
        />
        <Form.Control.Feedback type="invalid">{formik.errors.image_file}</Form.Control.Feedback>
      </Form.Group>
    </>
  );
};

const ImageEditModal = (props) => (
  <BaseEditModal
    {...props}
    url={baseUrl}
    initialValues={{ description: '', image_file: null }}
    validationSchema={Yup.object({
      description: Yup.string().required('Description is required'),
      image_file: Yup.mixed().nullable()
    })}
    FormBody={ImageFormBody}
    parseDataFn={(data) => {
      return {
        description: data.description,
        image_file: null
      };
    }}
    apiClientPrepareData={(data) => {
      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('image_file', data.image_file);
      return formData;
    }}
  />
);

const SetImageComponentModal = (props) => {
  const api = useGet(`${baseUrl}/`, { usePagination: false, useInitial: false });
  return (
    <BaseSetComponentModal
      {...props}
      title="Select Image"
      baseUrl={baseUrl}
      dataLoadApiControl={api}
      dataLoadParserFn={itemParser}
      EditModalComponent={ImageEditModal}
    />
  );
};

class ImageEditableComponent extends BaseInlineEditableComponentView {
  getUrl(url) {
    const prefix_url = '/api/v1/lms/resources/protected-media';
    const prefix_default = '/protected';
    if (url.startsWith(prefix_default)) {
      return `${prefix_url}${url.slice(prefix_default.length)}`;
    }
    throw new Error(`Incorrect url format for ${url}`);
  }

  render() {
    const { self } = this.props;
    const { image } = self.data.obj || {};
    const image_url = image?.url ? this.getUrl(image.url) : null;
    return (
      <div className="m-editor-component-wrapper align-items-center gap-3 bg-light p-3 rounded shadow-sm">
        {self.data.obj ? (
          <>
            <img
              src={image_url}
              alt="Preview"
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.5rem' }}
              className="border"
            />
            <div className={'d-flex w-100 justify-content-between'}>
              <div className={'m-editor-component-content'}>{self.data.obj.description}</div>
              <div className={'m-editor-component-actions'}>
                {this.getEditButton()}
                {this.getSetButton()}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={'m-editor-component-content'}>Component not selected</div>
            <div className={'m-editor-component-actions'}>
              {this.getEditButton()}
              {this.getSetButton()}
            </div>
          </>
        )}
      </div>
    );
  }
}

export class ImageComponentTool extends BaseComponentTool {
  static title = 'Image';
  static name = 'image';

  getRenderComponent() {
    return <ImageEditableComponent self={this} onToolEvent={(eventType, extraArgs) => this.handleToolEvent(eventType, extraArgs)} />;
  }

  getEditModalComponent() {
    return ImageEditModal;
  }

  getSetModalComponent() {
    return SetImageComponentModal;
  }

  getRenderDataText() {
    return this.data.obj?.description || this.data.text;
  }

  handleToolEvent(eventType, extraArgs) {
    const self = this;
    const actionsApi = this.config.getActionsApi();
    if (eventType === 'file-upload') {
      if (!this.data.obj) {
        this.data.text = extraArgs.value;
        return;
      }
      const { file } = extraArgs;
      const formData = new FormData();
      formData.append('audio_file', file);
      actionsApi.actions['hot-update-component'].apply({
        mode: 'edit',
        component_id: self.data.obj.id,
        component_type: self.constructor.name,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
        callback: (success, data) => {
          if (success && data.success) {
            self.data.obj = data.data.instance;
            self.data.text = self.getRenderDataText();
          } else {
            actionsApi.displayError('toast', 'request', data);
          }
        }
      });
    } else {
      return super.handleToolEvent(eventType, extraArgs);
    }
  }
}
