import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useGet, useMutation } from '@/hooks/useApi';
import { useFormik } from 'formik';

export function useFormManager({ getUrl, schema, parseResponse, parseFormData, initialValues = {}, onSubmit }) {
  const [record, setRecord] = useState(null);
  const saveControl = useMutation();
  const getUrlStr = useMemo(() => {
    if (record) {
      return getUrl(record);
    } else {
      return getUrl();
    }
  }, [record]);
  const getControl = useGet(getUrlStr, { useInitial: false, usePagination: false });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: schema,
    onSubmit: async (values, actions) => {
      try {
        const payload = parseFormData(values);
        let response;

        if (record?.id) {
          response = await saveControl.mutate(getUrlStr, 'PUT', payload);
          toast.success('Updated successfully!');
        } else {
          response = await saveControl.mutate(getUrlStr, 'POST', payload);
          toast.success('Created successfully!');
        }
        const newRecord = parseResponse(response);
        onSubmit?.({
          status: 'success',
          payload: newRecord,
          response
        });
        setRecord(newRecord);
        actions.setSubmitting(false);
      } catch (err) {
        processServerErrors(err, actions);
        onSubmit?.({
          status: 'error',
          payload: err
        });
      }
    }
  });

  const processServerErrors = (err, actions) => {
    if (err?.response?.status === 400 && err.response?.data) {
      const serverErrors = err.response.data;
      if (serverErrors.non_field_errors) {
        toast.error(serverErrors.non_field_errors.join(', '));
      }
      if (serverErrors.message) {
        Object.entries(serverErrors.message).forEach(([field, messages]) => {
          actions.setFieldError(field, messages);
        });
      }
    } else {
      toast.error(err?.message || 'Something went wrong.');
    }
    actions.setSubmitting(false);
  };

  return {
    record,
    setRecord,
    saveControl,
    getControl,
    formik
  };
}
