import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ButtonGroup, Col, Container, Form, Row } from 'react-bootstrap';
import EditorJS from '@editorjs/editorjs';
import { EditorContext } from './context';
import MainCard from '@/components/Card/MainCard';
import { getTools } from './tools';
import { CSelect } from '@/components/form/CSelect';
import { useGet, useMutation } from '@/hooks/useApi';
import { Link, useNavigate } from 'react-router-dom';

const useParentControl = (modelName) => {
  const [ready, setReady] = useState(false);
  const url = '/lms/lessons/pages';
  if (!url) {
    return {
      ready
    };
  }
  const getControl = useGet(`${url}/`, {
    usePagination: false,
    useInitial: false
  });
  useEffect(() => {
    setReady(true);
  }, []);
  return {
    ready,
    getControl
  };
};

const lessonOptionParser = (option) => ({
  label: `Lesson Page #${option.id}`,
  value: option.id
});

const EditorParentPanel = memo(({ instance }) => {
  if (!instance) {
    return <Container fluid={'sm'}>Loading...</Container>;
  }
  const navigate = useNavigate();
  const parentControl = useParentControl(instance?.content_type);
  const [currentParentValue, setCurrentParentValue] = useState(null);
  useEffect(() => {
    if (instance) {
      parentControl.getControl
        .fetchData(
          {},
          {
            url: `/lms/lessons/pages/${instance.object_id}/`
          }
        )
        .then((response_data) => {
          setCurrentParentValue(lessonOptionParser(response_data));
        });
    }
  }, [instance, parentControl.getControl.fetchData]);
  const getEditorControl = useMutation();
  const handleOpenEditor = useCallback((row) => {
    getEditorControl.mutate(`/lms/lessons/pages/${row.id}/get-editor/`, 'POST').then((response) => {
      window.location.href = `/lms/resources/posts/${response.post.id}/edit-content?type=editor1`;
    });
  }, []);
  return (
    <Container fluid={'sm'}>
      {!instance || !parentControl.ready ? (
        'Loading...'
      ) : (
        <div className={'row'}>
          <div className="col-md-6 col-3">
            <div className={'d-flex justify-content-start align-items-center'}>
              <CSelect
                field={{
                  name: 'parent'
                }}
                dataLoadFn={parentControl.getControl.fetchData}
                value={currentParentValue}
                form={{
                  setFieldValue: (_, newValue) => {
                    setCurrentParentValue(newValue);
                    handleOpenEditor({
                      id: newValue.value
                    });
                  }
                }}
                dataLoadParserFn={(option) => ({
                  label: `Lesson Page #${option.id}`,
                  value: option.id
                })}
                isMulti={false}
              />
              <Link to={`/lessons/${instance}/pages/edit-view/`} className={'ms-2'}>
                Pages
              </Link>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
});

const CEditor = memo(() => {
  const [allLoading, setAllLoading] = useState(false);
  const { api } = useContext(EditorContext);
  const editorRef = useRef(null);
  const [title, setTitle] = useState('');
  const postData = useMemo(() => {
    if (api && api.record) {
      return api.record;
    }
    return null;
  }, [api]);

  const handleSave = useCallback(() => {
    setAllLoading(true);
    editorRef.current.save().then((outputData) => {
      const content = JSON.stringify(outputData);
      api.actions['save-content'].apply({
        content,
        callback: (success, response_data) => {
          setAllLoading(false);
        }
      });
    });
  }, [api]);
  const handlePublish = useCallback(() => {
    setAllLoading(true);
    api.actions['build-and-publish-post'].apply({
      callback: (success, data) => {
        setAllLoading(false);
      }
    });
  }, [api]);
  const [instance, setInstance] = useState(null);
  useEffect(() => {
    if (api) {
      document.title = 'Loading...';
      setAllLoading(true);
      api.actions['load-content'].apply({
        useComponentsDataLoad: true,
        callback: (success, { loadContentResponse }) => {
          setAllLoading(false);
          if (success) {
            const { instance } = loadContentResponse.data;
            document.title = `${instance.title}`;
            setTitle(instance.title);
            setInstance(instance);
          }
        }
      });
    }
  }, [api]);
  useEffect(() => {
    if (api && !editorRef.current) {
      const editor_obj = new EditorJS({
        holder: 'content-editor',
        tools: getTools(api),
        autofocus: true
      });
      api.editor = editor_obj;
      editorRef.current = editor_obj;
    }
    return () => {
      editorRef.current?.destroy();
    };
  }, [api]);

  return (
    <Row>
      <Col sm={12}>
        <MainCard title={title}>
          <EditorParentPanel instance={instance} />
          <Container className="pt-3 pb-5">
            <ButtonGroup className={'mt-4'}>
              <Button size={'sm'} variant="primary" onClick={handleSave} disabled={allLoading}>
                Save
              </Button>
              <Button size={'sm'} variant="outline-primary" onClick={handlePublish} disabled={allLoading}>
                Build and Publish
              </Button>
            </ButtonGroup>

            <div className="border-top mt-4 pt-4">
              <Form.Label column={'lg'}>Content</Form.Label>
              <div id="content-editor" className="border p-3" />
            </div>
          </Container>
        </MainCard>
      </Col>
    </Row>
  );
});

export default CEditor;
