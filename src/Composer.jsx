import { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase.js';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import PropTypes from 'prop-types';
import FileTree from './FileTree.jsx';
import { projectData } from './data/projectData.js';
import { SAFePhases } from './data/SAFePhases.js';

// Modal Component for How to Use Guide
function HowToUseModal({ isOpen, onClose }) {
  const closeButtonRef = useRef(null);

  HowToUseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
  };

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="how-to-use-title">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 id="how-to-use-title" className="text-2xl font-bold text-white mb-4">How to Use the Composer</h2>
        <div className="prose prose-invert text-gray-300">
          <p>The application is laid out in three main panels:</p>
          <ul className="list-disc pl-5 mb-4">
            <li><strong>Catalog (Left Panel):</strong> This is your library of available frameworks and platforms. You'll see categories like frontend, backend, devops, and databases.</li>
            <li><strong>Workspace (Center Panel):</strong> This is your design canvas. You would add projects here from the catalog to build your architecture. When you click a project from the catalog, a new card with that project's icon and name will appear in this central space.</li>
            <li><strong>Configuration (Right Panel):</strong> This panel is for customizing the projects you've placed in the workspace. When you click on a project card in the workspace, its configuration form will appear here.</li>
          </ul>
          <h3 className="text-xl font-semibold text-white mt-4">Step-by-Step Walkthrough</h3>
          <ol className="list-decimal pl-5 mb-4">
            <li><strong>Add a Project:</strong> In the left-hand "Catalog" panel, you would click on the "React.js" button under the "Frontend" category. A blue card with a React icon would then appear in the central "Workspace" panel.</li>
            <li><strong>Configure a Project:</strong> You would then click on the new React card in the workspace. The right-hand "Configuration" panel would update to show a form with inputs for the project's name, purpose, impact, and first steps.</li>
            <li><strong>Build Your Architecture:</strong> You would repeat these steps, adding more projects like a "PostgreSQL" database or a "Docker" container to the workspace. For each one, you would click on its card to configure its specific details.</li>
            <li><strong>Generate the Plan:</strong> Once you have all the pieces of your architecture laid out and configured, you would click the "Generate Architecture" button at the bottom of the central panel. A pop-up would then appear with a summary of your entire project, including the details you entered and the "next steps" for each component. This simulates the final output of your project planning, giving you a clear roadmap to start building.</li>
          </ol>
        </div>
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors duration-200"
          aria-label="Close how to use modal"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Main App Component
const LOCAL_STORAGE_KEY = 'project-composer-workspace';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('frontend');
  const [workspaceProjects, setWorkspaceProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [message, setMessage] = useState(null);
  const [showHowToUseModal, setShowHowToUseModal] = useState(false);
  const [progress, setProgress] = useState({});
  // Now auth and db are imported, no need for setDb/setAuth from useState for them
  //const [db, setDb] = useState(null);
  //const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [isCSDMEnabled, setIsCSDMEnabled] = useState(false);
  const [integrationType, setIntegrationType] = useState('standalone');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [collapseState, setCollapseState] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Refs for keyboard navigation
  const workspaceRefs = useRef([]);

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle Escape key to close panels
      if (e.key === 'Escape') {
        if (message) {
          closeMessage();
        } else if (selectedProject) {
          setSelectedProject(null);
        }
      }

      // Handle arrow keys for navigation in the workspace
      const focusedElement = document.activeElement;
      if (focusedElement && focusedElement.classList.contains('project-card')) {
        const index = workspaceRefs.current.findIndex(ref => ref === focusedElement);
        if (index === -1) return;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          const nextIndex = (index + 1) % workspaceProjects.length;
          workspaceRefs.current[nextIndex]?.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          const prevIndex = (index - 1 + workspaceProjects.length) % workspaceProjects.length;
          workspaceRefs.current[prevIndex]?.focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const project = workspaceProjects[index];
          if (project) {
            setSelectedProject(project);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspaceProjects, selectedProject, message]);


  // Initialize Firebase and set up auth listener
  useEffect(() => {
    // Load projects from local storage on mount
    const savedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setWorkspaceProjects(parsedProjects);
        // Recalculate progress on load
        parsedProjects.forEach(p => {
          const { projectName, purpose, impact, firstStep } = p.config;
          const filledFields = [projectName, purpose, impact, firstStep].filter(Boolean).length;
          const newProgress = (filledFields / 4) * 100;
          setProgress((prev) => ({ ...prev, [p.instanceId]: newProgress }));
        });
      } catch (e) {
        console.error("Failed to parse saved projects from local storage:", e);
        // Clear corrupt data to avoid future errors
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    
    // Auth state change listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
      } else {
        try {
          const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
          if (token) {
            await signInWithCustomToken(auth, token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Authentication failed:", error);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save projects to local storage whenever workspaceProjects changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workspaceProjects));
  }, [workspaceProjects]);
  
  // Function to sign in with Google
  const signInWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showMessage('Welcome!', 'You have successfully signed in with Google.');
    } catch (error) {
      showMessage('Sign-in Failed', `There was an error signing in: ${error.message}`);
      console.error("Google sign-in failed:", error);
    }
  };

  // Load projects from Firestore
  const loadProjects = (firestoreDb, uid) => {
    const docRef = doc(firestoreDb, `artifacts/project-composer/users/${uid}/projects/workspace`);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.projects) {
          setWorkspaceProjects(data.projects);
          // Recalculate progress on load
          data.projects.forEach(p => {
            const { projectName, purpose, impact, firstStep } = p.config;
            const filledFields = [projectName, purpose, impact, firstStep].filter(Boolean).length;
            const newProgress = (filledFields / 4) * 100;
            setProgress((prev) => ({ ...prev, [p.instanceId]: newProgress }));
          });
        }
      }
    });
    return () => unsubscribe();
  };

  // Function to add a new project to the workspace
  const addProjectToWorkspace = (project) => {
    const newProject = {
      ...project,
      instanceId: Date.now(),
      config: {
        projectName: '',
        purpose: '',
        impact: '',
        firstStep: '',
        empathyMap: { sees: '', hears: '', thinksFeels: '', saysDoes: '' },
        governance: { business: '', data: '', application: '' },
        // New CSDM fields
        csdm: {
          valueStream: '',
          businessCapability: '',
          businessProcess: '',
          productModel: '',
          serviceOffering: '',
          informationObject: '',
        },
        // New developer-centric fields
        language: 'javascript',
        testingFramework: 'none',
      },
    };
    setWorkspaceProjects([...workspaceProjects, newProject]);
    setSelectedProject(newProject);
    setProgress((prev) => ({ ...prev, [newProject.instanceId]: 0 }));
  };

  // Function to update the configuration of a selected project
  const updateProjectConfig = (key, value) => {
    if (!selectedProject) return;
    const updatedProject = {
      ...selectedProject,
      config: {
        ...selectedProject.config,
        [key]: value,
      },
    };
    setSelectedProject(updatedProject);
    const newWorkspace = workspaceProjects.map((p) =>
      p.instanceId === updatedProject.instanceId ? updatedProject : p
    );
    setWorkspaceProjects(newWorkspace);
    updateProgress(updatedProject);
  };
  
  // Function to update CSDM fields
  const updateCSDMConfig = (key, value) => {
    if (!selectedProject) return;
    const updatedProject = {
      ...selectedProject,
      config: {
        ...selectedProject.config,
        csdm: {
          ...selectedProject.config.csdm,
          [key]: value,
        },
      },
    };
    setSelectedProject(updatedProject);
    const newWorkspace = workspaceProjects.map((p) =>
      p.instanceId === updatedProject.instanceId ? updatedProject : p
    );
    setWorkspaceProjects(newWorkspace);
    updateProgress(updatedProject);
  };

  // Function to update progress
  const updateProgress = (project) => {
    const { projectName, purpose, impact, firstStep } = project.config;
    const filledFields = [projectName, purpose, impact, firstStep].filter(Boolean).length;
    const newProgress = (filledFields / 4) * 100;
    setProgress((prev) => ({ ...prev, [project.instanceId]: newProgress }));
  };

  // Function to save project to Firestore
  const saveProject = async () => {
    if (!db || !userId) {
      showMessage('Error', 'User not authenticated. Please wait or try again.');
      return;
    }
    setIsLoading(true);
    try {
      const docRef = doc(db, `artifacts/project-composer/users/${userId}/projects/workspace`);
      await setDoc(docRef, { projects: workspaceProjects, lastUpdated: new Date() });
      showMessage('Success! 🎉', 'Your project architecture has been saved to the cloud.');
    } catch (error) {
      showMessage('Error', 'Failed to save project. Please check your connection and try again.');
      console.error("Error saving document: ", error);
    }
    setIsLoading(false);
  };

  // Function to remove a project from the workspace
  const removeProjectFromWorkspace = (instanceId) => {
    const newProjects = workspaceProjects.filter(p => p.instanceId !== instanceId);
    setWorkspaceProjects(newProjects);
    if (selectedProject?.instanceId === instanceId) {
      setSelectedProject(null);
    }
    setProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[instanceId];
      return newProgress;
    });
  };

  // Function to map project data to CSDM format
  const mapToCSDM = (project) => {
    const { csdm } = project.config;
    const csdmData = {
      // CSDM Foundation Domain
      product_model: csdm.productModel,
      value_stream: csdm.valueStream,
      business_process: csdm.businessProcess,
      
      // CSDM Design & Planning Domain
      business_capability: csdm.businessCapability,
      information_object: csdm.informationObject,
      
      // CSDM Service Delivery Domain
      service_offering: csdm.serviceOffering,
      technology_service: project.name, // The project itself is a technical service
    };
    return csdmData;
  };
  
  const generateFileTree = (project) => {
    const { projectName, language, testingFramework } = project.config;
    const isTs = language === 'typescript';
    const ext = isTs ? 'ts' : 'js';
    const testExt = testingFramework === 'jest' ? 'test.js' : 'spec.js';
    let tree = `
${projectName}/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── App.${isTs ? 'tsx' : 'jsx'}
│   └── main.${ext}
├── public/
├── package.json
└── README.md
    `;
    if (testingFramework !== 'none') {
      tree += `\n├── tests/\n│   └── App.${testExt}`;
    }
    return tree;
  };

  // Function to generate the entire architecture
  const generateArchitecture = () => {
    if (workspaceProjects.length === 0) {
      showMessage('Please add at least one project to the workspace.');
      return;
    }

    const architectureSummary = workspaceProjects.map((p) => {
      const { projectName, purpose, impact, firstStep, empathyMap, governance, csdm, language, testingFramework } = p.config;
      
      const csdmSection = isCSDMEnabled ? `
CSDM Data Model:
  - Value Stream: ${csdm.valueStream}
  - Business Capability: ${csdm.businessCapability}
  - Service Offering: ${csdm.serviceOffering}
  - Product Model: ${csdm.productModel}
` : '';

      const developerOptions = `
Developer Options:
  - Language: ${language}
  - Testing Framework: ${testingFramework}
      `;

      return `Project: ${projectName || 'Unnamed Project'} (${p.name})\nPurpose: ${purpose}\nImpact: ${impact}\nFirst Step: ${firstStep}\n
Empathy Map:
  - Sees: ${empathyMap.sees}
  - Hears: ${empathyMap.hears}
  - Thinks & Feels: ${empathyMap.thinksFeels}
  - Says & Does: ${empathyMap.saysDoes}

TOGAF Metamodel:
  - Business: ${governance.business}
  - Data: ${governance.data}
  - Application: ${governance.application}
${developerOptions}
${csdmSection}
---
`;
    }).join('\n');
    
    const csdmMappedData = isCSDMEnabled ? `\n\nCSDM Mapped Data (for Integration):\n${JSON.stringify(workspaceProjects.map(mapToCSDM), null, 2)}` : '';

    const nextSteps = workspaceProjects.map((p) => {
      return `For ${p.name} (${p.config.projectName || 'Unnamed'}):\n  ${getNextSteps(p.id, p.config.projectName)}\n`;
    }).join('\n');

    showMessage(
      `Architecture Generated! 🎉`,
      `Integration Type: ${integrationType}\n\nHere is a summary of your project architecture:\n\n${architectureSummary}`,
      nextSteps + csdmMappedData
    );
  };

  // Custom message box logic
  const showMessage = (title, message, code = '') => {
    setMessage({ title, message, code });
  };

  const closeMessage = () => {
    setMessage(null);
  };

  // Utility function for getting next steps (simplified)
  const getNextSteps = (frameworkId, projectName) => {
    const defaultProjectName = projectName || 'my-project';
    let instructions = '';

    switch (frameworkId) {
        case 'react':
            instructions = `1. cd ${defaultProjectName}\n2. npm install\n3. npm start`;
            break;
        case 'vue':
            instructions = `1. cd ${defaultProjectName}\n2. npm install\n3. npm run dev`;
            break;
        case 'angular':
            instructions = `1. cd ${defaultProjectName}\n2. npm install\n3. ng serve`;
            break;
        case 'svelte':
            instructions = `1. cd ${defaultProjectName}\n2. npm install\n3. npm run dev`;
            break;
        case 'express':
            instructions = `1. cd ${defaultProjectName}\n2. npm install\n3. npm run dev`;
            break;
        case 'django':
            instructions = `1. cd ${defaultProjectName}\n2. pip install -r requirements.txt\n3. python manage.py runserver`;
            break;
        case 'docker':
            instructions = `1. cd ${defaultProjectName}\n2. docker-compose up --build`;
            break;
        case 'terraform':
            instructions = `1. cd ${defaultProjectName}\n2. terraform init\n3. terraform apply`;
            break;
        case 'postgresql':
            instructions = `1. cd ${defaultProjectName}\n2. docker-compose up -d\n3. psql -U user -d db_name`;
            break;
        case 'mongodb':
            instructions = `1. cd ${defaultProjectName}\n2. mongosh --file ./scripts/seed-data.js`;
            break;
        case 'react-firebase':
        case 'mobile-firebase':
        case 'serverless-firebase':
            instructions = `1. Make sure you have Firebase CLI installed.\n2. In your project, run 'npm install firebase'.\n3. In your code, import and initialize Firebase services:\n\n\`\`\`javascript\nimport { initializeApp } from "firebase/app";\nimport { getFirestore } from "firebase/firestore";\nimport { getAuth } from "firebase/auth";\n\nconst firebaseConfig = { ... }; // Your config\n\nconst app = initializeApp(firebaseConfig);\nconst db = getFirestore(app);\nconst auth = getAuth(app);\n\`\`\`\n\n4. For web apps, run:\n   cd ${defaultProjectName}\n   npm start`;
            break;
        default:
            instructions = `Consult the framework's documentation for next steps.`;
    }
    return instructions;
  };

  const getPlaceholder = (field, project) => {
    switch (field) {
      case 'sees':
        return project.id === 'react' ? 'e.g., They see competitors’ sleek UIs...' : 'e.g., They see complex platforms...';
      case 'hears':
        return project.id === 'react' ? 'e.g., They hear about slow-loading pages...' : 'e.g., They hear about data breaches...';
      case 'thinksFeels':
        return project.id === 'react' ? 'e.g., They think this will be hard to build...' : 'e.g., They feel limited by existing tools...';
      case 'saysDoes':
        return project.id === 'react' ? 'e.g., They say they want a simple UI...' : 'e.g., They say they need a secure backend...';
      case 'business':
        return 'e.g., To increase market share by 15%';
      case 'data':
        return 'e.g., To ensure data is encrypted at rest and in transit';
      case 'application':
        return 'e.g., To build a microservices architecture';
      case 'valueStream':
        return 'e.g., The customer journey from signup to purchase.';
      case 'businessCapability':
        return 'e.g., Online Payments, Inventory Management.';
      case 'businessProcess':
        return 'e.g., Fulfilling an order, handling a return.';
      case 'productModel':
        return 'e.g., Digital Product Model for our e-commerce platform.';
      case 'serviceOffering':
        return 'e.g., Standard Subscription Service, Premium Support Offering.';
      case 'informationObject':
        return 'e.g., User Data, Financial Records, Order History.';
      default:
        return '';
    }
  };

  // Updated function to generate a structured tree object
  const generateStructuredFileTree = (project) => {
    if (!project) return [];
    const { boilerplate, structure } = project;
    const projectRoot = {
      name: project.config.projectName || project.structure.split('/')[0],
      type: 'folder',
      children: [],
    };

    // A helper function to find or create folders recursively
    const findOrCreateFolder = (root, pathParts) => {
      let currentFolder = root;
      for (const part of pathParts) {
        if (part === '') continue;
        let nextFolder = currentFolder.children.find(child => child.name === part && child.type === 'folder');
        if (!nextFolder) {
          nextFolder = { name: part, type: 'folder', children: [] };
          currentFolder.children.push(nextFolder);
        }
        currentFolder = nextFolder;
      }
      return currentFolder;
    };

    // Add files from boilerplate
    for (const filePath in boilerplate) {
      const pathParts = filePath.split('/');
      const fileName = pathParts.pop();
      const folderPath = pathParts;
      const folder = findOrCreateFolder(projectRoot, folderPath);
      folder.children.push({
        name: fileName,
        type: 'file',
        content: boilerplate[filePath]
      });
    }

    // Add generic files and folders based on project type
    const isReact = project.id === 'react' || project.id === 'netlify-react';
    if (isReact) {
        const { projectName, language, testingFramework } = project.config;
        const isTs = language === 'typescript';
        const ext = isTs ? 'ts' : 'js';
        const testExt = testingFramework === 'jest' ? 'test.js' : 'spec.js';
        
        // Add additional common folders for React projects
        const srcFolder = findOrCreateFolder(projectRoot, ['src']);
        const componentsFolder = findOrCreateFolder(srcFolder, ['components']);
        const pagesFolder = findOrCreateFolder(srcFolder, ['pages']);
        const hooksFolder = findOrCreateFolder(srcFolder, ['hooks']);
        const utilsFolder = findOrCreateFolder(srcFolder, ['utils']);

        // Add boilerplate content for these files
        srcFolder.children.push({ name: `App.${isTs ? 'tsx' : 'jsx'}`, type: 'file', content: `import React from 'react';\n\nfunction App() { return <h1>Hello, ${projectName}!</h1>; }` });
        srcFolder.children.push({ name: `main.${ext}`, type: 'file', content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);` });

        // Add public folder and file
        const publicFolder = findOrCreateFolder(projectRoot, ['public']);
        publicFolder.children.push({ name: 'index.html', type: 'file', content: `<!DOCTYPE html>\n<html lang="en">\n<body>\n<div id="root"></div>\n</body>\n</html>` });

        // Add root files
        projectRoot.children.push({ name: 'README.md', type: 'file', content: `# ${projectName}` });

        if (testingFramework !== 'none') {
            const testsFolder = findOrCreateFolder(projectRoot, ['tests']);
            testsFolder.children.push({ name: `App.${testExt}`, type: 'file', content: `import { render, screen } from '@testing-library/react';\nimport App from '../src/App';\n\ntest('renders hello message', () => {\n  render(<App />);\n  expect(screen.getByText(/hello/i)).toBeInTheDocument();\n});` });
        }
    }

    return projectRoot.children;
};

  const toggleCollapse = (id) => {
    setCollapseState(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };
  
  const onSelectFile = (file) => {
    // Optionally handle file selection, e.g., show in a preview pane
    console.log('Selected file:', file.name);
  };

  const fileTreeData = selectedProject ? generateStructuredFileTree(selectedProject) : [];

  const filteredData = Object.keys(projectData).reduce((acc, category) => {
    acc[category] = projectData[category].filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      project.tip.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return acc;
  }, {});

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} font-inter`}>
      <header className={`p-6 flex justify-between items-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-300'} border-b`}>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Project Architecture Composer
        </h1>
        <div className="flex items-center space-x-4">
          <label className="switch">
            <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
            <span className="slider round"></span>
          </label>
          {user ? (
            <div className="flex items-center space-x-2">
              <img src={user.photoURL || 'https://placehold.co/40x40/555/FFF?text=U'} alt="User profile" className="w-8 h-8 rounded-full" />
              <span className="text-sm">Hello, {user.displayName || 'User'}!</span>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-grow overflow-hidden">
        {/* Left Sidebar - Catalog */}
        <div className={`w-1/4 p-4 border-r ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-100'} overflow-y-auto`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Catalog</h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setRoadmap('safe')}
              className="w-full text-left p-3 rounded-lg font-medium bg-green-600 hover:bg-green-500 transition-colors duration-200"
            >
              Start with SAFe Roadmap
            </button>
            <button
              onClick={() => setRoadmap(null)}
              className="w-full text-left p-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 transition-colors duration-200"
            >
              Start New Project
            </button>
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>CSDM Integration</h3>
              <div className="flex items-center">
                <span className={`mr-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Off</span>
                <label className="switch">
                  <input type="checkbox" checked={isCSDMEnabled} onChange={() => setIsCSDMEnabled(!isCSDMEnabled)} />
                  <span className="slider round"></span>
                </label>
                <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>On</span>
              </div>
            </div>
            {isCSDMEnabled && (
                <div className={`mt-2 p-2 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                    <label className={`flex flex-col text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Integration Type:
                        <select 
                            value={integrationType} 
                            onChange={(e) => setIntegrationType(e.target.value)}
                            className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="standalone">Standalone</option>
                            <option value="realtime">Real-time Integration</option>
                            <option value="differential">Differential Synchronization</option>
                        </select>
                    </label>
                </div>
            )}
            {Object.keys(filteredData).map(category => (
              <div key={category}>
                <h3 className={`text-lg font-medium capitalize mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {filteredData[category].map(project => (
                    <button
                      key={project.id}
                      onClick={() => addProjectToWorkspace(project)}
                      className={`flex flex-col items-center p-3 text-sm rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
                      style={{ color: isDarkMode ? 'white' : 'black' }}
                    >
                      <span className="text-2xl">{project.icon}</span>
                      <span className="mt-1 text-center">{project.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Workspace */}
        <div className={`flex-grow p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} overflow-y-auto`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>Workspace</h2>
            {user && (
              <div className="flex items-center space-x-2">
                <img src={user.photoURL || 'https://placehold.co/40x40/555/FFF?text=U'} alt="User profile" className="w-8 h-8 rounded-full" />
                <span className="text-sm">Hello, {user.displayName || 'User'}!</span>
                <span className="font-mono text-xs text-gray-500">{user.uid}</span>
              </div>
            )}
            {!user && (
              <button
                onClick={signInWithGoogle}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Sign in with Google
              </button>
            )}
          </div>
          {isLoading ? (
            <div className={`flex items-center justify-center h-full ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Loading...
            </div>
          ) : roadmap ? (
             <div className="space-y-4">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>SAFe Implementation Roadmap</h3>
                {SAFePhases.map(phase => (
                  <div key={phase.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>{phase.name}</h4>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{phase.tip}</p>
                    <ul className={`list-disc list-inside text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {phase.actions.map(action => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          ) : (
            <>
              <div className={`rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Enterprise-Ready Architecture with CSDM</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Enabling CSDM mode helps you design projects that are compliant, auditable, and ready for integration with enterprise systems like ServiceNow. It ensures your project is built on a solid foundation from the start.
                  </p>
                  <button
                      onClick={() => setIsCSDMEnabled(!isCSDMEnabled)}
                      className="mt-3 text-sm px-4 py-2 rounded-md transition-colors duration-200"
                      style={{ backgroundColor: isCSDMEnabled ? '#ef4444' : '#22c55e', color: 'white' }}
                  >
                      {isCSDMEnabled ? 'Disable CSDM Mode' : 'Enable CSDM Mode'}
                  </button>
              </div>
              <div className={`flex flex-wrap gap-4 min-h-[200px] border-2 border-dashed rounded-lg p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                {workspaceProjects.length === 0 ? (
                  <div className={`flex items-center justify-center w-full ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Drag or click a project from the catalog to get started.
                  </div>
                ) : (
                  workspaceProjects.map((project, index) => (
                    <div
                      key={project.instanceId}
                      ref={el => workspaceRefs.current[index] = el}
                      tabIndex="0"
                      onClick={() => setSelectedProject(project)}
                      className={`project-card relative p-4 rounded-lg cursor-pointer transition-transform duration-200 focus:outline-none focus:ring-4 ${
                        selectedProject?.instanceId === project.instanceId
                          ? `${isDarkMode ? 'bg-blue-600 ring-2 ring-blue-400 scale-105' : 'bg-blue-500 ring-2 ring-blue-300 scale-105'}`
                          : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`
                      }`}
                      style={{ color: isDarkMode ? 'white' : 'black' }}
                    >
                      <span className="text-3xl">{project.icon}</span>
                      <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{project.name}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {project.config.projectName || `Instance ${project.instanceId}`}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeProjectFromWorkspace(project.instanceId); }}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        aria-label={`Remove ${project.name} project`}
                      >
                        ×
                      </button>
                      <div className={`absolute bottom-1 left-1 right-1 h-1 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'}`}>
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${progress[project.instanceId]}%` }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
          <div className="mt-6 text-center flex justify-center gap-4">
            <button
              onClick={saveProject}
              className={`px-8 py-3 font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Save to Cloud
            </button>
            <button
              onClick={generateArchitecture}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-full shadow-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              Generate Architecture
            </button>
          </div>
        </div>

        {/* Right Sidebar - Configuration */}
        <div className={`w-1/4 p-4 border-l ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-100'} overflow-y-auto`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>Configuration</h2>
          {selectedProject ? (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedProject.name} Settings</h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Configure the goals for this part of your project.
              </p>
              <div className="flex flex-col gap-4">
                <label className={`flex flex-col text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Project Name:
                  <input
                    type="text"
                    value={selectedProject.config.projectName}
                    onChange={(e) => updateProjectConfig('projectName', e.target.value)}
                    placeholder={`e.g., my-${selectedProject.id}-app`}
                    className={`mt-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                  />
                </label>
                <label className={`flex flex-col text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Purpose (Triple S framework):
                  <textarea
                    value={selectedProject.config.purpose}
                    onChange={(e) => updateProjectConfig('purpose', e.target.value)}
                    placeholder="e.g., Helping small non-profits manage donations efficiently"
                    rows="3"
                    className={`mt-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                  />
                </label>
                <label className={`flex flex-col text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Impact (Empathy map):
                  <textarea
                    value={selectedProject.config.impact}
                    onChange={(e) => updateProjectConfig('impact', e.target.value)}
                    placeholder="e.g., Non-profits will save time and focus on their mission"
                    rows="3"
                    className={`mt-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                  />
                </label>
                <label className={`flex flex-col text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  First Small Step:
                  <input
                    type="text"
                    value={selectedProject.config.firstStep}
                    onChange={(e) => updateProjectConfig('firstStep', e.target.value)}
                    placeholder="e.g., Create a landing page component"
                    className={`mt-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                  />
                </label>
                 <div className="mt-4">
                    <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Empathy Map</h4>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      What do they SEE?:
                      <textarea
                        value={selectedProject.config.empathyMap?.sees}
                        onChange={(e) => updateProjectConfig('empathyMap', { ...selectedProject.config.empathyMap, sees: e.target.value })}
                        placeholder={getPlaceholder('sees', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      What do they HEAR?:
                      <textarea
                        value={selectedProject.config.empathyMap?.hears}
                        onChange={(e) => updateProjectConfig('empathyMap', { ...selectedProject.config.empathyMap, hears: e.target.value })}
                        placeholder={getPlaceholder('hears', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      What do they THINK & FEEL?:
                      <textarea
                        value={selectedProject.config.empathyMap?.thinksFeels}
                        onChange={(e) => updateProjectConfig('empathyMap', { ...selectedProject.config.empathyMap, thinksFeels: e.target.value })}
                        placeholder={getPlaceholder('thinksFeels', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      What do they SAY & DO?:
                      <textarea
                        value={selectedProject.config.empathyMap?.saysDoes}
                        onChange={(e) => updateProjectConfig('empathyMap', { ...selectedProject.config.empathyMap, saysDoes: e.target.value })}
                        placeholder={getPlaceholder('saysDoes', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                  </div>

                  <div className="mt-4">
                    <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Architectural Governance (TOGAF)</h4>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      Business Architecture:
                      <textarea
                        value={selectedProject.config.governance?.business}
                        onChange={(e) => updateProjectConfig('governance', { ...selectedProject.config.governance, business: e.target.value })}
                        placeholder={getPlaceholder('business', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      Data Architecture:
                      <textarea
                        value={selectedProject.config.governance?.data}
                        onChange={(e) => updateProjectConfig('governance', { ...selectedProject.config.governance, data: e.target.value })}
                        placeholder={getPlaceholder('data', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      Application Architecture:
                      <textarea
                        value={selectedProject.config.governance?.application}
                        onChange={(e) => updateProjectConfig('governance', { ...selectedProject.config.governance, application: e.target.value })}
                        placeholder={getPlaceholder('application', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                  </div>
                {isCSDMEnabled && (
                  <div className="mt-4">
                    <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>CSDM Integration</h4>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      Value Stream (Foundation):
                      <textarea
                        value={selectedProject.config.csdm.valueStream}
                        onChange={(e) => updateCSDMConfig('valueStream', e.target.value)}
                        placeholder={getPlaceholder('valueStream', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      Business Capability (Design):
                      <textarea
                        value={selectedProject.config.csdm.businessCapability}
                        onChange={(e) => updateCSDMConfig('businessCapability', e.target.value)}
                        placeholder={getPlaceholder('businessCapability', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      Business Process (Foundation):
                      <textarea
                        value={selectedProject.config.csdm.businessProcess}
                        onChange={(e) => updateCSDMConfig('businessProcess', e.target.value)}
                        placeholder={getPlaceholder('businessProcess', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      Product Model (Ideation):
                      <textarea
                        value={selectedProject.config.csdm.productModel}
                        onChange={(e) => updateCSDMConfig('productModel', e.target.value)}
                        placeholder={getPlaceholder('productModel', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      Service Offering (Consumption):
                      <textarea
                        value={selectedProject.config.csdm.serviceOffering}
                        onChange={(e) => updateCSDMConfig('serviceOffering', e.target.value)}
                        placeholder={getPlaceholder('serviceOffering', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      Information Object (Design):
                      <textarea
                        value={selectedProject.config.csdm.informationObject}
                        onChange={(e) => updateCSDMConfig('informationObject', e.target.value)}
                        placeholder={getPlaceholder('informationObject', selectedProject)}
                        rows="2"
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      />
                    </label>
                  </div>
                )}
                {selectedProject.id.includes('react') && (
                  <div className="mt-4">
                    <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Developer Options</h4>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      Language:
                      <select
                        value={selectedProject.config.language}
                        onChange={(e) => updateProjectConfig('language', e.target.value)}
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                      </select>
                    </label>
                    <label className={`flex flex-col text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      Testing Framework:
                      <select
                        value={selectedProject.config.testingFramework}
                        onChange={(e) => updateProjectConfig('testingFramework', e.target.value)}
                        className={`mt-1 p-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-400 text-gray-900'}`}
                      >
                        <option value="none">None</option>
                        <option value="jest">Jest</option>
                        <option value="vitest">Vitest</option>
                        <option value="cypress">Cypress</option>
                      </select>
                    </label>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>File Tree</h4>
                {selectedProject && (
                  <FileTree 
                    data={fileTreeData} 
                    onSelectFile={() => {}} 
                    isDarkMode={isDarkMode}
                    collapseState={collapseState}
                    toggleCollapse={toggleCollapse}
                  />
                )}
              </div>
            </div>
          ) : (
            <p className={`text-gray-500 text-sm text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select a project in the workspace to configure its details.</p>
          )}
        </div>
      </main>

      {message && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-2xl font-bold text-green-400 mb-4">{message.title}</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{message.message}</p>
            {message.code && (
                <div className="mt-4 p-4 bg-gray-900 rounded-md text-sm text-gray-200 whitespace-pre-wrap">
                    {message.code}
                </div>
            )}
            <button
              onClick={closeMessage}
              className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showHowToUseModal && (
        <HowToUseModal isOpen={showHowToUseModal} onClose={() => setShowHowToUseModal(false)} />
      )}
    </div>
  );
}