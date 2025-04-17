import { Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { BaseEditModal } from './base/baseEditModal';
import { BaseSetComponentModal } from './base/baseSetComponentModal';
import { BaseComponentTool } from './base/baseComponentTool';
import { createRef } from 'react';
import { BaseInlineEditableComponentView } from './base/baseInlineEditableComponentView';
import { useGet } from '@/hooks/useApi';

const baseUrl = '/lms/resources/component/blue-card';

const itemParser = (option) => ({
  value: option.id,
  label: option.text
});

const BlueCardFormBody = ({ formik, loading }) => {
  return (
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
  );
};

const BlueCardEditModal = (props) => (
  <BaseEditModal
    {...props}
    title={(record) => (record ? `Edit Blue Card Component [#${record.id}]` : 'Create Blue Card Component')}
    url={baseUrl}
    initialValues={{ text: '' }}
    validationSchema={Yup.object({
      text: Yup.string().required('Text is required')
    })}
    FormBody={BlueCardFormBody}
    parseDataFn={(data) => ({
      text: data.text
    })}
  />
);

const BlueCardSetModal = (props) => {
  const blueCardApi = useGet(`${baseUrl}/`, {
    usePagination: false,
    useInitial: false
  });
  return (
    <BaseSetComponentModal
      {...props}
      title="Select Blue Card"
      baseUrl={baseUrl}
      dataLoadApiControl={blueCardApi}
      dataLoadParserFn={itemParser}
      EditModalComponent={BlueCardEditModal}
    />
  );
};

class BlueCardEditableComponent extends BaseInlineEditableComponentView {
  constructor(props) {
    super(props);
    this.editableRef = createRef();
    this.state = {
      initialValue: this.getPropsDataText()
    };
  }

  getPropsDataText() {
    return this.props.self.data.obj?.text || '';
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

  render() {
    const { self } = this.props;
    const defaultParagraphClasses = `m-editor-component-content text-bg-primary`;
    return (
      <div className="m-editor-component-wrapper bg-primary rounded p-3 pe-2 m-0">
        {self.data.obj ? (
          <>
            <div ref={this.editableRef} className={defaultParagraphClasses} contentEditable={true} onBlur={this.handleBlur} />
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

export class BlueCardComponentTool extends BaseComponentTool {
  static title = 'Blue Card';
  static name = 'blue-card';

  getRenderComponent() {
    return <BlueCardEditableComponent self={this} onToolEvent={(eventType, extraArgs) => this.handleToolEvent(eventType, extraArgs)} />;
  }

  handleToolEvent(eventType, extraArgs) {
    const self = this;
    if (eventType === 'submit-inline') {
      this.config.getActionsApi().actions['hot-update-component'].apply({
        mode: "edit",
        component_id: this.data.obj.id,
        component_type: this.constructor.name,
        data: {
          text: extraArgs.value
        },
        callback: (success, data) => {
          if (success && data.success) {
            self.data.obj = data.data.instance;
            self.data.text = self.getRenderDataText();
          }
        }
      });
    } else {
      return super.handleToolEvent(eventType, extraArgs);
    }
  }

  getEditModalComponent() {
    return BlueCardEditModal;
  }

  getSetModalComponent() {
    return BlueCardSetModal;
  }

  getRenderDataText() {
    return this.data.obj?.text || this.data.text;
  }
}
