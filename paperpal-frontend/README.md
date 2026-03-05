# ðŸ“ Agent Paperpal - Frontend

AI-powered manuscript formatting tool for academic journals.

## ðŸš€ Quick Start

1. Install dependencies:
   \\\ash
   npm install
   \\\

2. Start development server:
   \\\ash
   npm start
   \\\

3. Build for production:
   \\\ash
   npm run build
   \\\

## ðŸ“ Project Structure

\\\
src/
â”œâ”€â”€ components/     # Reusable UI components
â”œâ”€â”€ pages/         # Page components
â”œâ”€â”€ hooks/         # Custom React hooks
â”œâ”€â”€ services/      # API and external services
â”œâ”€â”€ utils/         # Utility functions
â”œâ”€â”€ types/         # TypeScript type definitions
â”œâ”€â”€ context/       # React context providers
â”œâ”€â”€ redux/         # Redux store and slices
â”œâ”€â”€ styles/        # Global styles and themes
â””â”€â”€ assets/        # Static assets
\\\

## ðŸŽ¯ Features

- ðŸ“„ Upload manuscripts (DOCX, PDF, TXT)
- ðŸ“š Select from 10,000+ journal styles
- ðŸ¤– AI-powered formatting
- ðŸ“Š Compliance scoring
- ðŸ”„ Side-by-side comparison
- ðŸ“¥ Export formatted documents

## ðŸ› ï¸ Built With

- React 18
- TypeScript
- Redux Toolkit
- Tailwind CSS
- Axios
- React Dropzone

## ðŸ“ Environment Variables

Create a \.env\ file with:

\\\
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
\\\

## ðŸ§ª Testing

\\\ash
# Unit tests
npm test

# E2E tests
npm run cypress:open
\\\

## ðŸ“¦ Build

\\\ash
npm run build
\\\
