import fs from "fs";
import path from "path";

const loadWords = (filePath) => {
	return fs
		.readFileSync(filePath, "utf-8")
		.split("\n")
		.map((word) => word.trim().toUpperCase())
		.filter((word) => /^[A-Z]+$/.test(word));
};

const loadThemeDictionaries = () => {
	const themesDir = path.join(process.cwd(), "themes");
	const themeDictionaries = {};

	if (fs.existsSync(themesDir)) {
		fs.readdirSync(themesDir).forEach((file) => {
			const themeName = path.basename(file, ".txt").toLowerCase();
			themeDictionaries[themeName] = loadWords(path.join(themesDir, file));
		});
	}

	return themeDictionaries;
};

const themeDictionaries = loadThemeDictionaries();

const gematriaMap = {};
for (let i = 0; i < 26; i++) {
	gematriaMap[String.fromCharCode(65 + i)] = i + 1;
}

const calculateGematria = (word) => {
	return word
		.toUpperCase()
		.split("")
		.reduce((sum, char) => sum + (gematriaMap[char] || 0), 0);
};

const generatePhrasesStream = (
	targetScore,
	maxWords,
	res,
	theme,
	wordListFilePath
) => {
	res.writeHead(200, {
		"Content-Type": "application/json",
		"Transfer-Encoding": "chunked",
	});

	const mainDictionary = loadWords(wordListFilePath);
	const themeWords = theme ? themeDictionaries[theme] || [] : [];
	const wordPool = [...themeWords, ...mainDictionary];
	let phraseCount = 0;
	const maxPhrases = 50;

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

	let attempts = 0;
	while (phraseCount < maxPhrases && attempts < 500) {
		const phrase = generateUniquePhrase();
		if (phrase) {
			res.write(JSON.stringify({ phrase }) + "\n");
			phraseCount++;
		}
		attempts++;
	}

	res.end();
};

export default function handler(req, res) {
	if (req.method === "POST") {
		const { score, theme, wordList } = req.body;
		try {
			if (!wordList) {
				return res.status(400).json({ error: "No word list selected." });
			}

			const wordListFilePath = path.join(
				process.cwd(),
				"dictionaries",
				`${wordList}.txt`
			);

			if (!fs.existsSync(wordListFilePath)) {
				return res
					.status(404)
					.json({ error: `Word list file '${wordList}.txt' not found` });
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
			res.status(500).json({
				error: "An unexpected error occurred. Please try again later.",
			});
		}
	} else {
		res.status(405).json({ error: "Method Not Allowed" });
	}
}
