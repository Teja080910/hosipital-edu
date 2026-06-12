"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { coursesApi } from "@/lib/api";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface CourseQuizProps {
  quiz: {
    id: string;
    title: Record<string, string> | string;
    questions: QuizQuestion[];
    passingScore: number;
  };
  onComplete?: (passed: boolean, score: number) => void;
}

export function CourseQuiz({ quiz, onComplete }: CourseQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionIndex: number; selectedOptionIndex: number }[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; correctAnswers: number; totalQuestions: number; answers: any[] } | null>(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  const title = typeof quiz.title === "string" ? quiz.title : (quiz.title?.en || "");

  const handleStart = async () => {
    setStarting(true);
    try {
      const { data } = await coursesApi.startQuiz(quiz.id);
      setAttemptId(data.id);
    } catch {
      toast.error("Failed to start quiz");
    } finally {
      setStarting(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (submitted) return;
    const existing = answers.findIndex((a) => a.questionIndex === currentQuestion);
    if (existing >= 0) {
      const updated = [...answers];
      updated[existing] = { questionIndex: currentQuestion, selectedOptionIndex: optionIndex };
      setAnswers(updated);
    } else {
      setAnswers([...answers, { questionIndex: currentQuestion, selectedOptionIndex: optionIndex }]);
    }
  };

  const currentAnswer = answers.find((a) => a.questionIndex === currentQuestion);

  const handleSubmit = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const { data } = await coursesApi.submitQuiz(attemptId, answers);
      setResult(data);
      setSubmitted(true);
      onComplete?.(data.passed, data.score);
    } catch {
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (!attemptId) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title || "Quiz"}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {questions.length} questions &middot; Passing score: {quiz.passingScore}%
          </p>
        </CardHeader>
        <CardFooter className="justify-center pb-6">
          <Button size="lg" onClick={handleStart} disabled={starting}>
            {starting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (submitted && result) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {result.passed ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-xl">
            {result.passed ? "Quiz Passed!" : "Quiz Failed"}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Score: {result.score}% ({result.correctAnswers}/{result.totalQuestions} correct)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={result.score} className="h-2" />
          {result.answers.map((a: any, i: number) => {
            const q = questions[a.questionIndex];
            if (!q) return null;
            return (
              <div key={i} className={`p-3 rounded-lg border ${a.isCorrect ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}>
                <p className="text-sm font-medium">{q.question}</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Your answer: {q.options[a.selectedOptionIndex] || "N/A"}
                  {!a.isCorrect && (
                    <span className="ml-2 text-green-600">Correct: {q.options[a.correctOptionIndex]}</span>
                  )}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{answers.length} answered</span>
        </div>
        <Progress value={progress} className="h-1" />
        <CardTitle className="text-lg mt-4">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {question.options.map((option, idx) => {
          const isSelected = currentAnswer?.selectedOptionIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "hover:bg-muted/50"
              }`}
            >
              <span className="text-sm">{option}</span>
            </button>
          );
        })}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        {currentQuestion < questions.length - 1 ? (
          <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting || answers.length < questions.length}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
