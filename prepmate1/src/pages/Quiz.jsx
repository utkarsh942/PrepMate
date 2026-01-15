import { useParams } from "react-router-dom";
import { topics } from "../data/parsedData";
import { useEffect, useState } from "react";
import Container from "../components/container";
import ResultDonut from "./CircularProgress";
import React from "react";

const settings =localStorage.getItem("prepmate-test-settings")
const Total_Time = settings?settings.time *60:10*60
const STORAGE_KEY = "prepmate-exam-state"

const Quiz = ({ mode }) => {
  const { topicId } = useParams();

  let questions = [];
  if(settings?.questionCount){
    questions = questions.slice(0,settings.questionCount)
  }

  if (mode === "all") {
    topics.forEach((t) => questions.push(...t.questions));
  } else {
    const topic = topics.find((t) => t.id === topicId);
    questions = topic.questions;
  }
   
  const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY))
  const [current, setCurrent] = useState(savedState?.current ?? 0)
  const [answers, setAnswers] = useState(
    savedState?.answers ?? new Array(questions.length).fill(null)
  )
  const [marked, setMarked] = useState(
    savedState?.marked ?? new Array(questions.length).fill(null)
  )
  const [questionTimes, setQuestionTimes] = useState(
  savedState?.questionTimes ?? new Array(questions.length).fill(0)
);

 
const [lastSwitchTime, setLastSwitchTime] = useState(Date.now());

  const [showSummary, setShowSummary] = useState(false)
  const [timeleft, setTimeleft] = useState(typeof savedState?.timeleft === "number" ? savedState.timeleft : Total_Time)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) return;
    if (timeleft === 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeleft((t) => t - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeleft, submitted]);

  useEffect(() => {
    if(submitted) return;

    const state = {
       current,
       answers,
       timeleft,
       marked,
       questionTimes,
    }
    localStorage.setItem(STORAGE_KEY , JSON.stringify(state));
  },[current, answers, marked, timeleft, submitted])
   
  const recordTimeSpent = (nextIndex) => {
  const now = Date.now();
  const diff = Math.floor((now - lastSwitchTime) / 1000);

  const newTimes = [...questionTimes];
  newTimes[current] += diff;

  setQuestionTimes(newTimes);
  setLastSwitchTime(now);

  if (typeof nextIndex === "number") {
    setCurrent(nextIndex);
  }
};

  const handleOptionSelect = (option) => {
    const newAnswers = [...answers]
    newAnswers[current] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
    recordTimeSpent(current + 1)
    }
  }

  const handlePrevious = () => {
    if (current > 0) {
      recordTimeSpent(current - 1)
    }
  }

  const toggleMark = () => {
    const newMarked = [...marked]
    newMarked[current] = !newMarked[current]
    setMarked(newMarked)
  }
  const handleSubmit = () => {
    localStorage.removeItem(STORAGE_KEY)
    recordTimeSpent();
    setSubmitted(true)
  }
  const getStatusColor = (i) => {
    if (marked[i]) return "bg-yellow-500";
    if (answers[i] !== null) return "bg-green-500";
    return "bg-red-500";
  }


  if (showSummary && !submitted) {
    const attempted = answers.filter((a) => a !== null).length;
    const markedCount = marked.filter(Boolean).length;
    const unattempted = questions.length - attempted;

    return (
      <Container>
        <h2 className="text-2xl font-bold mb-4">Test Summary</h2>

        <p>Attempted: {attempted}</p>
        <p>Unattempted: {unattempted}</p>
        <p>Marked for Review: {markedCount}</p>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => setShowSummary(false)}
            className="px-6 py-2 bg-gray-600 rounded"
          >
            Go Back
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-red-600 rounded"
          >
            Confirm Submit
          </button>
        </div>
      </Container>
    );
  }

  if (submitted) {
     const correct = answers.filter(
      (ans ,i) => ans === questions[i].answer
     ).length

     const unattempted = answers.filter((a) => a === null).length;
      const wrong = questions.length - correct - unattempted;
     const accuracy = Math.round((correct/questions.length)*100)

    return (
    <Container>
      <h2 className="text-3xl font-bold mb-8 text-center">
        🎉 Test Result Summary
      </h2>

    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

       
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-center items-center">
          <ResultDonut
            correct={correct}
            wrong={wrong}
            unattempted={unattempted}
            total={questions.length}
          />
        </div>

       
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center gap-4">

          <div className="flex justify-between text-lg">
            <span className="text-green-400"> Correct</span>
            <span>{correct}</span>
          </div>

          <div className="flex justify-between text-lg">
            <span className="text-yellow-400"> Unattempted</span>
            <span>{unattempted}</span>
          </div>

          <div className="flex justify-between text-lg">
            <span className="text-red-400"> Wrong</span>
            <span>{wrong}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-sm text-gray-400">Accuracy</p>
            <p className="text-4xl font-bold text-indigo-400">
              {accuracy}%
            </p>
          </div>
        </div>
      </div>

      
      <h3 className="text-2xl font-bold mb-4">
        📄 Detailed Solutions
      </h3>

      <div className="space-y-4">
        {questions.map((q, i) => {
          const isCorrect = answers[i] === q.answer;

          return (
            <div
              key={i}
              className={` relative p-5 rounded-xl border ${
                isCorrect
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
               <div className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-black/40 border border-white/10 text-gray-300 flex items-center gap-1">
   ⏱  : {questionTimes[i] ?? 0}sec
</div>

              <p className="font-semibold mb-2">
                Q{i + 1}. {q.question}
              </p>

              <p
                className={
                  isCorrect ? "text-green-400" : "text-red-400"
                }
              >
                Your Answer: {answers[i] ?? "Not Answered"}
              </p>

              {!isCorrect && (
                <p className="text-indigo-400">
                  Correct Answer: {q.answer}
                </p>
              )}
           
            </div>
          );
        })}
      </div>
    </Container>
  );
}
  const q = questions[current]

  const minutes = Math.floor(timeleft / 60)
  const seconds = timeleft % 60
  return (
    <Container>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Questions {current + 1} / {questions.length}
        </h2>

        <span className="px-4 py-1 rounded-full bg-red-500/10 text-green-400">
          ⏱ {minutes} : {seconds.toString().padStart(2, "0")}

        </span>
      </div>

      <div className="flex gap-6">

        <div className="w-48 grid grid-cols-4 gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              onClick={() => recordTimeSpent(i)}
              className={`w-10 h-10 text-sm rounded hover:cursor-pointer hover:border-solid hover:border-2 hover:border-indigo-600 flex justify-center items-center transition-all duration-200 ease-in-out  ${getStatusColor(
                i
              )}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="flex-1">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <p className="text-lg font-semibold mb-4">
              {q.question}
            </p>

            {q.options.map((op, idx) => (
              <label
                key={idx}
                className="block mb-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="option"
                  checked={answers[current] === op}
                  onChange={() => handleOptionSelect(op)}
                />{" "}
                {op}
              </label>
            ))}
          </div>


          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={current === 0}
              className="px-4 py-2 bg-gray-600 rounded disabled:opacity-50"
            >
              ⬅ Previous
            </button>

            <button
              onClick={toggleMark}
              className="px-4 py-2 bg-yellow-600 rounded"
            >
               Mark for Review
            </button>

            {current === questions.length - 1 ? (
              <button
                onClick={() => setShowSummary(true)}
                className="px-4 py-2 bg-green-600 rounded"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-indigo-600 rounded"
              >
                Save & Next ➡
              </button>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Quiz;