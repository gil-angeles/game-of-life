# Game of Life - React/Vite Frontend

This project is a front-end implementation of Conway’s Game of Life built with React + TypeScript + Vite

## Getting Started

`npm install`

`npm run dev`

To run tests:
`npm run test`

## Rules followed

Each cell is either alive (1) or dead (0).
Every generation, all cells update at the same time based on these rules:

1. Underpopulation

A live cell with fewer than 2 live neighbours → dies.

2. Survival

A live cell with 2 or 3 live neighbours → stays alive.

3. Overpopulation

A live cell with more than 3 live neighbours → dies.

4. Reproduction

A dead cell with exactly 3 live neighbours → becomes alive.

5. Outside the grid
   Any cell outside the grid → always dead

### Update Process (Each Generation)

All cells are updated simultaneously:

1. Count live neighbours
2. Apply the 4 rules
3. Build a new board
4. That new board becomes the current generation

## Tech Stack

- React 18 + TypeScript
- Vite (build/dev server)
- Tailwind CSS (via @tailwindcss/vite plugin)
- Vitest + React Testing Library + @testing-library/jest-dom (unit tests)
- localStorage (persistence of board states)
