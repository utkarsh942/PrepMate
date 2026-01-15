import { useState } from "react";
import { useNavigate } from "react-router-dom"

const  TestSetup = () => {
const navigate = useNavigate()

const [difficulty ,setDifficulty] = useState("medium")
const [questionCount,setQuestionCount] = useState(20)
const[time , setTime] = useState(30)

const handleStart = () => {
     const settings = {
        difficulty,
        questionCount,
        time,
     }
     localStorage.setItem("prepmate-test-settings",JSON.stringify(settings))

     navigate("/quiz/all")
}
   
   return(
        <div className="min-h-screen flex items-center justify-center text-white px-4">
      <div className="w-full max-w-lg bg-black/60 border border-white/10 rounded-2xl p-8 shadow-xl">

        <h1 className="text-2xl font-bold mb-6">Setup Your Test</h1>

        
        <div className="mb-6">
          <p className="mb-2 text-gray-300">Difficulty</p>
          <div className="flex gap-4">
            {["easy", "medium", "hard"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`flex-1 py-2 rounded-lg border transition ${
                  difficulty === lvl
                    ? "bg-indigo-600 border-indigo-500"
                    : "border-white/20 hover:border-indigo-400"
                }`}
              >
                {lvl.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

    
        <div className="mb-6">
          <p className="mb-2 text-gray-300">Number of Questions</p>
          <input
            type="number"
            min="5"
            max="100"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full p-3 rounded bg-black/40 border border-white/10"
          />
        </div>

       
        <div className="mb-6">
          <p className="mb-2 text-gray-300">Time (minutes)</p>
          <input
            type="number"
            min="5"
            max="180"
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className="w-full p-3 rounded bg-black/40 border border-white/10"
          />
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 font-semibold transition"
        >
          Start Test
        </button>

      </div>
    </div>
  );
};

export default TestSetup;

   



