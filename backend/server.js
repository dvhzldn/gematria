const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5006;
const dictionariesPath = path.join(__dirname, "dictionaries");

app.use(cors());
app.use(bodyParser.json());

// Utility function to load words from a file
const loadWords = (filePath) => {
	return fs
		.readFileSync(filePath, "utf-8")
		.split("\n")
		.map((word) => word.trim().toUpperCase())
		.filter((word) => /^[A-Z]+$/.test(word));
};

// Load theme-specific dictionaries
const themesDir = path.join(__dirname, "themes");
const themeDictionaries = {};

fs.readdirSync(themesDir).forEach((file) => {
	const themeName = path.basename(file, ".txt").toLowerCase();
	themeDictionaries[themeName] = loadWords(path.join(themesDir, file));
});

// Simple Gematria mapping (A=1, B=2, ..., Z=26)
const gematriaMap = {};
for (let i = 0; i < 26; i++) {
	gematriaMap[String.fromCharCode(65 + i)] = i + 1;
}

// Calculate Gematria score for a word
const calculateGematria = (word) => {
	return word
		.toUpperCase()
		.split("")
		.reduce((sum, char) => sum + (gematriaMap[char] || 0), 0);
};

// Generate phrases with theme prioritization
const generatePhrasesStream = (
	targetScore,
	maxWords,
	res,
	theme,
	wordListFilePath
) => {
	console.log("Generating phrases for score:", targetScore, "\n");

	res.writeHead(200, {
		"Content-Type": "application/json",
		"Transfer-Encoding": "chunked",
	});

	// Load the selected word list as the main dictionary
	const mainDictionary = loadWords(wordListFilePath);

	const themeWords = themeDictionaries[theme] || [];
	const wordPool = [...themeWords, ...mainDictionary];
	let phraseCount = 0;
	const maxPhrases = 50;

	// Generate a single unique phrase
	const generateUniquePhrase = () => {
		const usedWords = new Set();
		const phrase = [];
		let currentScore = 0;

		while (phrase.length < maxWords && currentScore < targetScore) {
			const availableWords = wordPool.filter(
				(word) =>
					!usedWords.has(word) &&
					currentScore + calculateGematria(word) <= targetScore
			);

			if (availableWords.length === 0) break;

			const nextWord =
				availableWords[Math.floor(Math.random() * availableWords.length)];
			phrase.push(nextWord.toLowerCase());
			currentScore += calculateGematria(nextWord);
			usedWords.add(nextWord);
		}

		if (currentScore !== targetScore) return null;
		return phrase.join(" ");
	};

	// Generate up to `maxPhrases`
	let attempts = 0;
	while (phraseCount < maxPhrases && attempts < 500) {
		// Prevent infinite loops
		const phrase = generateUniquePhrase();
		if (phrase) {
			console.log(phrase);
			res.write(JSON.stringify({ phrase }) + "\n");
			phraseCount++;
		}
		attempts++;
	}

	res.end();
};

// Endpoint to fetch available word list files
app.get("/word-lists", (req, res) => {
	try {
		const files = fs
			.readdirSync(dictionariesPath)
			.filter((file) => file.endsWith(".txt"))
			.map((file) => path.basename(file, ".txt"));
		res.json({ wordLists: files });
	} catch (err) {
		console.error("Error reading dictionaries folder:", err);
		res.status(500).json({ error: "Could not retrieve word lists." });
	}
});

// Endpoint to generate phrases
app.post("/generate-stream", (req, res) => {
	const { score, theme, wordList } = req.body;

	try {
		// Validate word list file
		if (!wordList) {
			return res.status(400).json({ error: "No word list selected." });
		}

		const wordListFilePath = path.join(dictionariesPath, `${wordList}.txt`);

		if (!fs.existsSync(wordListFilePath)) {
			return res
				.status(404)
				.json({ error: "Word list file '${wordList}.txt' not found" });
		}

		if (!score || isNaN(score)) {
			return res.status(400).json({ error: "Valid score is required" });
		}

		const selectedTheme = theme && themeDictionaries[theme] ? theme : null;

		generatePhrasesStream(
			Number(score),
			6,
			res,
			selectedTheme,
			wordListFilePath
		);
	} catch (error) {
		// Catch unexpected errors and log them
		console.error("Error in /generate-stream endpoint:", error);
		res.status(500).json({
			error: "An unexpected error occurred. Please try again later.",
		});
	}
});

// Endpoint to calculate score
app.post("/calculate", (req, res) => {
	const { phrase } = req.body;
	if (!phrase) return res.status(400).json({ error: "Phrase is required" });

	const score = calculateGematria(phrase);
	res.json({ score });
});

app.listen(PORT, () => {
	console.log(`\nServer running on http://localhost:${PORT}\n`);
});
