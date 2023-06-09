# Jay Language Code Highlighting Extension

This project was completed as part of a Master's Research Project at Johns Hopkins University.
Author: Simon Allocca.

## Added functionality

Added semantic token capability through an Ohm JavaScript parser (https://ohmjs.org/) to parse text and generate an AST (Abstract Syntax Tree) and associated semantic tokens with certain language constructs. The parser was made based on a Menhir OCaml parser created for a Jay language used in a research lab. This parser code can be found in the repo https://github.com/JHU-PL-Lab/jaylang at the path '/src/lang-jay/parser'.  

## Structure

```
.
├── client // Language Client
│   ├── src
│   │   ├── test // End to End tests for Language Client / Server
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

## Running the Sample

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to start compiling the client and server in [watch mode](https://code.visualstudio.com/docs/editor/tasks#:~:text=The%20first%20entry%20executes,the%20HelloWorld.js%20file.).
- Switch to the Run and Debug View in the Sidebar (Ctrl+Shift+D).
- Select `Launch Client` from the drop down (if it is not already).
- Press ▷ to run the launch config (F5).
- In the [Extension Development Host](https://code.visualstudio.com/api/get-started/your-first-extension#:~:text=Then%2C%20inside%20the%20editor%2C%20press%20F5.%20This%20will%20compile%20and%20run%20the%20extension%20in%20a%20new%20Extension%20Development%20Host%20window.) instance of VSCode, open a document with the extension '.jay'.
  - After writing a valid Jay language file, the text will be highlighted with informative coloring.
