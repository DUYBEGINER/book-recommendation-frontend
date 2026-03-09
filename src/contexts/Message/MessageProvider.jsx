import React, {  useMemo } from 'react';
import { message } from 'antd';
import { MessageContext } from './MessageContext';

export const MessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const showMessage = useMemo(() => ({
    success: (content, duration = 3) => {
      messageApi.success({ content, duration, style: { zIndex: 9999 } });
    },
    error: (content, duration = 3) => {
      messageApi.error({ content, duration, style: { zIndex: 9999 } });
    },
    warning: (content, duration = 3) => {
      messageApi.warning({ content, duration, style: { zIndex: 9999 } });
    },
    loading: (content, duration = 0) => {
      return messageApi.loading({ content, duration, style: { zIndex: 9999 } });
    },
    info: (content, duration = 3) => {
      messageApi.info({ content, duration, style: { zIndex: 9999 } });
    }
  }), [messageApi]); // Dependency là messageApi của antd

  return (
    <MessageContext.Provider value={showMessage}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

