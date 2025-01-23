const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5006;

app.use(cors());
app.use(bodyParser.json());

// Utility function to load words from a file
const loadWords = (filePath) => {
	return fs
		.readFileSync(filePath, "utf-8")
		.split("\n")
		.map((word) => word.trim().toUpperCase())
		.filter((word) => /^[A-Z]+$/.test(word)); // Ensure only alphabetic words
};

// Load main dictionary
const mainDictionaryPath = path.join(__dirname, "oxford_3000.txt");
const mainDictionary = loadWords(mainDictionaryPath);

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
const generatePhrasesStream = (targetScore, maxWords, res, theme) => {
	console.log("Generating phrases for score:", targetScore, "\n");

	res.writeHead(200, {
		"Content-Type": "application/json",
		"Transfer-Encoding": "chunked",
	});

	const themeWords = themeDictionaries[theme] || [];
	const wordPool = [...themeWords, ...mainDictionary];
	const usedWords = new Set();

	let phraseCount = 0;
	const maxPhrases = 50;

	const generateUniquePhrase = () => {
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

	while (phraseCount < maxPhrases && wordPool.length > 0) {
		const phrase = generateUniquePhrase();
		if (phrase) {
			console.log(phrase, "\n");
			res.write(JSON.stringify({ phrase }) + "\n");
			phraseCount++;
		} else {
		}
	}

	res.end();
};

// Endpoint to generate phrases
app.post("/generate-stream", (req, res) => {
	const { score, theme } = req.body;

	if (!score || isNaN(score)) {
		return res.status(400).json({ error: "Valid score is required" });
	}

	const selectedTheme = theme && themeDictionaries[theme] ? theme : null;
	generatePhrasesStream(Number(score), 6, res, selectedTheme);
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
