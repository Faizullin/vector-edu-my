import React, { createRef } from 'react';
import { Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { BaseEditModal } from './base/baseEditModal';
import { BaseSetComponentModal } from './base/baseSetComponentModal';
import { BaseComponentTool } from './base/baseComponentTool';
import { BaseInlineEditableComponentView } from './base/baseInlineEditableComponentView';
import { getTruncated } from '@/utils/truncated';
import { useGet } from '@/hooks/useApi';

const baseUrl = '/lms/resources/component/audio';

const itemParser = (option) => ({
  value: option.id,
  label: getTruncated(option.title, 50)
});

const AudioFormBody = ({ formik, loading }) => (
  <>
    <Form.Group className="mb-3">
      <Form.Label column={'sm'}>Description</Form.Label>
      <Form.Control
        type="text"
        {...formik.getFieldProps('title')}
        isInvalid={!!formik.errors.title && formik.touched.title}
        disabled={loading}
      />
      <Form.Control.Feedback type="invalid">{formik.errors.title}</Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Label column={'sm'}>Audio</Form.Label>
      <Form.Control
        type="file"
        name="audio_file"
        accept="audio/*"
        onChange={(event) => {
          formik.setFieldValue('audio_file', event.currentTarget.files[0]);
        }}
        isInvalid={!!formik.errors.audio_file && formik.touched.audio_file}
        disabled={loading}
      />
      <Form.Control.Feedback type="invalid">{formik.errors.audio_file}</Form.Control.Feedback>
    </Form.Group>
  </>
);

const AudioEditModal = (props) => (
  <BaseEditModal
    {...props}
    title={(record) => (record ? `Edit Audio Component [#${record.id}]` : 'Create Audio Component')}
    url={baseUrl}
    initialValues={{ title: '', audio_file: null }}
    validationSchema={Yup.object({
      title: Yup.string().required(),
      audio_file: Yup.mixed().nullable()
    })}
    FormBody={AudioFormBody}
    parseDataFn={(data) => ({
      title: data.title,
      audio_file: null
    })}
    apiClientPrepareData={(data) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('audio_file', data.audio_file);
      return formData;
    }}
  />
);

const AudioSetModal = (props) => {
  const api = useGet(`${baseUrl}/`, { usePagination: false, useInitial: false });
  return (
    <BaseSetComponentModal
      {...props}
      title="Select Audio"
      baseUrl={baseUrl}
      dataLoadApiControl={api}
      dataLoadParserFn={itemParser}
      EditModalComponent={AudioEditModal}
    />
  );
};

class AudioEditableComponent extends BaseInlineEditableComponentView {
  constructor(props) {
    super(props);
    this.editableRef = createRef();
    this.fileInputRef = createRef();
    this.state = {
      initialValue: this.getPropsDataText()
    };
  }

  getPropsDataText() {
    return this.props.self.data.obj?.title || '';
  }

  componentDidMount() {
    const el = this.editableRef.current;
    if (el) {
      el.innerText = this.getPropsDataText();
      this.handleKeyUp = (e) => {
        if (e.code !== 'Backspace' && e.code !== 'Delete') return;
        if (el.textContent === '') el.innerText = '';
      };
      el.addEventListener('keyup', this.handleKeyUp);
    }
  }

  componentWillUnmount() {
    const el = this.editableRef.current;
    if (el && this.handleKeyUp) {
      el.removeEventListener('keyup', this.handleKeyUp);
    }
  }

  getCurrentValue() {
    return this.editableRef.current.innerHTML.trim();
  }

  handleBlur = () => {
    const el = this.editableRef.current;
    const newValue = this.getCurrentValue();
    if (el && this.state.initialValue !== newValue) {
      this.props.onToolEvent('submit-inline', { value: newValue });
      this.setState({
        initialValue: newValue
      });
    }
  };

  handleAudioClick = () => {
    this.fileInputRef.current?.click();
  };

  handleAudioChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    this.props.onToolEvent('file-upload', { file });
  };

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
    const defaultParagraphClasses = `m-editor-component-content`;
    const { audio } = this.props.self.data.obj || {};
    const audioUrl = audio?.url ? this.getUrl(audio.url) : null;

    return (
      <div className="m-editor-component-wrapper bg-light rounded shadow-sm p-3 pe-2 m-0">
        {self.data.obj ? (
          <>
            <div className={'w-100'}>
              {audioUrl && (
                <audio controls onClick={this.handleAudioClick} style={{ cursor: 'pointer' }} className="border">
                  <source src={audioUrl} />
                  Your browser does not support the audio element.
                </audio>
              )}
              <input type="file" accept="audio/*" ref={this.fileInputRef} style={{ display: 'none' }} onChange={this.handleAudioChange} />
              <div ref={this.editableRef} className="flex-grow-1 ce-paragraph" contentEditable={true} onBlur={this.handleBlur} />
            </div>
            <div className={'m-editor-component-actions'}>
              {this.getSetButton()}
              {this.getEditButton()}
            </div>
          </>
        ) : (
          <>
            <span className={defaultParagraphClasses}>Component not selected</span>
            <div className={'m-editor-component-actions'}>{this.getSetButton()}</div>
          </>
        )}
      </div>
    );
  }
}

export class AudioComponentTool extends BaseComponentTool {
  static title = 'Audio';
  static name = 'audio';

  getRenderComponent() {
    return <AudioEditableComponent self={this} onToolEvent={(eventType, extraArgs) => this.handleToolEvent(eventType, extraArgs)} />;
  }

  getEditModalComponent() {
    return AudioEditModal;
  }

  getSetModalComponent() {
    return AudioSetModal;
  }

  getRenderDataText() {
    return this.data.obj?.title || this.data.text;
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
