export const useNotification = () => {
  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 9999;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      background: ${
        type === "success"
          ? "#10b981"
          : type === "error"
          ? "#ef4444"
          : type === "warning"
          ? "#f59e0b"
          : "#6366f1"
      };
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  return { showNotification };
};
