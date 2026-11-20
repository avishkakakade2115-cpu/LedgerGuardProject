
type NotificationProps = {
  message: string;
  onClose: () => void;
};

function Notification({ message, onClose }: NotificationProps) {
  if (!message) return null;

  return (
    <div className="notification">
      <span>{message}</span>

      <button type="button" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

export default Notification;
