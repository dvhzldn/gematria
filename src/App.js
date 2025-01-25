import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PhraseGenerator from "./pages/PhraseGenerator";
import ScoreCalculator from "./pages/ScoreCalculator";
import WhatIsGematria from "./pages/WhatIsGematria";

function App() {
	return (
		<BrowserRouter>
			<Layout>
				<Routes>
					<Route path="/" element={<PhraseGenerator />} />
					<Route path="/score-calculator" element={<ScoreCalculator />} />
					<Route path="/what-is-gematria" element={<WhatIsGematria />} />
				</Routes>
			</Layout>
		</BrowserRouter>
	);
}

export default App;
