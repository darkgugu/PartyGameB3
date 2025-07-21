import '../../assets/css/QuizCapitals.css'
import { capitalData } from './data/capitals'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const QuizCapitals = ({ room, state }) => {
	const [quizData, setQuizData] = useState([])
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [answers, setAnswers] = useState([])

	const numberOfQuestions = 20

	const calculateScore = (answers) => {
		return answers.reduce((score, ans) => score + (ans.correct ? 50 : 0), 0)
	}

	useEffect(() => {
		const seedToArray = (seed) => {
			return seed.split('/').map((seq) => seq.split('.').map(Number))
		}

		const generateQuiz = (quizSeed, data, questionQuantity) => {
			const quizData = []
			for (let i = 0; i < questionQuantity; i++) {
				const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5)
				quizData.push({
					question: data[quizSeed[i][0]].country,
					answer: data[quizSeed[i][0]].capital,
					choices: [
						data[quizSeed[i][order[0]]].capital,
						data[quizSeed[i][order[1]]].capital,
						data[quizSeed[i][order[2]]].capital,
						data[quizSeed[i][order[3]]].capital,
					],
				})
			}
			return quizData
		}

		const quizSeedArray = seedToArray(state.quizSeed)
		console.log('Quiz Seed Array:', quizSeedArray)

		const quiz = generateQuiz(quizSeedArray, capitalData, numberOfQuestions)
		console.log('Generated Quiz:', quiz)

		setQuizData(quiz)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div className="QuizCapitals">
			<ToastContainer position="bottom-right" autoClose={2500} />
			{currentQuestionIndex < quizData.length ? (
				<div>
					{quizData.map(
						(question, index) =>
							currentQuestionIndex === index && (
								<div key={index} className="active-question">
									<div className="question-header">
										<div className="question-text">
											Quelle est la capitale de ce pays :{' '}
											<span>{question.question}</span>
										</div>
										<span className="question-number">
											Question N°{index + 1}
										</span>
									</div>

									<div className="choices">
										{question.choices.map((choice, i) => (
											<label
												key={i}
												style={{
													display: 'block',
													margin: '8px 0',
												}}
											>
												<input
													type="radio"
													name={`question-${index}`}
													value={choice}
												/>
												{choice}
											</label>
										))}
									</div>
									<button
										onClick={() => {
											const selectedChoice =
												document.querySelector(
													`input[name="question-${index}"]:checked`,
												)
											if (selectedChoice) {
												const answer =
													selectedChoice.value
												setAnswers((prev) => [
													...prev,
													{
														question:
															question.question,
														answer,
														correct:
															answer ===
															question.answer,
													},
												])
											} else {
												toast.error(
													'Vous devez sélectionner une réponse !',
												)
												return
											}
											setCurrentQuestionIndex(
												currentQuestionIndex + 1,
											)
										}}
									>
										Next question
									</button>
								</div>
							),
					)}
				</div>
			) : (
				<div className="results">
					<h2>Score : {calculateScore(answers)}</h2>
					<div className="results-box">
						<ul>
							{answers.map((ans, idx) => (
								<li className="result-item" key={idx}>
									<p>
										Question {idx + 1}: Quelle est la
										capitale de ce pays : {ans.question} ?
									</p>
									<p>
										Votre réponse:{' '}
										<strong>{ans.answer}</strong>
									</p>
									<p>
										{ans.correct ? (
											<span style={{ color: 'green' }}>
												Correct !
											</span>
										) : (
											<span style={{ color: 'red' }}>
												Faux. La bonne réponse était{' '}
												<strong>
													{quizData[idx].answer}
												</strong>
											</span>
										)}
									</p>
								</li>
							))}
						</ul>
					</div>
					<button
						onClick={() => {
							room.send('finished', {
								score: calculateScore(answers),
							})
						}}
					>
						Quitter le minijeu
					</button>
				</div>
			)}
		</div>
	)
}
