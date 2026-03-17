# like.in Custom Dashboard Builder - 2026

## Custom Dashboard Builder

This project is built using Vanilla HTML, CSS, and JavaScript. Because it uses native ES modules and avoids a complex backend build system, it simply needs to be served by a local web server to function correctly (opening `file:///` directly can cause CORS issues with module loading in some strict browsers).

### How to Run

You can use any light-weight local web server. Since you have Python installed, the easiest way is:

1. Open your terminal (PowerShell, CMD, or VS Code Terminal).
2. Navigate to this project folder:
   ```bash
   cd c:\Users\krish\OneDrive\Desktop\hellyx
   ```
3. Run the built-in Python HTTP server:
   ```bash
   python -m http.server 8080
   ```
4. Open your web browser and navigate to:
   **[http://localhost:8080/index.html](http://localhost:8080/index.html)**

### Alternative Methods
If you install Node.js in the future, you can also use `npx serve` or the "Live Server" extension in VS Code.
