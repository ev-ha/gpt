import SwiftUI

struct ContentView: View {
    // Replace the string below with the URL of your deployed Google Apps Script web app
    private let appURL = URL(string: "https://YOUR_GOOGLE_APP_SCRIPT_URL")!

    var body: some View {
        WebView(url: appURL)
            .edgesIgnoringSafeArea(.all)
    }
}

#Preview {
    ContentView()
}
