import { Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { BaseEditModal } from './base/baseEditModal';
import { BaseComponentTool } from './base/baseComponentTool';
import { createRef } from 'react';
import { BaseInlineEditableComponentView } from './base/baseInlineEditableComponentView';
import { useGet } from '@/hooks/useApi';
import { BaseSetComponentModal } from '@/views/resources/posts/edit-content/tools/base/baseSetComponentModal';
import { getTruncated } from '@/utils/truncated';

import './textProComponentStyle.scss';

const baseUrl = '/lms/resources/component/text';

const itemParser = (option) => ({
  value: option.id,
  label: option.title ? option.title : getTruncated(option.text, 30)
});

const TextFormBody = ({ formik, loading }) => {
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
        <Form.Label column="sm">Text</Form.Label>
        <Form.Control
          type="text"
          {...formik.getFieldProps('text')}
          isInvalid={!!formik.errors.text && formik.touched.text}
          disabled={loading}
        />
        <Form.Control.Feedback type="invalid">{formik.errors.text}</Form.Control.Feedback>
      </Form.Group>
    </>
  );
};

const TextEditModal = (props) => (
  <BaseEditModal
    {...props}
    title={(record) => (record ? `Edit Text Component [#${record.id}]` : 'Create Text Component')}
    url={baseUrl}
    initialValues={{ title: '', text: '' }}
    validationSchema={Yup.object({
      title: Yup.string().optional(),
      text: Yup.string().required('Text is required')
    })}
    FormBody={TextFormBody}
  />
);

const TextSetModal = (props) => {
  const dataLoadApiControl = useGet(`${baseUrl}`, {
    usePagination: false,
    useInitial: false
  });
  return (
    <BaseSetComponentModal
      {...props}
      title="Select Text Component"
      baseUrl={baseUrl}
      dataLoadApiControl={dataLoadApiControl}
      dataLoadParserFn={itemParser}
      EditModalComponent={TextEditModal}
    />
  );
};

class TextEditableComponent extends BaseInlineEditableComponentView {
  constructor(props) {
    super(props);
    this.editableRef = createRef();
    this.state = {
      initialValue: this.getPropsDataText(),
      showSaveButton: false
    };
  }

  getPropsDataText() {
    return this.props.self.data.obj?.text || this.props.self.data?.text;
  }

  componentDidMount() {
    const el = this.editableRef.current;
    if (el) {
      el.innerHTML = this.getPropsDataText();
      this.handleKeyUp = () => {
        this.setState({ showSaveButton: true });
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
        initialValue: newValue,
        showSaveButton: false
      });
    }
  };

  render() {
    const { self } = this.props;
    const defaultParagraphClasses = `${self._CSS.wrapper} ${self._CSS.block} m-editor-component-content`;
    return (
      <div className={'m-editor-component-wrapper pe-2'}>
        {self.data.obj ? (
          <>
            <div ref={this.editableRef} className={defaultParagraphClasses} contentEditable={true} onBlur={this.handleBlur} />
            <div className={'m-editor-component-actions'}>
              {this.getEditButton()}
              {this.getSetButton()}
            </div>
          </>
        ) : (
          <>
            <div ref={this.editableRef} className={defaultParagraphClasses} contentEditable={true} onBlur={this.handleBlur} />
            <div className={'m-editor-component-actions'}>
              {this.getSaveNewButton()}
              {this.getSetButton()}
            </div>
          </>
        )}
      </div>
    );
  }
}

function makeFragment(htmlString) {
  const tempDiv = document.createElement('div');

  tempDiv.innerHTML = htmlString.trim();

  const fragment = document.createDocumentFragment();

  fragment.append(...Array.from(tempDiv.childNodes));

  return fragment;
}

export class TextProComponentTool extends BaseComponentTool {
  static title = 'Text Pro';
  static name = 'text';

  /**
   * Default placeholder for Paragraph Tool
   */
  static get DEFAULT_PLACEHOLDER() {
    return '';
  }

  /**
   * Conversion config
   */
  static get conversionConfig() {
    return {
      export: 'text',
      import: 'text'
    };
  }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      text: {
        br: true
      }
    };
  }

  /**
   * Read-only mode support
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Handle pasting <p> tags
   */
  static get pasteConfig() {
    return {
      tags: ['P']
    };
  }

  constructor(props) {
    super(props);
    this._CSS = {
      block: this.api.styles.block,
      wrapper: 'ce-paragraph'
    };

    const { config, data } = props;

    this._placeholder = config.placeholder || this.constructor.DEFAULT_PLACEHOLDER;
    this._element = null;
    this._preserveBlank = config.preserveBlank || false;
  }

  getRenderComponent() {
    return <TextEditableComponent self={this} onToolEvent={(eventType, extraArgs) => this.handleToolEvent(eventType, extraArgs)} />;
  }

  handleToolEvent(eventType, extraArgs) {
    console.log(eventType, extraArgs);

    const self = this;
    const actionsApi = this.config.getActionsApi();
    if (eventType === 'submit-inline') {
      if (!this.data.obj) {
        this.data.text = extraArgs.value;
        return;
      }
      actionsApi.actions['hot-update-component'].apply({
        mode: 'edit',
        component_id: self.data.obj.id,
        component_type: self.constructor.name,
        data: { text: extraArgs.value },
        callback: (success, data) => {
          if (success && data.success) {
            self.data.obj = data.data.instance;
            self.data.text = self.getRenderDataText();
          } else {
            actionsApi.displayError('toast', 'request', data);
          }
        }
      });
    } else if (eventType === 'save-new') {
      actionsApi.actions['hot-update-component'].apply({
        mode: 'new',
        component_type: self.constructor.name,
        data: { text: extraArgs.value },
        callback: (success, data) => {
          if (success && data.success) {
            self.data.obj = data.data.instance;
            self.data.text = self.getRenderDataText();
            self.renderComponent();
          } else {
            actionsApi.displayError('toast', 'request', data);
          }
        }
      });
    } else {
      return super.handleToolEvent(eventType, extraArgs);
    }
  }

  getSetModalComponent() {
    return TextSetModal;
  }

  getEditModalComponent() {
    return TextEditModal;
  }

  getRenderDataText() {
    return this.data.obj?.text || this.data.text || '';
  }

  /**
   * Merge another paragraph block
   * @param {Object} data
   */
  merge(data) {
    if (!this._element) return;

    this.data.text += data.text;
    const fragment = makeFragment(data.text);
    this._element.appendChild(fragment);
    this._element.normalize();
  }

  // /**
  //  * Validate the saved data
  //  * @param {Object} savedData
  //  * @returns {boolean}
  //  */
  // validate(savedData) {
  //   console.log('savedData', savedData);
  //   return !(savedData.text.trim() === '' && !this._preserveBlank);
  // }

  /**
   * Handle paste events
   * @param {Object} event
   */
  onPaste(event) {
    this.data = {
      text: event.detail.data.innerHTML
    };

    window.requestAnimationFrame(() => {
      if (!this._element) return;
      this._element.innerHTML = this.data.text || '';
    });
  }
}
