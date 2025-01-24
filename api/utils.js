const gematriaMap = {};
for (let i = 0; i < 26; i++) {
	gematriaMap[String.fromCharCode(65 + i)] = i + 1;
}

export const calculateGematria = (word) => {
	return word
		.toUpperCase()
		.split("")
		.reduce((sum, char) => sum + (gematriaMap[char] || 0), 0);
};
