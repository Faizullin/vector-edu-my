import apiClient, { API_URL } from '../../../../services/api';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

class BaseAction {
  static get name() {
    throw new Error(`Base Action requires name argument`);
  }

  constructor(api) {
    this.api = api;
  }

  apply() {}

  getDefaultParams() {
    const name = this.constructor.name;
    return {
      action: name
    };
  }
}

export class LoadContentAction extends BaseAction {
  static get name() {
    return 'load-content';
  }

  apply({ callback, useComponentsDataLoad }) {
    const self = this;
    apiClient
      .get(self.api.apiUrl, {
        params: {
          ...self.getDefaultParams(),
          post_id: self.api.params.id
        }
      })
      .then((response) => {
        self.api.record = response.data.data.instance;
        if (useComponentsDataLoad) {
          self.api.editor.isReady.then(() => {
            if (response.data.data.content) {
              try {
                const json_content = JSON.parse(response.data.data.content);
                self.api.actions['load-components-data'].apply({
                  callback: (success, newResponse) => {
                    callback(success, {
                      loadContentResponse: response.data,
                      loadComponentsDataResponse: newResponse,
                    });
                  },
                  data: json_content
                });
              } catch (error) {
                callback(false, error);
              }
            } else {
              self.api.editor.save().then((outputData) => {
                callback(true, outputData);
              });
            }
          });
        } else {
          callback(true, response.data);
        }
      })
      .catch((error) => {
        self.api.displayError("toast", "request", error)
        callback(false, error);
      });
  }
}

export class SaveContentAction extends BaseAction {
  static get name() {
    return 'save-content';
  }

  apply({ content, callback }) {
    const self = this;
    apiClient
      .post(
        self.api.apiUrl,
        {
          content
        },
        {
          params: {
            ...self.getDefaultParams(),
            post_id: self.api.params.id
          }
        }
      )
      .then((response) => {
        // self.api.record = response.data.data;
        self.api.editorData = {
          content: response.data.content
        };
        callback(true, response.data);
      });
  }
}

const getToolClassFromData = (self, name) => {
  const component_class = self.api.editor.configuration.tools[name];
  if (!component_class) {
    throw new Error(`Component class not found for ${name}`);
  }
  if (typeof component_class === 'object') {
    if (component_class.class) {
      return component_class.class;
    }
  } else {
    return component_class;
  }
  throw new Error(`Component class not found for ${name}`);
};

const COMPONENT_NAME_TO_ELEMENT_FIELD_NAME_DICT = {
  matching: 'matching_component',
  audio: 'audio_component',
  question: 'question_component',
  'blue-card': 'blue_card_component',
  'fill-text': 'fill_text_component',
  video: 'video_component',
  'record-audio': 'record_audio_component',
  'put-in-order': 'put_in_order_component',
  image: 'image_component',
  text: 'text_component'
};

export class BuildAndPublishPostAction extends BaseAction {
  static get name() {
    return 'build-and-publish-post';
  }

  submitBuilderFn = (json_content) => {
    const self = this;
    const elementsSubmitData = [];
    const blocks_list_length = json_content.blocks.length;
    json_content.blocks.forEach((block, index) => {
      if (index + 1 === blocks_list_length) {
        if (block.type === 'paragraph' && block.data.text === '') {
          self.api.warn('Last element (empty text) not used in build');
          return;
        }
      }
      let mode = 'new';
      if (!(block.data.element_id === null || block.data.element_id === undefined)) {
        mode = 'edit';
      }
      elementsSubmitData.push({
        mode,
        element_id: block.data.element_id,
        component_id: block.data.obj?.id,
        component_type: block.data.name
      });
    });
    return elementsSubmitData;
  };

  apply({ callback }) {
    const self = this;
    self.api.editor.save().then((outputData) => {
      const elementsSubmitData = self.submitBuilderFn(outputData);
      apiClient
        .post(
          self.api.apiUrl,
          {
            elements: elementsSubmitData
          },
          {
            params: {
              ...self.getDefaultParams(),
              post_id: self.api.params.id
            }
          }
        )
        .then((response) => {
          if (response.data.success) {
            const { elements } = response.data.data;
            const { blocks } = outputData;
            blocks.forEach((block) => {
              const block_data = block.data;
              if (block_data.obj) {
                const element_field_name = COMPONENT_NAME_TO_ELEMENT_FIELD_NAME_DICT[block_data.name];
                if (!element_field_name) {
                  self.api.warn(`Element field name not found for ${block_data.name}`);
                }
                const element = elements.find((element) => {
                  const val = element[element_field_name];
                  if (!val) {
                    return;
                  }
                  return val === block_data.obj.id;
                });
                if (element) {
                  block_data.element_id = element.id;
                }
              }
            });
            const data = {
              ...outputData,
              blocks
            };
            self.api.actions['save-content'].apply({
              content: JSON.stringify(data),
              callback: (success, response_data) => {
                if (success) {
                  self.api.editor.render(JSON.parse(response_data.data.content));
                  toast.success("Content is built and published successfully");
                  callback(true, response.data);
                } else {
                  callback(false, response);
                }
              }
            });
          } else {
            let msg = "";
            response.data.errors.elements.forEach((error) => {
              msg += JSON.stringify(error);
            })
            self.api.displayError("toast", "message", {
              message: msg,
            })
          }
          callback(true, response.data);
        })
        .catch((error) => {
          callback(false, error);
        });
    });
  }
}

