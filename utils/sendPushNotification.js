async function sendPushNotification(expoPushToken, title, body, data = {}) {
  if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken")) {
    console.log("Invalid or missing Expo push token:", expoPushToken);
    return;
  }

  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
      priority: "high",
      channelId: "booking-requests",
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log("Push notification result →", result);
    return result;
  } catch (error) {
    console.error("Push notification error →", error.message);
  }
}

async function sendPushNotificationToMany(tokens, title, body, data = {}) {
  const validTokens = (tokens || []).filter(
    (t) => t && String(t).startsWith("ExponentPushToken")
  );

  if (validTokens.length === 0) {
    console.log("No valid push tokens to send");
    return;
  }

  const messages = validTokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data,
    priority: "high",
    channelId: "booking-requests",
  }));

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log("Bulk push result →", result);
    return result;
  } catch (error) {
    console.error("Bulk push error →", error.message);
  }
}

module.exports = {
  sendPushNotification,
  sendPushNotificationToMany,
};
