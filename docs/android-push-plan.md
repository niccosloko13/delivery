# Android Push Plan

This project is not enabling push notifications yet.

## Future architecture

1. Create a Firebase project.
2. Add `google-services.json` for Android.
3. Install `@capacitor/push-notifications`.
4. Request Android 13 notification permission only after a user action.
5. Register the push token with the backend.
6. Store tokens per device/user safely on the server.
7. Send pushes from the backend when order statuses change.
8. Handle logout by removing the local token mapping.
9. Rotate tokens when Android refreshes them.

## Security notes

- Do not commit private keys.
- Do not hardcode secrets in the app.
- Do not expose server credentials in the client.
- Use HTTPS-only endpoints.

## Store review notes

- Document the opt-in flow clearly.
- Explain why notifications are used.
- Show the user how to disable notifications.
