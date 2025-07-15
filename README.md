# Largence - Full Stack Document Editor

A modern, full-stack document editing application built with Next.js, TypeScript, and MongoDB, featuring a rich text editor.


## Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 18 or higher)
- **npm** or **yarn**

## Installation

### 1. Clone the Repository
```bash
git clone <https://github.com/LARGENCE-LTD/LargenceFullStack.git>
cd LargenceFullStack
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # Reusable UI components
│   ├── dashboard/         # Dashboard pages
│   ├── home/             # Main application pages
│   └── landing/          # Landing page
├── components/            # TipTap editor components
├── contexts/             # React contexts for state management
├── database/             # Database configuration
├── helpers/              # Utility functions
├── hooks/                # Custom React hooks
├── lib/                  # Library configurations
└── models/               # Database models
```

## Troubleshooting

### Common Issues

#### 1. npm install fails with permission errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

#### 2. Next.js module not found error
```bash
# Reinstall Next.js
npm uninstall next && npm install next@latest
```

## Dependencies

### Core Dependencies
- **Next.js 15.3.4** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **MongoDB/Mongoose** - Database
- **TipTap** - Rich text editor
- **Tailwind CSS** - Styling

### Key Libraries
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client
- **Lucide React** - Icons


---