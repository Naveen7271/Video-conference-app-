# Video Conferencing Platform for Teachers and Students

A Next.js application built with LiveKit for video conferencing between teachers and students, featuring interactive quizzes and classroom management tools.

## Features

### Teacher Dashboard
- View up to 4 student video feeds simultaneously
- Monitor student screen sharing in real-time
- Mute/unmute individual students
- Receive notifications when students raise their hand
- Full control over the classroom environment

### Student Dashboard
- View teacher's video feed
- Interactive math quiz with 6 questions
- Raise hand to get teacher's attention
- Share screen with the class
- Real-time audio/video communication

## Prerequisites

- Node.js 18+ installed
- A LiveKit account (Cloud or self-hosted server)
  - Sign up at [LiveKit Cloud](https://cloud.livekit.io/) for free
  - Or run your own [LiveKit server](https://docs.livekit.io/oss/deployment/)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure LiveKit Credentials

Create a `.env.local` file in the root directory (or copy from `.env.example`):

```env
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_URL=wss://your-livekit-server.com
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com
```

**Getting LiveKit Credentials:**
1. Go to [LiveKit Cloud](https://cloud.livekit.io/)
2. Create a new project
3. Copy your API Key, API Secret, and WebSocket URL
4. Paste them into your `.env.local` file

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### For Teachers:
1. Go to the home page and click "Teacher Dashboard"
2. Enter your name and create a room name
3. Share the room name with your students
4. Wait for students to join
5. You'll see their video feeds on the right side
6. Use the mute/unmute buttons to control student audio
7. Monitor hand raises in the notification panel

### For Students:
1. Go to the home page and click "Student Dashboard"
2. Enter your name and the room name provided by your teacher
3. Click "Join Room"
4. Complete the math quiz on the left side
5. View your teacher's video on the right
6. Click "Raise Hand" to notify the teacher
7. Click "Share Screen" to share your screen with the class

## Project Structure

```
video-conferencing-app/
├── app/
│   ├── api/
│   │   └── token/
│   │       └── route.ts          # LiveKit token generation API
│   ├── teacher/
│   │   ├── page.tsx              # Teacher login page
│   │   └── room/
│   │       └── page.tsx          # Teacher room interface
│   ├── student/
│   │   ├── page.tsx              # Student login page
│   │   └── room/
│   │       └── page.tsx          # Student room interface
│   └── page.tsx                  # Home page
├── components/
│   └── Quiz.tsx                  # Interactive quiz component
├── lib/
│   └── questions.ts              # Math questions data
└── .env.local                    # Environment variables (not in repo)
```

## Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Video/Audio:** LiveKit
- **UI Components:** @livekit/components-react

## Features Breakdown

### Real-time Communication
- WebRTC-based video and audio streaming
- Low-latency screen sharing
- Data channels for hand raise notifications and mute requests

### Teacher Controls
- Remote mute/unmute functionality
- Visual indicators for active speakers
- Hand raise notification system
- Up to 4 student video tiles

### Student Features
- 6 math quiz questions with instant feedback
- Raise hand button with visual feedback
- Screen sharing capability
- Personal video preview

## Troubleshooting

### "Server configuration error"
- Make sure all environment variables in `.env.local` are set correctly
- Restart the development server after changing environment variables

### Video/Audio not working
- Grant camera and microphone permissions in your browser
- Check that no other application is using your camera
- Try a different browser (Chrome/Edge recommended)

### Cannot connect to room
- Verify your LiveKit credentials are correct
- Check that your LiveKit server is running and accessible
- Ensure the WebSocket URL starts with `wss://`

## Development

To build for production:

```bash
npm run build
npm start
```

## License

MIT

## Support

For LiveKit documentation and support:
- [LiveKit Docs](https://docs.livekit.io/)
- [LiveKit Discord](https://discord.gg/livekit)
