# Gematria Phrase Converter

## Live Demo

[https://gematria-generator.vercel.app/](gematria-generator.vercel.app)

## Short Description

The Gematria Phrase Converter is a simple, lightweight web application designed
to calculate the Simple Gematria score of any given word or phrase. Its core
functionality extends to generating and displaying a list of matching phrases
sourced from several extensive dictionary word lists that share the same
Gematria score.

## Key Features

- Phrase input: A dedicated text box for easy word or phrase input.
- Simple Gematria calculation: Immediate display of the calculated score based
  on Simple Gematria rules (A=1, B=2, ... Z=26).
- Word list selection: Ability to select from various dictionary word lists
  ([`20k.txt`](https://gist.github.com/eyturner/3d56f6a194f411af9f29df4c9d4a4e6e),
  [`google_10000.txt`](https://github.com/first20hours/google-10000-english),
  [`mit-10000-english.txt`](https://gist.github.com/pavloko/43f8d4bbaecbb03dc92e1964cbf13ba2),
  [`oxford_3000.txt`](https://github.com/sapbmw/The-Oxford-3000)) to generate
  matching phrases.
- Offensive content toggle: An option to filter out potentially sensitive or
  offensive words from the generated matching phrase list.
- Matching phrase display: Presents a dynamic list of words or phrases from the
  selected dictionary that match the calculated score.
- Informative About page: The `WhatIsGematria` page explains the methodology and
  background of Simple Gematria.

## Tech Stack

| Technology | Description                                 |
| ---------- | ------------------------------------------- |
| Build tool | Create React App (CRA) and `react-scripts`  |
| Front-end  | React component-based architecture          |
| Routing    | React Router DOM for client-side navigation |
| Icons      | `lucide-react`                              |
| Deployment | Vercel                                      |

## Getting Started

You can follow the instructions below to get a local copy of the project up and
running.

### Prerequisites

You will need **Node.js** and **npm** installed on your system.

### Installation

1.  Clone the repository:

```Bash

git clone https://gematria-phrase-converter-repo-url.git
cd gematria-phrase-converter-repo-url
```

(Note: Replace `gematria-phrase-converter-repo-url.git` with the actual GitHub
clone URL)

2.  Install dependencies:

```Bash

npm install
```

3.  Start the development server:

```Bash

npm start
```

The application will typically open in your browser at `http://localhost:3000`.

## Project Structure Overview

The project follows a standard Create React App (CRA) structure, enhanced by an
api directory for serverless functions (for `vercel` deployment) and a
`dictionaries` folder for data storage.

```text
/
├── .vercel/                  # Vercel deployment configuration
├── api/                      # Serverless functions (calculate, generate-stream, utils)
├── dictionaries/             # Plain text files for word lists
│   ├── 20k.txt
│   └── ...
├── public/                   # Static assets (index.html, favicon, manifest)
├── src/
│   ├── components/           # Reusable UI components (Header, Input, Buttons)
│   ├── pages/                # Route-specific components (ScoreCalculator, WhatIsGematria)
│   ├── App.js                # Main application component and routing setup
│   └── index.js              # Entry point for React DOM rendering
└── package.json              # Dependencies and scripts
```

## Contributing

This was a simple personal project, but feel free to fork the repository, make
improvements, and submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License.
