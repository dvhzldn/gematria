import React, { useState, useEffect, useCallback } from "react";

const App = () => {
	const [phrase, setPhrase] = useState("");
	const [score, setScore] = useState(null);
	const [targetScore, setTargetScore] = useState("");
	const [generatedPhrases, setGeneratedPhrases] = useState([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [submittedPhrase, setSubmittedPhrase] = useState("");

	const apiUrl = process.env.REACT_APP_API_URL;

	const calculateScore = async () => {
		if (!phrase.trim()) {
			// Prevent submission of empty or whitespace-only phrases
			showAlert("Enter some text");
			return;
		}
		setGeneratedPhrases([]);
		setScore(null);
		setIsLoading(true);

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
			setTargetScore(data.score.toString());
			setSubmittedPhrase(phrase);
			setRefreshKey((prevKey) => prevKey + 1);
		} catch (error) {
			console.error("Error calculating score:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const showAlert = (message) => {
		const alertBox = document.createElement("div");
		alertBox.textContent = message;
		alertBox.style.position = "fixed";
		alertBox.style.top = "300px";
		alertBox.style.left = "50%";
		alertBox.style.transform = "translateX(-50%)";
		alertBox.style.backgroundColor = "#000";
		alertBox.style.color = "#fff";
		alertBox.style.padding = "10px 20px";
		alertBox.style.borderRadius = "8px";
		alertBox.style.textAlign = "center";
		alertBox.style.fontFamily = "'Poppins', Arial, sans-serif";
		alertBox.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
		alertBox.style.zIndex = 1000;
		alertBox.style.animation = "fadeOut 2s forwards";

		document.body.appendChild(alertBox);

		// Remove the alert after the animation
		setTimeout(() => {
			document.body.removeChild(alertBox);
		}, 2000);
	};

	const generatePhrases = useCallback(async () => {
		if (!targetScore || isNaN(targetScore)) {
			alert("Please enter a valid number for the target score.");
			return;
		}

		setGeneratedPhrases([]);

		try {
			const response = await fetch(`${apiUrl}/generate-stream`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					score: targetScore,
					theme: "offensive",
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
						const filteredPhrase = phrase
							.split(" ")
							.filter((word) => word.length > 0)
							.join(" ");
						setGeneratedPhrases((prevPhrases) => [
							...prevPhrases,
							filteredPhrase,
						]);
					} catch (error) {
						console.error("Error parsing JSON:", error);
					}
				}
			}
		} catch (error) {
			console.error("Error generating phrases:", error);
		}
	}, [targetScore, apiUrl]);

	useEffect(() => {
		if (targetScore && !isNaN(targetScore)) {
			generatePhrases();
		}
	}, [refreshKey, generatePhrases, targetScore]);

	useEffect(() => {
		if (generatedPhrases.length > 0) {
			document.getElementById("generatedPhrases").focus();
		}
	}, [generatedPhrases]);

	const handleClear = () => {
		setPhrase("");
		setScore(null);
		setTargetScore("");
		setGeneratedPhrases([]);
		setSubmittedPhrase("");
	};

	const handleKeyPress = (event, buttonClickHandler) => {
		if (event.key === "Enter") {
			event.preventDefault();
			buttonClickHandler();
		}
	};

	return (
		<main
			style={{
				padding: "20px",
				fontFamily: "'Poppins', Arial, sans-serif",
				maxWidth: "400px",
				margin: "0 auto",
			}}
		>
			<h1
				style={{
					textAlign: "center",
					fontSize: "3rem",
					fontWeight: "bold",
					color: "#cf4444",
					animation: "bounce 20s infinite",
				}}
			>
				Tom Unreal Numbers
			</h1>

			<style>
				{`
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-20px); }
      60% { transform: translateY(-10px); }
    }
  `}
			</style>

			<section>
				<div>
					<input
						id="phrase"
						type="text"
						value={phrase}
						onChange={(e) => setPhrase(e.target.value)}
						placeholder="Enter a word or phrase to be calculated"
						style={{
							fontFamily: "'Poppins', Arial, sans-serif",
							width: "95%",
							padding: "8px",
							marginBottom: "12px",
							borderRadius: "8px",
							border: "1px solid #000",
							boxShadow: "none",
							transition: "box-shadow 0.3s ease-in-out",
						}}
						onFocus={(e) =>
							(e.target.style.boxShadow = "0 0 8px #261173")
						}
						onBlur={(e) => (e.target.style.boxShadow = "none")}
						onKeyDown={(e) => handleKeyPress(e, calculateScore)}
					/>
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						gap: "10px",
					}}
				>
					<button
						onClick={calculateScore}
						style={{
							fontFamily: "'Poppins', Arial, sans-serif",
							flex: 1,
							padding: "10px",
							backgroundColor: "#34eb77",
							color: "white",
							border: "1px solid #000000",
							borderRadius: "8px",
							cursor: "pointer",
							fontSize: "1.5rem",
							transition: "all 0.1s ease-in-out",
						}}
						onMouseEnter={(e) =>
							(e.target.style.backgroundColor = "#05f75e")
						}
						onMouseLeave={(e) =>
							(e.target.style.backgroundColor = "#34eb77")
						}
					>
						Go
					</button>
					<button
						onClick={handleClear}
						style={{
							fontFamily: "'Poppins', Arial, sans-serif",
							flex: 1,
							padding: "10px",
							backgroundColor: "#cf4444",
							color: "white",
							border: "1px solid #000000",
							borderRadius: "8px",
							cursor: "pointer",
							fontSize: "1.5rem",
							transition: "all 0.1s ease-in-out",
						}}
						onMouseEnter={(e) =>
							(e.target.style.backgroundColor = "#000")
						}
						onMouseLeave={(e) =>
							(e.target.style.backgroundColor = "#cf4444")
						}
					>
						Reset
					</button>
				</div>
				{isLoading && <p></p>}
				{!isLoading && score !== null && (
					<div
						style={{
							display: "flex",
							justifyContent: "center",
						}}
					>
						<p
							style={{
								fontFamily: "'Poppins', Arial, sans-serif",
								fontSize: "1.2rem",
								fontWeight: "bolder",
								color: "#fff",
								backgroundColor: "rgba(52, 52, 52, 0.3)",
								border: "1px solid #000000",
								padding: "10px",
								borderRadius: "8px",
								textAlign: "center",
								animation: "bounceIn 1s ease-in-out",
							}}
						>
							{submittedPhrase && `${submittedPhrase} is ${score}`}
						</p>
					</div>
				)}
			</section>

			<section>
				<div
					id="generatedPhrases"
					tabIndex="-1"
					style={{ marginTop: "0px" }}
				>
					{generatedPhrases.length > 0 && (
						<div
							style={{
								padding: "1px",
								backgroundColor: "rgba(52, 52, 52, 0.3)",
								border: "1px solid #000000",
								borderRadius: "8px",
								marginLeft: "0px",
								marginRight: "0px",
							}}
						>
							<h5
								style={{
									color: "#fff",
									textAlign: "center",
									textDecorationLine: "Underline",
									padding: "0",
									marginBottom: "0",
									marginTop: "2px",
								}}
							>
								Matching phrases:
							</h5>
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
											fontFamily: "'Poppins', Arial, sans-serif",
											color: "#fff",
											padding: "2px",
											textAlign: "center",
											marginBottom: "2px",
											fontWeight: "lighter",
											fontSize: "0.9rem",
											animation: "fadeIn 0.1s ease-in-out",
											animationDelay: `${index * 0.05}s`,
											animationFillMode: "both",
										}}
									>
										{phrase}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</section>
		</main>
	);
};

export default App;
