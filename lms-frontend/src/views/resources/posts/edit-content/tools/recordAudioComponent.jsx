import React from 'react';
import { Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { BaseEditModal } from './base/baseEditModal';
import { BaseSetComponentModal } from './base/baseSetComponentModal';
import { BaseComponentTool } from './base/baseComponentTool';
import { BaseInlineEditableComponentView } from './base/baseInlineEditableComponentView';
import { useGet } from '@/hooks/useApi';

const baseUrl = '/lms/resources/component/record-audio/';

const itemParser = (option) => ({
  value: option.id,
  label: option.title
});

const RecordAudioFormBody = ({ formik, loading }) => (
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
      <Form.Label column="sm">Description</Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        {...formik.getFieldProps('description')}
        isInvalid={!!formik.errors.description && formik.touched.description}
        disabled={loading}
      />
      <Form.Control.Feedback type="invalid">{formik.errors.description}</Form.Control.Feedback>
    </Form.Group>
  </>
);

// Edit Modal
const RecordAudioEditModal = (props) => (
  <BaseEditModal
    {...props}
    url={baseUrl}
    initialValues={{ title: '', description: '' }}
    validationSchema={Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required')
    })}
    FormBody={RecordAudioFormBody}
    parseDataFn={(data) => ({
      title: data.title,
      description: data.description
    })}
  />
);

const RecordAudioSetModal = (props) => {
  const audioApi = useGet(`${baseUrl}`, {
    usePagination: false,
    useInitial: false
  });

  return (
    <BaseSetComponentModal
      {...props}
      title="Select Record Audio"
      baseUrl={baseUrl}
      dataLoadApiControl={audioApi}
      dataLoadParserFn={itemParser}
      EditModalComponent={RecordAudioEditModal}
    />
  );
};

class RecordAudioEditableComponent extends BaseInlineEditableComponentView {
  render() {
    const { self } = this.props;
    return (
      <div className="bg-secondary text-white rounded p-3 d-flex align-items-start gap-3" style={{ minHeight: '150px' }}>
        <div className="fs-3">
          <i className="fas fa-microphone" />
        </div>
        {self.data.obj ? (
          <>
            <div className="m-editor-component-wrapper flex-grow-1">
              <div className={'m-editor-component-content'}>
                <strong>{self.data.obj.title}</strong>
                <div ref={this.editableRef} className="ce-paragraph mt-2">
                  {self.data.obj.description}
                </div>
              </div>
              <div className={'m-editor-component-actions'}>
                {this.getEditButton()}
                {this.getSetButton()}
              </div>
            </div>
          </>
        ) : (
          <div className={'m-editor-component-wrapper'}>
            <span className={'m-editor-component-content'}>Component not selected</span>
            <div className={'m-editor-component-actions'}>
              {this.getSetButton()}
              {this.getEditButton()}
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Component Tool
export class RecordAudioComponentTool extends BaseComponentTool {
  static title = 'Record Audio';
  static name = 'record-audio';

  getEditModalComponent() {
    return RecordAudioEditModal;
  }

  getSetModalComponent() {
    return RecordAudioSetModal;
  }

  getRenderDataText() {
    return this.data.obj?.title || this.data.text;
  }

  getRenderComponent() {
    return <RecordAudioEditableComponent self={this} onToolEvent={(eventType, extraArgs) => this.handleToolEvent(eventType, extraArgs)} />;
  }
}
