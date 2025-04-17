import React, { createContext, Fragment, Suspense, useCallback, useContext, useState } from 'react';
import { uid } from './utils';

const ModalContext = createContext(null);

export const ModalProvider = ({ children, legacy = false, suspense = true, fallback = null }) => {
  const [modals, setModals] = useState({});

  const updateModal = useCallback((id, newProps) => {
    setModals((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          props: { ...prev[id].props, ...newProps }
        }
      };
    });
  }, []);

  const hideModal = useCallback(
    (id) => {
      if (!modals[id]) return;
      setModals((prev) => ({ ...prev, [id]: { ...prev[id], props: { ...prev[id].props, open: false } } }));
    },
    [modals]
  );

  const destroyModal = useCallback((id) => {
    setModals((prev) => {
      const newModals = { ...prev };
      delete newModals[id];
      return newModals;
    });
  }, []);

  const destroyModalsByRootId = useCallback((rootId) => {
    setModals((prev) => {
      return Object.keys(prev).reduce((acc, id) => {
        if (!id.startsWith(rootId)) acc[id] = prev[id];
        return acc;
      }, {});
    });
  }, []);

  const showModal = useCallback(
    (component, props = {}, options = {}) => {
      const id = options.rootId ? `${options.rootId}.${uid(8)}` : uid(8);
      setModals((prev) => ({
        ...prev,
        [id]: { component, props, options }
      }));
      return {
        id,
        hide: () => hideModal(id),
        destroy: () => destroyModal(id),
        update: (newProps) => updateModal(id, newProps)
      };
    },
    [hideModal, destroyModal, updateModal, modals]
  );

  const renderModals = () =>
    Object.entries(modals).map(([id, { component: Component, props, options }]) => {
      const handleClose = (...args) => {
        if (options.hideOnClose) hideModal(id);
        // if (options.destroyOnClose) destroyModal(id);
        props.onClose?.(...args);
      };

      const handleExited = (...args) => {
        props.onExited?.(...args);
        destroyModal(id);
      };

      return (
        <Component
          {...props}
          key={id}
          onClose={handleClose}
          {...(options?.destroyOnClose && {
            onExited: handleExited
          })}
        />
      );
    });

  const SuspenseWrapper = suspense ? Suspense : Fragment;

  return (
    <ModalContext.Provider value={{ showModal, updateModal, hideModal, destroyModal, destroyModalsByRootId, modals, setModals }}>
      {children}
      <SuspenseWrapper fallback={fallback}>{renderModals()}</SuspenseWrapper>
    </ModalContext.Provider>
  );
};

export function useModalManager() {
  return useContext(ModalContext);
}
