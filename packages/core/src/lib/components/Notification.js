import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useAppState } from '../context/app';
import { get } from '../util/get';

export default function Notification() {
  const notify = (type, message) => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
        toast.info(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      default:
        toast(message);
    }
  };
  const context = useAppState();

  React.useEffect(() => {
    get(context, 'notifications', []).forEach((n) => notify(n.type, n.message));
  }, []);

  return (
    <div>
      <ToastContainer hideProgressBar autoClose={false} />
    </div>
  );
}
