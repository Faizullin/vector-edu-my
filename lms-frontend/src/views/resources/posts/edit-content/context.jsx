import { createContext, useEffect, useState } from 'react';
import {
  Api,
  BuildAndPublishPostAction,
  HotUpdateComponentAction,
  LoadComponentsDataAction,
  LoadContentAction,
  SaveContentAction
} from './api_actions';
import { useParams } from 'react-router-dom';
import { useModalManager } from '@/contexts/ModalContext';

export const EditorContext = createContext(null);

export function EditorProvider({ children }) {
  const [initApi, setInitApi] = useState(null);
  const params = useParams();
  const modalManager = useModalManager();

  useEffect(() => {
    if (params.id) {
      if (!initApi) {
        const newApi = new Api({
          params
        });
        newApi.addAction(LoadContentAction);
        newApi.addAction(SaveContentAction);
        newApi.addAction(BuildAndPublishPostAction);
        newApi.addAction(HotUpdateComponentAction);
        newApi.addAction(LoadComponentsDataAction);
        newApi.modalManager = modalManager;
        setInitApi(newApi);
      }
    }
  }, [params]);

  useEffect(() => {
    if (initApi) {
      initApi.modalManager = modalManager;
      console.log('reinit modalManager', initApi.modalManager.modals);
    }
  }, [modalManager, initApi]);

  return <EditorContext.Provider value={{ api: initApi }}>{children}</EditorContext.Provider>;
}
