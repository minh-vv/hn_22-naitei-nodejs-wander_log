import React from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const TimeAgo = ({ timestamp }) => {
  let timeAgo = "";
  if (timestamp) {
    try {
      const date = new Date(timestamp);
      const timePeriod = formatDistanceToNow(date, {
        addSuffix: true,
        locale: vi,
      });
      timeAgo = timePeriod;
    } catch (error) {
      console.error(
        "Invalid timestamp provided to TimeAgo component:",
        timestamp
      );
      timeAgo = timestamp;
    }
  }

  if (timeAgo === "dưới một phút trước") {
    timeAgo = "Vừa xong";
  }
  return <time dateTime={timestamp}>{timeAgo}</time>;
};

export default TimeAgo;