export class HotUpdateComponentAction extends BaseAction {
  static get name() {
    return 'hot-update-component';
  }

  apply({ component_id, component_type, data, callback, mode }) {
    const self = this;
    apiClient
      .post(self.api.apiUrl, data, {
        params: {
          ...self.getDefaultParams(),
          post_id: self.api.params.id,
          component_id,
          component_type,
          mode,
        }
      })
      .then((response) => {
        callback(true, response.data);
      })
      .catch((error) => {
        callback(false, error);
      });
  }
}

export class LoadComponentsDataAction extends BaseAction {
  static get name() {
    return 'load-components-data';
  }

  apply({ callback, data: outputData }) {
    const self = this;
    const componentsSubmitData = [];
    for(let i = 0; i < outputData.blocks.length; i++) {
      const block = outputData.blocks[i];
      if(block.data.obj) {
        componentsSubmitData.push({
          component_id: block.data.obj.id,
          component_type: block.data.name,
          tool_block_id: block.id
        });
      } else {
        self.api.warn(`No obj data for ${block.type}`);
      }
    }
    apiClient
      .post(
        self.api.apiUrl,
        {
          components: componentsSubmitData
        },
        {
          params: {
            ...self.getDefaultParams()
          }
        }
      )
      .then((response) => {
        if (response.data.success) {
          self.api.componentsData = response.data.data;
          const newContent = { ...outputData };
          self.api.componentsData.forEach((component_data) => {
            const tool_block = newContent.blocks.find((block) => block.id === component_data.tool_block_id);
            if (tool_block) {
              tool_block.data.obj = component_data.instance;
            }
          });
          self.api.editor.render(newContent);
          callback(true, response.data);
        } else {
          callback(false, 'Something went wrong');
        }
      })
      .catch((error) => {
        callback(false, error);
        self.api.displayError("toast", "request" , error)
      });
  }
}

export class OpenComponentEditorAction extends BaseAction {
  static get name() {
    return 'open-component-editor';
  }

  /**
   * @param {object} params
   * @param {string} params.component_id - the component's ID
   * @param {string} params.component_type - the Editor.js block type (tool)
   * @param {object} params.currentData - any current block data to be edited
   * @param {function} params.callback - optional callback after success
   * @param {function} params.onCancel - optional callback on cancel
   */
  apply({ component_id, component_type, currentData, callback, onCancel }) {
    const self = this;

    // 1) Find the correct tool class for the given type
    const ToolClass = getToolClassFromData(self, component_type);
    if (!ToolClass) {
      throw new Error(`Tool class not found for type: ${component_type}`);
    }

    // 2) The tool class must define something like `static getEditorForm()`
    //    which returns a React component to render inside a modal
    if (typeof ToolClass.getEditorForm !== 'function') {
      throw new Error(`Tool class ${component_type} does not implement getEditorForm()`);
    }
    const EditorForm = ToolClass.getEditorForm();

    // 3) We assume your Editor or API has a reference to a modal manager (or context)
    //    that can open a modal. For example:
    if (!this.api.modalManager) {
      throw new Error('No modalManager found in this.api. Ensure your app sets it.');
    }

    // 4) Show the modal with the EditorForm
    //    We pass in the current data. On "submit," we update Editor.js or call callback
    this.api.modalManager.showModal(
      <EditorForm
        data={currentData}
        componentId={component_id}
        componentType={component_type}
        onSubmit={(newValues) => {
          // Once the user saves, call callback so the tool can re-render
          if (callback) {
            callback(true, newValues);
          }
          // Optionally hide the modal
          this.api.modalManager.hideModal();
        }}
        onCancel={() => {
          if (onCancel) onCancel();
          this.api.modalManager.hideModal();
        }}
      />
    );
  }
}

export class Api {
  constructor(config = {}) {
    this.apiUrl = `${API_URL}/lms/resources/posts/edit-content/action`;
    this.record = null;
    this.editor = null;
    this.componentsData = [];
    this.params = config.params;
    this.actions = {};
    this.modalManager = null;
  }

  addAction(action_class) {
    const name = action_class.name;
    if (this.actions[name]) {
      throw new Error(`Action ${name} already exists`);
    }
    this.actions[name] = new action_class(this);
  }

  warn(msg) {
    console.log(`[WARN] ${msg}`);
  }

  getCurrentEditorData() {
    return this.editor.save;
  }

  displayError(display_type, error_type, data) {
    this.warn(`displayError: ${display_type} ${error_type}`, data.message);
    if (display_type === 'toast') {
      if (error_type === 'request') {
        if (data instanceof AxiosError) {
          const response_data = data.response.data;
          if (response_data.message) {
            toast.error(response_data.message);
          } else {
            toast.error("Unknown request error.");
          }
        } else  {
          toast.error("Unknown error.");
        }
      } else if (error_type === "message") {
        toast.error(data.message);
      }
    }
  }
}
