'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CHARACTERS } from '@/lib/constants';

type Answer = {
  text: string;
  character: 'observer' | 'planner' | 'saver';
};

const questions: Array<{ question: string; answers: Answer[] }> = [
  {
    question: "You just got paid. What's your first move?",
    answers: [
      { text: 'Divide it into categories — I like knowing where every peso goes', character: 'planner' },
      { text: "Check my balance and move on — I'll deal with it as I spend", character: 'observer' },
      { text: "Put some aside for something I'm saving for", character: 'saver' },
    ],
  },
  {
    question: 'It\'s the middle of the month. You want to buy something fun. What do you think?',
    answers: [
      { text: 'Let me check if my Fun budget still has room', character: 'planner' },
      { text: "I'll buy it and see where I stand at the end of the month", character: 'observer' },
      { text: 'Hmm, will this slow down my savings goal?', character: 'saver' },
    ],
  },
  {
    question: 'What would make you feel most in control of your money?',
    answers: [
      { text: 'Seeing exactly how much I can still spend in each area', character: 'planner' },
      { text: 'Understanding my spending patterns over time', character: 'observer' },
      { text: 'Watching my savings grow toward a target', character: 'saver' },
    ],
  },
  {
    question: 'What best describes your current money situation?',
    answers: [
      { text: 'I need structure to stop overspending', character: 'planner' },
      { text: "I honestly don't know where my money goes", character: 'observer' },
      { text: 'I have something specific I want to save for', character: 'saver' },
    ],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    observer: 0,
    planner: 0,
    saver: 0,
  });
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (character: string) => {
    const newScores = { ...scores, [character]: scores[character] + 1 };
    setScores(newScores);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const getRecommendedCharacter = () => {
    const entries = Object.entries(scores) as [string, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };

  const handleSelectRecommended = () => {
    const characterId = getRecommendedCharacter();
    sessionStorage.setItem('selectedCharacter', characterId);
    router.push('/onboarding/setup');
  };

  const handleBackToSelect = () => {
    router.push('/onboarding');
  };

  if (showResult) {
    const recommendedId = getRecommendedCharacter();
    const recommended = CHARACTERS[recommendedId];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-7xl mb-4">{recommended.icon}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                You're a {recommended.name}!
              </h2>
              <p className="text-lg text-gray-600">{recommended.tagline}</p>
            </div>

            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-700 mb-4">{recommended.description}</p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">You'll get:</span> {recommended.modules.join(', ')}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSelectRecommended}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start with {recommended.name}
              </button>
              <button
                onClick={handleBackToSelect}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                See all options
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors ${
                index <= currentQuestion ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {question.question}
          </h2>

          <div className="space-y-4">
            {question.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(answer.character)}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <span className="text-gray-700">{answer.text}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>
      </div>
    </div>
  );
}
