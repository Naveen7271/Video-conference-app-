# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Get LiveKit Credentials (Free)
1. Visit https://cloud.livekit.io/
2. Sign up for a free account
3. Create a new project
4. Copy your credentials:
   - API Key
   - API Secret
   - WebSocket URL (wss://...)

### Step 2: Configure Environment
1. Open `.env.local` file in the project root
2. Replace the placeholder values with your LiveKit credentials:
   ```
   LIVEKIT_API_KEY=your_actual_api_key
   LIVEKIT_API_SECRET=your_actual_api_secret
   LIVEKIT_URL=wss://your-project.livekit.cloud
   NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
   ```

### Step 3: Run the Application
```bash
npm run dev
```

### Step 4: Test the Application
1. Open http://localhost:3000 in your browser
2. Open a second browser window (or use incognito mode)
3. In the first window:
   - Click "Teacher Dashboard"
   - Enter name: "Teacher John"
   - Enter room: "classroom1"
   - Click "Join Room"
4. In the second window:
   - Click "Student Dashboard"
   - Enter name: "Student Sarah"
   - Enter room: "classroom1" (same as teacher)
   - Click "Join Room"

### Step 5: Try the Features
**As Teacher:**
- See student video on the right sidebar
- Click screen share area when student shares
- Use Mute/Unmute buttons
- Watch for hand raise notifications

**As Student:**
- See teacher video on the right
- Complete the math quiz on the left
- Click "Raise Hand" button
- Click "Share Screen" to share your screen

## 🎓 Testing with Multiple Students
To test with multiple students:
1. Open additional browser windows (or use different devices)
2. Each should join as a student with different names
3. Teacher dashboard will show up to 4 student videos

## ⚠️ Common Issues

**"Server configuration error"**
- Double-check your `.env.local` file
- Make sure there are no extra spaces
- Restart the dev server: `Ctrl+C` then `npm run dev`

**No video/audio**
- Allow camera and microphone permissions in your browser
- Check that your camera isn't being used by another app
- Use Chrome or Edge for best compatibility

**Students can't see each other**
- This is by design! Students only see the teacher
- Teachers see all students (up to 4)

## 📝 Feature Checklist
- ✅ Teacher sees up to 4 student videos
- ✅ Screen share display in center
- ✅ Mute/unmute individual students
- ✅ Hand raise notifications
- ✅ Student math quiz (6 questions)
- ✅ Student can share screen
- ✅ Real-time video/audio communication

## 🛠️ Need Help?
- Check the main README.md for detailed documentation
- Visit LiveKit docs: https://docs.livekit.io/
- Join LiveKit Discord: https://discord.gg/livekit
