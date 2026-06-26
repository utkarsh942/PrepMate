import React, { useState, useCallback, useEffect } from 'react';
import QuizHeader from './QuizHeader';
import QuestionDisplay from './QuestionDisplay';
import QuestionPalette from './QuestionPalette';
import QuizControls from './QuizControls';
import QuizLegend from './QuizLegend';
import QuizSubmitModal from './QuizSubmitModal';

export default function QuizPanel({ questions, title, timerSeconds, onSubmit, onTimeUp }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(new Map());
  const [questionStatuses, setQuestionStatuses] = useState(new Map());
  const [isMarkedList, setIsMarkedList] = useState(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Initialize status for first question
  useEffect(() => {
    if (questions.length > 0 && !questionStatuses.has(0)) {
      setQuestionStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(0, 'not-answered');
        return newMap;
      });
    }
  }, [questions.length, questionStatuses]);

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const currentAnswer = selectedAnswers.get(currentIndex);
  const isMarked = isMarkedList.has(currentIndex);

  const handleSelectAnswer = (ans) => {
    setSelectedAnswers(prev => {
      const next = new Map(prev);
      next.set(currentIndex, ans);
      return next;
    });
  };

  const updateStatus = (index, statusOverride = null) => {
    setQuestionStatuses(prev => {
      const next = new Map(prev);
      if (statusOverride) {
        next.set(index, statusOverride);
      } else {
        const hasAns = selectedAnswers.has(index) && selectedAnswers.get(index) !== null;
        const marked = isMarkedList.has(index);
        
        if (hasAns && marked) next.set(index, 'answered-marked');
        else if (hasAns) next.set(index, 'answered');
        else if (marked) next.set(index, 'marked');
        else next.set(index, 'not-answered');
      }
      return next;
    });
  };

  const navigateTo = (newIndex) => {
    // Before navigating away, update status of current if not explicitly handled by buttons
    if (!questionStatuses.has(currentIndex)) {
      updateStatus(currentIndex);
    }
    
    // When arriving at new question, if it's not visited, make it not-answered
    setQuestionStatuses(prev => {
      const next = new Map(prev);
      if (!next.has(newIndex) || next.get(newIndex) === 'not-visited') {
        next.set(newIndex, 'not-answered');
      }
      return next;
    });
    
    setCurrentIndex(newIndex);
  };

  const handleSaveAndNext = () => {
    const hasAns = !!currentAnswer;
    const marked = isMarked;
    
    let nextStatus = 'not-answered';
    if (hasAns && marked) nextStatus = 'answered-marked';
    else if (hasAns) nextStatus = 'answered';
    else if (marked) nextStatus = 'marked';

    updateStatus(currentIndex, nextStatus);

    if (!isLast) {
      navigateTo(currentIndex + 1);
    }
  };

  const handleClearResponse = () => {
    setSelectedAnswers(prev => {
      const next = new Map(prev);
      next.delete(currentIndex);
      return next;
    });
    // Immediately reflect UI state
    updateStatus(currentIndex, isMarked ? 'marked' : 'not-answered');
  };

  const handleMarkForReview = () => {
    setIsMarkedList(prev => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
    
    // We can't synchronously read the state just updated, so we compute
    const marked = !isMarked; 
    const hasAns = !!currentAnswer;
    
    let nextStatus = 'not-answered';
    if (hasAns && marked) nextStatus = 'answered-marked';
    else if (hasAns) nextStatus = 'answered';
    else if (marked) nextStatus = 'marked';
    
    updateStatus(currentIndex, nextStatus);

    if (!isLast) {
      navigateTo(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) navigateTo(currentIndex - 1);
  };

  const handleNext = () => {
    if (!isLast) navigateTo(currentIndex + 1);
  };

  const handleJumpTo = (index) => {
    navigateTo(index);
  };

  const computeStats = () => {
    let answered = 0;
    let notAnswered = 0;
    let markedForReview = 0;
    let notVisited = 0;

    for (let i = 0; i < questions.length; i++) {
      const status = questionStatuses.get(i) || 'not-visited';
      if (status === 'answered' || status === 'answered-marked') answered++;
      if (status === 'not-answered') notAnswered++;
      if (status === 'marked') markedForReview++;
      if (status === 'not-visited') notVisited++;
    }

    return { answered, notAnswered, markedForReview, notVisited, total: questions.length };
  };

  const handleSubmitClick = () => {
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    onSubmit(selectedAnswers);
  };

  // On time up, we automatically submit
  const handleTimeUp = () => {
    onSubmit(selectedAnswers);
    if (onTimeUp) onTimeUp();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col font-sans">
      <QuizHeader 
        title={title}
        timerSeconds={timerSeconds}
        onTimeUp={handleTimeUp}
        currentQuestion={currentIndex + 1}
        totalQuestions={questions.length}
        isPaused={showSubmitModal}
      />

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-4 gap-4 max-w-[1600px] mx-auto w-full">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <QuestionDisplay 
            question={currentQuestion}
            selectedAnswer={currentAnswer}
            onSelectAnswer={handleSelectAnswer}
            questionNumber={currentIndex + 1}
            isMarked={isMarked}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-72 lg:w-80 flex flex-col shrink-0 gap-4">
          <div className="flex-1 min-h-[300px]">
            <QuestionPalette 
              questions={questions}
              questionStatuses={questionStatuses}
              currentIndex={currentIndex}
              onJumpTo={handleJumpTo}
            />
          </div>
          <QuizLegend />
        </div>
      </div>

      <QuizControls 
        onSaveAndNext={handleSaveAndNext}
        onClearResponse={handleClearResponse}
        onMarkForReview={handleMarkForReview}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmitClick}
        isFirst={isFirst}
        isLast={isLast}
        hasAnswer={!!currentAnswer}
        isMarked={isMarked}
      />

      <QuizSubmitModal 
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleConfirmSubmit}
        stats={computeStats()}
      />
    </div>
  );
}
