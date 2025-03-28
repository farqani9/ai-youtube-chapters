# AI YouTube Chapters Generator

A Chrome extension that automatically generates chapters for YouTube videos using AI.

## Features

- One-click chapter generation directly from YouTube videos
- Uses OpenAI to create accurate chapter timestamps based on video content
- Injects chapters directly into the YouTube player for seamless navigation
- Works with videos that already have transcripts available
- Simple, intuitive interface with visual feedback

## Installation

### Prerequisites

- Node.js and npm installed
- Chrome browser
- OpenAI API key

### Setup

1. Clone this repository:

   ```
   git clone https://github.com/farqani9/ai-youtube-chapters.git
   cd ai-youtube-chapters
   ```

2. Install dependencies:

   ```
   npm install
   cd server
   npm install
   ```

3. Configure your OpenAI API key:

   - Create a `.env` file in the `server` directory
   - Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`

4. Start the server:

   ```
   cd server
   npm run dev
   ```

5. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the root directory of this project

## Usage

1. Navigate to any YouTube video
2. Click the AI YouTube Chapters extension icon in your browser
3. Click "Generate Chapters" in the popup
4. Wait a few seconds while the AI processes the video content
5. The chapters will appear under the video description automatically

## How It Works

1. The extension extracts video data including title, description, and transcript
2. This data is sent to a local Node.js server
3. The server uses OpenAI to analyze the content and generate appropriate chapters
4. The chapters are returned to the extension and injected into the YouTube page
5. Users can click on the timestamps to navigate to specific parts of the video

## Technologies Used

- JavaScript (Chrome Extension)
- Node.js (Backend Server)
- Express.js (API Framework)
- OpenAI API (AI Text Generation)

## License

MIT

## Acknowledgments

- OpenAI for providing the powerful AI models
- YouTube for making transcript data accessible
