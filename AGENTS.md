# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this repository.

## Project Overview

This is a vanilla HTML/CSS/JavaScript web project featuring interactive browser games. The project consists of:
- **index.html**: Main landing page with game navigation (Chinese Traditional)
- **game1.html**: Cartoon racing game with canvas-based graphics
- **game2.html**: Tic-tac-toe game with modern UI
- **game3.html**: Strategy battle game with fortress mechanics
- Pure vanilla JavaScript (no frameworks, no build tools)
- Git version control

## Build and Development Commands

Since this is a vanilla web project, there are no build commands. Development workflow:

### Local Development
```bash
# Serve the project locally (if you have a simple HTTP server)
python -m http.server 8000
# or
npx serve .
# or open index.html directly in browser
```

### Linting and Validation
```bash
# HTML validation (use online W3C validator)
# No local linting tools configured

# CSS validation (use online CSS validator)
# No local CSS linting configured

# JavaScript validation (use browser console)
# No ESLint or similar tools configured
```

### Git Commands
```bash
# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main
```

## Code Style Guidelines

### HTML Structure
- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- Include proper DOCTYPE and meta tags
- Use descriptive class and ID names in English
- Follow accessibility best practices (alt tags, ARIA labels where needed)

### CSS Styling
- Use CSS custom properties (variables) for colors and repeated values
- Follow mobile-first responsive design principles
- Use flexbox or grid for layouts
- Organize styles logically: variables, base styles, components, utilities
- Use consistent naming conventions (kebab-case for classes)
- Add comments for complex animations or layouts

### JavaScript
- Use modern ES6+ syntax when appropriate (const/let, arrow functions, template literals)
- Follow consistent indentation (4 spaces preferred)
- Use descriptive variable and function names in camelCase
- Add JSDoc comments for complex functions
- Handle errors gracefully with try-catch blocks
- Use event delegation for dynamic content
- Use `requestAnimationFrame` for game loops
- Store DOM references in variables for performance
- Use consistent naming for game objects (playerCar, enemyCars, etc.)

### Game Development Patterns
- Use canvas for 2D graphics rendering
- Implement game states (menu, playing, paused, game over)
- Use keyboard and touch event handlers for controls
- Implement collision detection algorithms
- Use CSS transforms and transitions for UI animations
- Store game state in objects for maintainability
- Use `setInterval` and `setTimeout` sparingly in favor of `requestAnimationFrame`

### File Organization
- Keep related files together
- Use descriptive filenames (kebab-case)
- Separate concerns: HTML for structure, CSS for styling, JS for behavior
- Consider creating separate CSS files for large components

### Import/Dependency Management
- No external dependencies or package managers
- Use CDN links for external fonts (Google Fonts)
- All JavaScript is inline in HTML files
- No module system - everything runs in global scope

## Testing

Since this is a frontend project without a testing framework:

### Manual Testing
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile devices and different screen sizes
- Check all interactive elements work as expected
- Verify accessibility with screen readers

### Validation
- Validate HTML with W3C validator
- Check CSS for syntax errors
- Test JavaScript console for errors

### Running Single Tests
No automated test framework is configured. To test individual games:
```bash
# Open specific game directly in browser
open game1.html  # Racing game
open game2.html  # Tic-tac-toe
open game3.html  # Strategy battle
```

## Git Workflow

### Commit Message Style
- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Reference files when relevant: "Fix game1.html animation"

### Branch Strategy
- Work on main branch for this simple project
- Create feature branches for larger changes if needed

## Common Tasks

### Adding New Game/Feature
1. Create new HTML file (e.g., game4.html)
2. Copy structure from existing games
3. Update navigation in index.html if needed
4. Test thoroughly
5. Commit changes

### Updating Styles
1. Modify CSS in the relevant HTML file or extract to separate CSS file
2. Test across different screen sizes
3. Check for breaking changes in existing components

### Bug Fixes
1. Identify the issue in browser dev tools
2. Fix the code
3. Test the fix doesn't break other functionality
4. Commit with descriptive message

### Game-Specific Patterns
- **Racing Game (game1.html)**: Canvas-based, uses requestAnimationFrame, collision detection
- **Tic-Tac-Toe (game2.html)**: Grid-based, state management, win condition checking
- **Strategy Game (game3.html)**: Turn-based, fortress mechanics, player panels

## Tools and Resources

### Recommended Extensions
- Live Server for local development
- Prettier for code formatting
- ESLint for JavaScript linting
- HTML/CSS support extensions

### Browser Dev Tools
- Use Elements panel for HTML/CSS debugging
- Use Console for JavaScript debugging
- Use Network panel for performance analysis
- Use Lighthouse for accessibility and performance audits

## Security Considerations

- Validate any user input
- Use HTTPS for production
- Be cautious with third-party CDNs
- Keep dependencies updated if any are added

## Performance Guidelines

- Optimize images and assets
- Minimize HTTP requests
- Use efficient CSS selectors
- Defer non-critical JavaScript
- Test loading performance

## When to Add Build Tools

Consider adding build tools when:
- Project grows beyond 10-15 files
- Need CSS preprocessing (Sass/LESS)
- Want to use modern JavaScript (Babel)
- Need automated testing
- Require optimization for production

For now, keep it simple and maintain the vanilla web approach.

## Language and Localization
- Primary language: Chinese Traditional (zh-TW)
- Some files use zh-HK (game3.html)
- UI text should be in Traditional Chinese characters
- Code comments and variable names should be in English
- Maintain consistency in language usage across similar games