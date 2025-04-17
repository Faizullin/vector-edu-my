import React, { useCallback, useMemo, useState } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { Button } from 'react-bootstrap';
import { debounce } from 'lodash';

export const CSelect = ({ field, form, isMulti = false, actions, value, localOptions, dataLoadFn, dataLoadParserFn }) => {
  // If we have a localOptions array, we skip async loading and use a standard <Select>.
  if (localOptions) {
    const handleLocalChange = (selectedOption) => {
      form.setFieldValue(field.name, selectedOption);
    };
    return (
      <div className="d-flex align-items-center w-100">
        <Select isMulti={isMulti} value={value} onChange={handleLocalChange} options={localOptions} className="w-100" />
        {actions?.create_edit ? (
          <>
            <Button variant="success" className="ms-2" size="sm" onClick={actions.create_edit.fn}>
              <i className="fa fa-plus" />
            </Button>
            <Button variant="primary" className="ms-2" size="sm" onClick={actions.create_edit.fn} disabled={!value}>
              <i className="fa fa-pencil-alt" />
            </Button>
          </>
        ) : (
          <>
            {actions?.create && (
              <Button variant="success" className="ms-2" size="sm" onClick={actions.create.fn}>
                <i className="fa fa-plus" />
              </Button>
            )}
            {actions?.edit && value && (
              <Button variant="primary" className="ms-2" size="sm" onClick={actions.edit.fn}>
                <i className="fa fa-pencil-alt" />
              </Button>
            )}
          </>
        )}
      </div>
    );
  }

  const [dataList, setDataList] = useState([]);

  // Otherwise, default to the async approach.
  const debouncedLoadOptions = useMemo(() => {
    return debounce((inputValue, callback) => {
      dataLoadFn({ search: inputValue }).then((data) => {
        const parsed = data.map((item) => dataLoadParserFn(item));
        callback(parsed);
        setDataList(data);
      });
    }, 300);
  }, [dataLoadFn, dataLoadParserFn]);

  const handleAsyncChange = useCallback(
    (selectedOption) => {
      form.setFieldValue(field.name, selectedOption);
    },
    [form, field]
  );

  return (
    <div className="d-flex align-items-center w-100">
      <AsyncSelect
        {...field}
        isMulti={isMulti}
        value={value}
        onChange={handleAsyncChange}
        cacheOptions
        loadOptions={debouncedLoadOptions}
        defaultOptions
        className="w-100"
      />
      {actions?.create_edit ? (
        <>
          <Button
            variant="success"
            className="ms-2"
            size="sm"
            onClick={() => {
              actions.create_edit.fn({
                mode: 'create'
              });
            }}
          >
            <i className="fa fa-plus" />
          </Button>
          <Button
            variant="primary"
            className="ms-2"
            size="sm"
            onClick={() => {
              actions.create_edit.fn({
                mode: 'edit',
                value: value,
                record: dataList.find(data_item => data_item.id === value.value),
              });
            }}
            disabled={!value}
          >
            <i className="fa fa-pencil-alt" />
          </Button>
        </>
      ) : (
        <>
          {actions?.create && (
            <Button variant="success" className="ms-2" size="sm" onClick={actions.create.fn}>
              <i className="fa fa-plus" />
            </Button>
          )}
          {actions?.edit && value && (
            <Button variant="primary" className="ms-2" size="sm" onClick={actions.edit.fn}>
              <i className="fa fa-pencil-alt" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};
