import { calculateGematria } from "./utils";

export default function handler(req, res) {
	if (req.method === "POST") {
		const { phrase } = req.body;
		if (!phrase) return res.status(400).json({ error: "Phrase is required" });

		const score = calculateGematria(phrase);
		res.json({ score });
	} else {
		res.status(405).json({ error: "Method Not Allowed" });
	}
}
