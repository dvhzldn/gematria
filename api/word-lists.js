import fs from "fs";
import path from "path";

const dictionariesPath = path.join(process.cwd(), "dictionaries");

export default function handler(req, res) {
	try {
		const files = fs
			.readdirSync(dictionariesPath)
			.filter((file) => file.endsWith(".txt"))
			.map((file) => path.basename(file, ".txt"));
		res.status(200).json({ wordLists: files });
	} catch (err) {
		console.error("Error reading dictionaries folder:", err);
		res.status(500).json({ error: "Could not retrieve word lists." });
	}
}
