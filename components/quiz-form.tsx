"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { submitQuizAttempt } from "@/lib/services/enrollment-service"
import { useToast } from "@/hooks/use-toast"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctOptionIndex?: number // Only included for showing results
}

interface QuizFormProps {
  quizId: string
  courseId: string
  userId: string
  title: string
  description?: string
  questions: QuizQuestion[]
  onQuizComplete?: (score: number) => void
  showResults?: boolean
}

export function QuizForm({
  quizId,
  courseId,
  userId,
  title,
  description,
  questions,
  onQuizComplete,
  showResults = false,
}: QuizFormProps) {
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const { toast } = useToast()

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== questions.length) {
      toast({
        title: "Error",
        description: "Please answer all questions before submitting",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex,
      }))

      const result = await submitQuizAttempt(userId, courseId, quizId, formattedAnswers)

      setScore(result.score)
      setSubmitted(true)

      toast({
        title: "Quiz Submitted",
        description: `Your score: ${result.score}%`,
      })

      if (onQuizComplete) {
        onQuizComplete(result.score)
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-3">
            <h3 className="font-medium">
              {index + 1}. {question.question}
            </h3>
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswerChange(question.id, Number.parseInt(value))}
              disabled={submitted}
            >
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-option-${optionIndex}`} />
                  <Label
                    htmlFor={`${question.id}-option-${optionIndex}`}
                    className={
                      submitted && showResults
                        ? optionIndex === question.correctOptionIndex
                          ? "text-green-600 font-medium"
                          : answers[question.id] === optionIndex
                            ? "text-red-600"
                            : ""
                        : ""
                    }
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {submitted && showResults && answers[question.id] !== question.correctOptionIndex && (
              <p className="text-sm text-muted-foreground">
                Correct answer: {question.options[question.correctOptionIndex || 0]}
              </p>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        {submitted ? (
          <div className="text-center">
            <p className="text-lg font-medium">Your Score: {score}%</p>
            <p className="text-sm text-muted-foreground">
              You answered{" "}
              {Object.values(answers).filter((answer, index) => questions[index].correctOptionIndex === answer).length}{" "}
              out of {questions.length} questions correctly.
            </p>
          </div>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length || submitting}
            className="w-full"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
