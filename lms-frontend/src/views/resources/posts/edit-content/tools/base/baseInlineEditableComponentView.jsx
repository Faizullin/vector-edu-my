import { Component, memo } from 'react';
import { Button } from 'react-bootstrap';

const ActionButton = memo(({ variant, iconClass, onClick }) => {
  return (
    <Button size="sm" variant={variant} className="p-1" onClick={onClick}>
      <i className={iconClass} style={{ fontSize: '10px' }}></i>
    </Button>
  );
});

export class BaseInlineEditableComponentView extends Component {
  constructor(props) {
    if (!props.self) {
      throw new Error('self prop is required');
    }
    super(props);
  }

  getCurrentValue() {
    throw new Error('getCurrentValue() not implemented');
  }

  getSaveNewButton() {
    const { self, onToolEvent } = this.props;
    const status = !!self.data.obj;
    return (
      <ActionButton
        variant={status ? 'secondary' : 'success'}
        iconClass={'fa fa-plus'}
        onClick={() =>
          onToolEvent('save-new', {
            self,
            value: this.getCurrentValue()
          })
        }
      ></ActionButton>
    );
  }

  getSetButton() {
    const { self, onToolEvent } = this.props;
    const status = !!self.data.obj;
    return (
      <ActionButton
        variant={status ? 'secondary' : 'info'}
        iconClass={'fa fa-list'}
        onClick={() => onToolEvent('set', { self })}
      ></ActionButton>
    );
  }

  getEditButton() {
    const { self, onToolEvent } = this.props;
    const status = !!self.data.obj;
    return (
      <ActionButton
        variant={status ? 'secondary' : 'primary'}
        iconClass={'fa fa-pencil-alt'}
        onClick={() => onToolEvent('edit', { self })}
      ></ActionButton>
    );
  }
}
