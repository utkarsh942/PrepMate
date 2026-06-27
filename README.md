# PrepMate - AI Study Platform (Frontend)

The frontend interface for PrepMate, a modern React application that allows users to upload PDF notes and instantly generate AI-powered flashcards, quizzes, and summaries.

##  Tech Stack

- **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing:** React Router v6
- **Authentication:** Google Identity Services (`@react-oauth/google`)

##  Key Features

- **Modern UI/UX:** Clean, responsive design built with Tailwind CSS.
- **Google Sign-In:** One-click authentication using the modern Google Identity popup.
- **PDF Uploads:** Drag-and-drop interface for uploading lecture notes and documents.
- **Interactive Flashcards:** Flippable 3D flashcards with customizable quantities (5, 10, 15, 20 cards).
- **CBT Quiz Engine:** Computer Based Test (CBT) style quiz interface mimicking real-world exams (JEE/NEET style layout), featuring:
  - Question navigation grid.
  - Mark for review system.
  - Detailed post-quiz analytics and explanations.
- **Dashboard:** Tracks user progress, recent activity, and quiz performance graphs.

##  Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- A running instance of the [PrepMate Backend](https://github.com/YOUR_USERNAME/prepmate_backend)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/prepmate-frontend.git
   cd prepmate-frontend
   ```

2. **Navigate to the frontend folder:**
   ```bash
   cd prepmate1
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `prepmate1` directory and add your configurations:
   ```env
   VITE_BASE_URL=http://localhost:8000
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
   ```
   *(Note: Ensure your Google Cloud Console has `http://localhost:5173` listed in the Authorized JavaScript origins).*

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:5173`.

##  Deployment

This project is optimized for deployment on platforms like **Vercel**.
- The project includes a `vercel.json` file to handle React Router client-side routing rewrites.
- Ensure you set the `VITE_BASE_URL` to your production backend URL and `VITE_GOOGLE_CLIENT_ID` in the Vercel Environment Variables dashboard before deploying.
- Make sure to whitelist your live Vercel domain in your Google Cloud Console's OAuth settings.
