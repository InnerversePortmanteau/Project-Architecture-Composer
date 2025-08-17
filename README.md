Project Composer
A React-based project architecture composer tool with Firebase integration. It helps teams design and plan multi-component applications and export a CSDM-compliant data model.

Prerequisites
Node.js (LTS version recommended)

npm or yarn

Firebase CLI (npm install -g firebase-tools)

A Firebase Project with Firestore enabled

Setup
Clone the repository:

git clone [repository-url]
cd project-composer

Install dependencies:

npm install

Link to your Firebase Project:
Run the Firebase initialization command in your project's root directory. When prompted, select "Use an existing project" and choose your project from the list.

firebase init

Start development server:

npm run dev

Build for production:

npm run build

Deploy to Firebase Hosting:
This command will build your application and deploy it to your Firebase Hosting URL.

npm run build
firebase deploy

How to Use
The application is a three-panel interface:

Catalog (Left): Browse and select from a catalog of project templates (Frontend, Backend, DevOps, etc.).

Workspace (Center): Drag and drop templates to build your project architecture.

Configuration (Right): Click a project in the workspace to open its settings and define its purpose, impact, and other details.

Key Features:

Data Persistence: Your project workspace is automatically saved to Firestore under your user ID.

CSDM Integration: Enable CSDM mode to configure your project with CSDM-compliant fields.

Generate Architecture: Create a comprehensive summary of your entire project with a single click.

Technology Stack
React 18

Vite

TailwindCSS

PostCSS

Firebase (Hosting & Firestore)

Project Structure
project-composer/
├── dist/                          # Production build output
├── public/
├── src/
│   ├── Composer.jsx
│   ├── index.css
│   └── main.jsx
├── firebase.json                  # Firebase configuration
├── firestore.rules                # Firestore security rules
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js

Contributing
Fork the repository

Create your feature branch (git checkout -b feature/my-new-feature)

Commit your changes (git commit -am 'feat: add a new feature')

Push to the branch (git push origin feature/my-new-feature)

Create a new Pull Request

License
ISC
