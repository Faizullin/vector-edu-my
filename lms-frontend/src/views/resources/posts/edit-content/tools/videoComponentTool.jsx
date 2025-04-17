import { Form } from 'react-bootstrap';
import { getTruncated } from '@/utils/truncated';
import { BaseSetComponentModal } from './base/baseSetComponentModal';
import { BaseComponentTool } from './base/baseComponentTool';
import * as Yup from 'yup';
import { BaseEditModal } from './base/baseEditModal';
import { BaseInlineEditableComponentView } from './base/baseInlineEditableComponentView';
import { useGet } from '@/hooks/useApi';
import React from 'react';

const baseUrl = '/lms/resources/component/video';

const itemParser = (option) => ({
  value: option.id,
  label: getTruncated(option.description, 50)
});

const VideoFormBody = ({ formik, loading }) => (
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
      <Form.Label column={'sm'}>Vimeo Video URL</Form.Label>
      <Form.Control
        type="url"
        {...formik.getFieldProps('video_url')}
        isInvalid={!!formik.errors.video_url && formik.touched.video_url}
        disabled={loading}
      />
      <Form.Control.Feedback type="invalid">{formik.errors.video_url}</Form.Control.Feedback>
    </Form.Group>
  </>
);

const VideoEditModal = (props) => (
  <BaseEditModal
    {...props}
    url={baseUrl}
    initialValues={{ description: '', video_url: '' }}
    validationSchema={Yup.object({
      description: Yup.string().required(),
      video_url: Yup.string().url('Invalid URL').required()
    })}
    FormBody={VideoFormBody}
    parseDataFn={(data) => ({
      description: data.description,
      video_url: data.video_url
    })}
  />
);

const VideoSetModal = (props) => {
  const api = useGet(`${baseUrl}/`, {
    usePagination: false,
    useInitial: false
  });
  return (
    <BaseSetComponentModal
      {...props}
      title="Select Video"
      baseUrl={baseUrl}
      dataLoadApiControl={api}
      dataLoadParserFn={itemParser}
      EditModalComponent={VideoEditModal}
    />
  );
};

class VideoEditableComponent extends BaseInlineEditableComponentView {
  render() {
    const { self } = this.props;
    return (
      <div className="p-3 border rounded">
        {self.data.obj ? (
          <>
            <div className="ratio ratio-16x9 mb-2">
              <iframe src={self.data.obj['embedded_video_url']} title="Vimeo Video" allowFullScreen />
            </div>
            <div className={'m-editor-component-wrapper'}>
              <div className={'m-editor-component-content'}>{self.data.obj.description}</div>
              <div className={'m-editor-component-actions'}>
                {this.getSetButton()}
                {this.getEditButton()}
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

const getText = (obj) => `[${obj.video_url}] ${getTruncated(obj.description, 50)}`;

export class VideoComponentTool extends BaseComponentTool {
  static title = 'Vimeo video';
  static name = 'video';

  getRenderComponent() {
    return <VideoEditableComponent self={this} onToolEvent={(eventType, extraArgs) => this.handleToolEvent(eventType, extraArgs)} />;
  }

  getEditModalComponent() {
    return VideoEditModal;
  }

  getSetModalComponent() {
    return VideoSetModal;
  }

  getRenderDataText() {
    return this.data.obj ? getText(this.data.obj) : this.data.text;
  }
}
