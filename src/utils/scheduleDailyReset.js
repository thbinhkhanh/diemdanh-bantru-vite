function getVietnamTime() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
}

export function scheduleDailyReset(callback, hour = 5, minute = 0) {
  const nowVN = getVietnamTime();
  const targetVN = getVietnamTime();
  targetVN.setHours(hour, minute, 0, 0);

  if (nowVN >= targetVN) {
    targetVN.setDate(targetVN.getDate() + 1);
  }

  const timeUntilTarget = targetVN.getTime() - nowVN.getTime();

  console.log("⏰ Giờ hiện tại (VN):", nowVN.toLocaleString());
  console.log("🎯 Giờ reset dự kiến:", targetVN.toLocaleString());
  console.log("🕒 Sẽ reset sau", Math.round(timeUntilTarget / 1000), "giây");

  const timeoutId = setTimeout(() => {
    console.log("🚀 Đang gọi callback reset...");
    callback();

    // ✅ Lưu intervalId để có thể clear nếu cần
    const intervalId = setInterval(() => {
      console.log("🔁 Reset định kỳ mỗi 24h");
      callback();
    }, 24 * 60 * 60 * 1000);

    // ✅ Trả về cả timeoutId và intervalId
  }, timeUntilTarget);

  return timeoutId;
}