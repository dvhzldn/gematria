import React, { useState, useEffect, useCallback } from "react";

const App = () => {
	const [phrase, setPhrase] = useState("");
	const [score, setScore] = useState(null);
	const [targetScore, setTargetScore] = useState("");
	const [selectedTheme, setSelectedTheme] = useState("none");
	const [generatedPhrases, setGeneratedPhrases] = useState([]);
	const [refreshKey, setRefreshKey] = useState(0); // New state to force re-generation of phrases

	const apiUrl = process.env.REACT_APP_API_URL; // this might change if the environment variable changes

	const calculateScore = async () => {
		// Reset generated phrases and score when recalculating
		setGeneratedPhrases([]);
		setScore(null);

		try {
			const response = await fetch(`${apiUrl}/calculate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ phrase }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			setScore(data.score);

			// Set the calculated score and trigger a re-run for phrase generation
			setTargetScore(data.score.toString());

			// Force refresh key change to trigger phrase generation
			setRefreshKey((prevKey) => prevKey + 1);
		} catch (error) {
			console.error("Error calculating score:", error);
		}
	};

	// Wrap the generatePhrases function with useCallback and include apiUrl in the dependency array
	const generatePhrases = useCallback(async () => {
		if (!targetScore || isNaN(targetScore)) {
			alert("Please enter a valid number for the target score.");
			return;
		}

		setGeneratedPhrases([]); // Reset generated phrases before generating new ones

		try {
			const response = await fetch(`${apiUrl}/generate-stream`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					score: targetScore,
					theme: selectedTheme === "none" ? null : selectedTheme,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });

				const lines = buffer.split("\n");
				buffer = lines.pop();

				for (const line of lines) {
					if (line.trim() === "") continue;
					try {
						const phrase = JSON.parse(line).phrase;
						setGeneratedPhrases((prevPhrases) => [
							...prevPhrases,
							phrase,
						]);
					} catch (error) {
						console.error("Error parsing JSON:", error);
					}
				}
			}
		} catch (error) {
			console.error("Error generating phrases:", error);
		}
	}, [targetScore, selectedTheme, apiUrl]); // Include apiUrl in the dependency array

	// Automatically generate phrases when refreshKey changes (forced rerun)
	useEffect(() => {
		if (targetScore && !isNaN(targetScore)) {
			generatePhrases();
		}
	}, [refreshKey, generatePhrases]); // Trigger re-generation every time refreshKey changes

	useEffect(() => {
		if (generatedPhrases.length > 0) {
			document.getElementById("generatedPhrases").focus();
		}
	}, [generatedPhrases]);

	// Event handler to trigger button click on Enter key press
	const handleKeyPress = (event, buttonClickHandler) => {
		if (event.key === "Enter") {
			event.preventDefault();
			buttonClickHandler(); // Trigger button click handler
		}
	};

	return (
		<main
			style={{
				padding: "20px",
				fontFamily: "Arial, sans-serif",
				maxWidth: "600px",
				margin: "0 auto",
			}}
		>
			<h1 style={{ textAlign: "center" }}>Simple Gematria Calculator</h1>

			<section>
				<h2>Calculate Gematria Score</h2>
				<div>
					<label htmlFor="phrase" style={{ fontSize: "1.2rem" }}>
						Enter a phrase:
					</label>
					<br />
					<span
						id="phrase-helper"
						style={{
							fontSize: "0.9rem",
							color: "#777",
							fontStyle: "italic",
						}}
					>
						Use English words to calculate the Gematria score.
					</span>

					<span>
						<input
							id="phrase"
							type="text"
							value={phrase}
							onChange={(e) => setPhrase(e.target.value)}
							placeholder="Enter a phrase"
							aria-describedby="phrase-helper"
							aria-required="true"
							style={{
								width: "97%",
								padding: "8px",
								marginBottom: "12px",
								borderRadius: "4px",
								border: "1px solid #ccc",
							}}
							// Add key press event listener to trigger button click on Enter key
							onKeyDown={(e) => handleKeyPress(e, calculateScore)}
						/>
					</span>
				</div>
				<div>
					<label htmlFor="theme">Choose a topic:</label>
					<select
						id="topic"
						value={selectedTheme}
						onChange={(e) => setSelectedTheme(e.target.value)}
						aria-labelledby="topic"
						style={{
							width: "100%",
							padding: "8px",
							marginBottom: "12px",
							borderRadius: "4px",
							border: "1px solid #ccc",
						}}
					>
						<option value="none">None</option>
						<option value="comedy">Comedy</option>
						<option value="politics">Politics</option>
						<option value="music">Music</option>
					</select>
					<br />
				</div>
				<button
					onClick={calculateScore}
					aria-label="Calculate Gematria Score"
					style={{
						width: "100%",
						padding: "10px",
						backgroundColor: "#005A8E",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
						fontSize: "1.5rem",
					}}
				>
					Calculate score
				</button>
				<p
					role="status"
					aria-live="polite"
					style={{
						fontSize: "1.2rem", // Larger font for visibility
						fontWeight: "bold", // Additional emphasis
						color: "#0D47A1", // Accessible dark blue
						backgroundColor: "#E3F2FD", // Light blue for subtle contrast
						padding: "10px",
						borderRadius: "8px",
						textAlign: "center",
						border: "1px solid #0D47A1", // Outline for better separation
					}}
				>
					{score !== null
						? `Gematria Score: ${score}`
						: "No score calculated yet."}
				</p>
			</section>
			{/* <h2>Generate Phrases by Score</h2>
			<div>
				<span>
					<label htmlFor="targetScore" style={{ fontSize: "1.2rem" }}>
						Enter a target score:
					</label>
					<br />
					<span
						id="target-score-helper"
						style={{
							fontSize: "0.9rem",
							color: "#777",
							fontStyle: "italic",
						}}
					>
						Provide a numerical score to generate phrases matching that
						value.
					</span>
					<input
						id="targetScore"
						type="number"
						value={targetScore}
						onChange={(e) => setTargetScore(e.target.value)}
						placeholder="Enter a target score"
						aria-describedby="target-score-helper"
						aria-required="true"
						style={{
							width: "97%",
							padding: "8px",
							marginBottom: "12px",
							borderRadius: "4px",
							border: "1px solid #ccc",
						}}
						// Trigger generatePhrases on Enter key press
						onKeyDown={(e) => handleKeyPress(e, generatePhrases)}
					/>
				</span>
			</div>
			<button
				onClick={generatePhrases}
				aria-label="Generate phrases by score"
				style={{
					width: "100%",
					padding: "10px",
					backgroundColor: "#4CAF50",
					color: "white",
					border: "none",
					borderRadius: "4px",
					cursor: "pointer",
					fontSize: "1.5rem",
				}}
			>
				Generate phrases
			</button> */}
			<section>
				<div
					id="generatedPhrases"
					tabIndex="-1"
					style={{ marginTop: "20px" }}
				>
					{generatedPhrases.length > 0 ? (
						<div
							style={{
								padding: "10px",
								backgroundColor: "#E8F5E9", // Light green background
								border: "1px solid #1B5E20", // Dark green border for clear separation
								borderRadius: "8px",
							}}
						>
							<h3
								style={{
									fontSize: "1.2rem",
									color: "#1B5E20", // Dark green for header text
									marginBottom: "10px",
									marginTop: "0",
									textAlign: "center",
								}}
							>
								Generated Phrases:
							</h3>
							<ul
								style={{
									listStyleType: "none",
									padding: "0",
									margin: "0",
								}}
							>
								{generatedPhrases.map((phrase, index) => (
									<li
										key={index}
										style={{
											backgroundColor: "#A5D6A7", // Soft green for phrase background
											color: "#004D40", // Dark teal for text contrast
											padding: "8px",
											marginBottom: "6px",
											borderRadius: "4px",
											fontSize: "1rem",
										}}
									>
										{phrase}
									</li>
								))}
							</ul>
						</div>
					) : (
						<p
							style={{
								padding: "10px",
								backgroundColor: "#E8F5E9", // Light green background for consistency
								border: "1px solid #1B5E20", // Dark green border
								borderRadius: "8px",
								fontWeight: "bold",
								fontSize: "1.2rem",
								color: "#004D40", // Dark teal text
								textAlign: "center",
							}}
						>
							{phrase === "" || score === null
								? "No phrases have been generated yet."
								: "No phrases found for the given score."}
						</p>
					)}
				</div>
			</section>
		</main>
	);
};

export default App;
