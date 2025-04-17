import './index.css';

import { IconText } from '@codexteam/icons';
import { BaseComponentTool } from '../base/baseComponentTool';

function makeFragment(htmlString) {
  const tempDiv = document.createElement('div');

  tempDiv.innerHTML = htmlString.trim();

  const fragment = document.createDocumentFragment();

  fragment.append(...Array.from(tempDiv.childNodes));

  return fragment;
}

/**
 * Base Paragraph Block for the Editor.js.
 * Represents a regular text block
 */
export class TextComponentTool extends BaseComponentTool {
  static title = 'Text Component';
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

  /**
   * Toolbox settings
   */
  static get toolbox() {
    return {
      icon: IconText,
      title: 'Text'
    };
  }

  /**
   * @param {Object} params
   * @param {Object} params.data
   * @param {Object} params.config
   * @param {Object} params.api
   * @param {boolean} params.readOnly
   */
  constructor(props) {
    super(props);
    const { data, config, api, readOnly } = props;
    this.api = api;
    this.readOnly = readOnly;

    this._CSS = {
      block: this.api.styles.block,
      wrapper: 'ce-paragraph'
    };

    if (!this.readOnly) {
      this.onKeyUp = this.onKeyUp.bind(this);
    }

    this._placeholder = config.placeholder || this.constructor.DEFAULT_PLACEHOLDER;
    this._data = data || {};
    this._element = null;
    this._preserveBlank = config.preserveBlank || false;
  }

  /**
   * Handle key up to remove extra <br> tags
   * @param {KeyboardEvent} e
   */
  onKeyUp(e) {
    if (e.code !== 'Backspace' && e.code !== 'Delete') return;
    if (!this._element) return;

    const { textContent } = this._element;
    if (textContent === '') {
      this._element.innerHTML = '';
    }
  }

  /**
   * Draw the paragraph view
   * @returns {HTMLDivElement}
   */
  renderComponent() {
    this.wrapper = this.getCurrentWrapper();

    this.wrapper.classList.add(this._CSS.wrapper, this._CSS.block);
    this.wrapper.contentEditable = 'false';
    this.wrapper.dataset.placeholderActive = this.api.i18n.t(this._placeholder);

    if (this._data.text) {
      this.wrapper.innerHTML = this._data.text;
    }

    if (!this.readOnly) {
      this.wrapper.contentEditable = 'true';
      this.wrapper.addEventListener('keyup', this.onKeyUp);
      // this.wrapper.addEventListener("click", (event) => this.showActionsBtn(event));
      // document.addEventListener("click", (event) => this.hideButton(event));
      // this.wrapper.addEventListener('f')
    }

    return this.wrapper;
  }

  // showActionsBtn(e) {
  //   console.log("showSetBtn", e)
  // }
  //
  // hideActionsBtn(e) {
  //   console.log("hideSetBtn", e)
  // }

  /**
   * Merge another paragraph block
   * @param {Object} data
   */
  merge(data) {
    if (!this._element) return;

    this._data.text += data.text;
    const fragment = makeFragment(data.text);
    this._element.appendChild(fragment);
    this._element.normalize();
  }

  /**
   * Validate the saved data
   * @param {Object} savedData
   * @returns {boolean}
   */
  validate(savedData) {
    return !(savedData.text.trim() === '' && !this._preserveBlank);

  }

  /**
   * Save the current block content
   * @param {HTMLDivElement} toolsContent
   * @returns {Object}
   */
  save(toolsContent) {
    // const data = {
    //   text: this.data.text,
    //   obj: this.data.obj,
    //   name: this.data.name
    // };
    // if (this.data.element_id) {
    //   data.element_id = this.data.element_id;
    // }
    // return data;
    return {
      text: toolsContent.innerHTML
    };
  }

  /**
   * Handle paste events
   * @param {Object} event
   */
  onPaste(event) {
    this._data = {
      text: event.detail.data.innerHTML
    };

    window.requestAnimationFrame(() => {
      if (!this._element) return;
      this._element.innerHTML = this._data.text || '';
    });
  }
}
