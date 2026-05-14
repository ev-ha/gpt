# Dormitory iOS App

This repository contains a minimal SwiftUI application that wraps the existing Google Apps Script based dormitory management web app in a native iOS container. The application uses `WKWebView` to display the web interface on iPhone devices running iOS 15 and later (iPhone 11 or newer).

## Building
1. Open the `ios-app/DormitoryApp` folder in Xcode.
2. Replace the placeholder URL in `ContentView.swift` with the URL of your deployed Google Apps Script.
3. Build and run on a device or simulator.

The included Swift files are:
- `DormitoryApp.swift` – entry point of the app.
- `ContentView.swift` – hosts the web view that loads the web app.
- `WebView.swift` – wraps `WKWebView` for SwiftUI.
