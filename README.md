# RagIT AI - RAG Configuration Generator

RagIT AI is an intelligent web application that helps users design and configure Retrieval-Augmented Generation (RAG) systems through an intuitive, step-by-step interface. It analyzes project requirements and automatically generates optimized multi-agent RAG configurations.

![RagIT AI Interface](screenshots/main-interface.png)

## Features

- 🧙‍♂️ **Intelligent RAG Configuration**: Automatically generates optimized RAG agent configurations based on project requirements
- 🎯 **Step-by-Step Wizard**: Intuitive configuration wizard for project description intake
- 🔄 **Interactive Agent Flow**: Visual representation of agent interactions and data flows
- ⚡ **Real-time Updates**: Dynamic configuration updates and immediate feedback
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- 🔐 **Secure & Scalable**: Built with security and extensibility in mind

## Tech Stack

- **Frontend**:
  - React with TypeScript
  - TanStack Query for data fetching
  - Framer Motion for animations
  - Tailwind CSS & shadcn/ui for styling
  - React Flow for agent interaction visualization
  - Wouter for routing

- **Backend**:
  - Express.js server
  - In-memory storage (easily extensible to databases)
  - RESTful API architecture

## Screenshots

### Landing Page
![Landing Page](screenshots/landing.png)
*Beautiful landing page with step-by-step project configuration*

### Agent Configuration
![Agent Configuration](screenshots/config.png)
*Interactive agent configuration with detailed rationale*

### Agent Flow Visualization
![Agent Flow](screenshots/flow.png)
*Visual representation of agent interactions*

## Local Development Setup

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Git

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ragit-ai.git
cd ragit-ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

### Project Structure

```
ragit-ai/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── lib/        # Utility functions and configurations
│   │   ├── pages/      # Page components
│   │   └── hooks/      # Custom React hooks
├── server/              # Backend Express server
│   ├── storage.ts      # Storage implementation
│   └── routes.ts       # API routes
├── shared/             # Shared types and utilities
└── public/             # Static assets
```

## Architecture Overview

RagIT AI follows a modern web application architecture:

1. **Frontend Layer**:
   - React components for UI
   - TanStack Query for data management
   - Framer Motion for animations
   - React Flow for agent visualization

2. **Backend Layer**:
   - Express.js server
   - RESTful API endpoints
   - In-memory storage (extensible)

3. **Data Flow**:
   - User input → Project requirements
   - Requirements analysis → Agent configuration
   - Configuration → Visual representation
   - Real-time updates and feedback

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use provided shadcn components
- Maintain consistent code style
- Write meaningful commit messages
- Add tests for new features

## License

MIT License - feel free to use and modify according to your needs!
