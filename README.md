# AI YouTube Chapters

A Chrome extension that automatically generates chapters for YouTube videos using AI technology.

## Features

- Automatically generates chapters for any YouTube video
- Uses AI (via OpenAI) to analyze video content
- Seamlessly injects chapters into the YouTube interface
- Works with or without existing transcripts
- Simple one-click interface

## Installation

### Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon.

### Development Installation

1. Clone this repository:

   ```
   git clone https://github.com/yourusername/ai-yt-chapters.git
   cd ai-yt-chapters
   ```

2. Install server dependencies:

   ```
   cd server
   npm install
   ```

3. Configure the server:

   - Create a `.env` file in the server directory
   - Add your OpenAI API key and other configuration:
     ```
     PORT=3000
     NODE_ENV=development
     API_KEY=your-api-key
     OPENAI_API_KEY=your-openai-key
     ALLOWED_ORIGINS=*
     ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked" and select the repository folder

## Usage

1. Navigate to any YouTube video
2. Click the extension icon in your browser toolbar
3. Click "Generate Chapters"
4. Wait a few seconds for the AI to analyze the content
5. Chapters will appear below the video description

## Architecture

- **Chrome Extension**: Frontend interface and YouTube page integration
- **Node.js Server**: Backend for API key protection and OpenAI integration

## Development

### Server

Start the development server:

```
cd server
npm run dev
```

### Extension

The extension doesn't require a build step. After making changes, simply reload it in `chrome://extensions/`.

## License

MIT

## Acknowledgments

- [OpenAI](https://openai.com/) for the GPT API
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
