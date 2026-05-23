# ICS Dashboard

Frontend dashboard for the Smart Classroom System (ICS) — an embedded IoT platform managing RFID attendance, HVAC control, and access control. Built with Next.js 14, Tailwind CSS, and TypeScript.

## Prerequisites

- Node.js 18.17+ 
- npm or yarn

## Setup

1. **Clone the repository and install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Environment Variables**
   Create a `.env.local` file in the root of the project:
   \`\`\`env
   NEXT_PUBLIC_API_BASE=http://localhost:8000
   \`\`\`
   Do not add a trailing slash to the API_BASE URL.

3. **Run the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   The app will be available at [http://localhost:3000](http://localhost:3000).
   Any requests to `/api/*` will automatically be proxied to your `NEXT_PUBLIC_API_BASE` to bypass CORS constraints during development.

## Build for Production

1. **Build the Application**
   \`\`\`bash
   npm run build
   \`\`\`
   
2. **Start the Production Server**
   \`\`\`bash
   npm run start
   \`\`\`

## Notes

- **Authentication State**: The dashboard stores the JWT exclusively in memory (React context) to maximize security and prevent XSS token theft. By design, refreshing the page will log the user out and prompt them to sign in again. 
- **Tailwind Only**: The UI uses plain Tailwind CSS with no external component libraries (like shadcn or MUI) to keep the bundle lightweight.
