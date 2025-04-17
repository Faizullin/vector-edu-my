import React, { memo } from 'react';
import { EditorProvider } from './context';
import CEditor from './ceditor';
import './styles.scss';

const ResourcesPostEditContentPage = memo(() => {
  return (
    <EditorProvider>
      <CEditor />
    </EditorProvider>
  );
});

export default ResourcesPostEditContentPage;
