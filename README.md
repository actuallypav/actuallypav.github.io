ActuallyPav’s Terminal Portfolio
--------------------------------

### Overview
This project is an interactive **Ubuntu-style terminal emulator** built for the web, serving as a unique portfolio experience. Instead of a standard webpage, visitors can explore your work and information by typing commands into a simulated shell environment.

Live Demo: [pawelambrozy.com](https://pawelambrozy.com/)

### Features
- Realistic terminal UI with prompt, commands, and filesystem navigation.
- Basic Linux-like commands (`ls`, `cd`, `cat`, `clear`, etc.).
- Custom portfolio commands (projects, about, resume, quick links).
- Persistent state stored in `localStorage` (username, environment).
- Responsive design for desktop and mobile.
- Extensible architecture – new commands can be added easily.

### Getting Started

#### Prerequisites
- Any modern browser (Chrome, Firefox, Safari, Edge, Zen).

#### Usage

When you load the page:
You’ll be prompted for a username (defaults to "user" if left empty).
Type commands as you would in a normal terminal.

Example:
```bash
ls
cd projects
cat about.md
```

#### Available Commands
```bash
ls – List files in directory
cd <dir> – Change directory
cat <file> – Display file contents
help – Show available commands
about, info – Portfolio details
clear – Clear the terminal
```

#### Project Struccture
```bash
.
├── index.html         # Entry point
├── main.js            # Terminal initialization & state
├── commands/          # Individual command implementations
├── vfs.js             # Virtual filesystem definition
├── terminalContext.js # Terminal state management
├── style.css          # Styling
└── quicklinks/        # External links and shortcuts
```

License
MIT License. Free to use and modify.
