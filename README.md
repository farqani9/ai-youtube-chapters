# YouTube Chapter Generator Extension

A Chrome extension that automatically generates chapters for YouTube videos using AI technology.

## Features

- One-click chapter generation for YouTube videos
- AI-powered analysis of video content
- Seamless integration with YouTube's interface
- Support for videos with or without transcripts

## Development Setup

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Project Structure

- `manifest.json`: Extension configuration
- `popup.html/js`: Extension popup interface
- `background.js`: Service worker for background tasks
- `content.js`: Content script for YouTube page interaction
- `icons/`: Extension icons

## Development

1. Make changes to the source files
2. Reload the extension in Chrome
3. Test on YouTube videos

## Phase 1 Implementation

The current implementation includes:

- Basic extension structure
- Popup interface with Material Design
- Video data extraction functionality
- Message passing between components
- Error handling and user feedback

Next phases will include:

- Server-side integration
- GPT API integration
- Chapter injection into YouTube interface
