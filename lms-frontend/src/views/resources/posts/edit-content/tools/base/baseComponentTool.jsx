import { createRoot } from 'react-dom/client';
import { BaseInlineEditableComponentView } from './baseInlineEditableComponentView';
import { Alert } from 'react-bootstrap';

const default_title = 'Base Component Tool';

class BaseComponentView extends BaseInlineEditableComponentView {
  render() {
    const { self } = this.props;
    const title = `${self.getTitle()}: ${self.data.text}`;
    const defaultParagraphClasses = `m-editor-component-content`;
    return (
      <Alert variant="primary" className="m-editor-component-wrapper border rounded p-3 pe-2 m-0">
        {self.data.obj ? (
          <>
            <div className={defaultParagraphClasses}>{title}</div>
            <div className={'m-editor-component-actions'}>
              {this.getEditButton()}
              {this.getSetButton()}
            </div>
          </>
        ) : (
          <>
            <div className={defaultParagraphClasses}>Component not selected</div>
            <div className={'m-editor-component-actions'}>
              {this.getEditButton()}
              {this.getSetButton()}
            </div>
          </>
        )}
      </Alert>
    );
  }
}

export class BaseComponentTool {
  static title = default_title;

  constructor({ data, api, readOnly, config }) {
    this.data = {
      name: this.constructor.name,
      ...data
    };
    this.data.text = this.getRenderDataText();
    this.readOnly = readOnly;
    this.wrapper = null;
    this.reactRoot = null;
    this.config = config;
    this.api = api;
  }

  static get toolbox() {
    return {
      title: this.title
    };
  }

  getTitle() {
    return this.constructor.title;
  }

  getCurrentWrapper() {
    return this.wrapper || document.createElement('div');
  }

  render() {
    this.wrapper = this.getCurrentWrapper();
    this.renderComponent();
    return this.wrapper;
  }

  renderComponent() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    this.wrapper = this.getCurrentWrapper();
    if (!this.reactRoot) {
      this.reactRoot = createRoot(this.wrapper);
    }
    this.reactRoot.render(this.getRenderComponent());
    return this.wrapper;
  }

  getRenderComponent() {
    return <BaseComponentView self={this} onToolEvent={(eventType, extraArgs) => this.handleToolEvent(eventType, extraArgs)} />;
  }

  /**
   * Called by the React component (BaseToolView) when user clicks
   * various buttons (settings, search, advanced config, etc.).
   */
  handleToolEvent(eventType, extraArgs) {
    const self = this;
    const actionsApi = this.config.getActionsApi();
    if (eventType === 'set') {
      const thisModal = actionsApi.modalManager.showModal(
        this.getSetModalComponent(),
        {
          self,
          open: true,
          record: self.data.obj,
          onClose: () => {
            self.data.text = self.getRenderDataText();
            self.renderComponent();
          },
          onSubmit: (response) => {
            self.data.obj = response.record;
            self.data.text = self.getRenderDataText();
            actionsApi.modalManager.hideModal(thisModal.id);
            self.renderComponent();
          }
        },
        {
          destroyOnClose: true,
          hideOnClose: true
        }
      );
    } else if (eventType === 'edit') {
      const thisModal = actionsApi.modalManager.showModal(
        this.getEditModalComponent(),
        {
          self,
          open: true,
          record: self.data.obj,
          onSubmit: (response) => {
            self.data.obj = response.record;
            self.data.text = self.getRenderDataText();
            self.renderComponent();
          }
        },
        {
          destroyOnClose: true,
          hideOnClose: true
        }
      );
    }
  }

  getRenderDataText() {
    return this.data.text;
  }

  save() {
    const data = {
      text: this.data.text,
      obj: this.data.obj,
      name: this.data.name
    };
    if (this.data.element_id) {
      data.element_id = this.data.element_id;
    }
    return data;
  }

  getEditModalComponent() {
    throw new Error('Method not implemented.');
  }

  getSetModalComponent() {
    throw new Error('Method not implemented.');
  }
}
