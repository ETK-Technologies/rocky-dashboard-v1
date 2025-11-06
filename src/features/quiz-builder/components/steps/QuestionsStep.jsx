"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
    Plus,
    Trash2,
    GripVertical,
    Copy,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    XCircle,
    ChevronsUpDown,
    ChevronsDownUp,
} from "lucide-react";
import {
    CustomButton,
    CustomInput,
    CustomLabel,
    FormField,
    Tooltip,
} from "@/components/ui";
import { cn } from "@/utils/cn";
import { SingleImageUpload } from "../SingleImageUpload";
import { Link2, X } from "lucide-react";

const DEFAULT_QUESTION = {
    id: 1,
    title: "Question 1",
    description: "",
    type: "single-choice",
    required: false,
    options: [
        { text: "Option 1", image: "", imageType: "upload", hasImage: false },
        { text: "Option 2", image: "", imageType: "upload", hasImage: false },
    ],
    correctAnswer: null,
    maxLength: null,
    placeholder: "",
};

// Helper function to normalize options (convert string to object if needed)
const normalizeOption = (option) => {
    if (typeof option === "string") {
        return {
            text: option,
            image: "",
            imageType: "upload",
            hasImage: false,
        };
    }
    return {
        text: option.text || "",
        image: option.image || "",
        imageType: option.imageType || "upload",
        hasImage: option.hasImage || false,
    };
};

// Helper function to get option text (for backward compatibility)
const getOptionText = (option) => {
    return typeof option === "string" ? option : option?.text || "";
};

export default function QuestionsStep({
    onComplete,
    onValidationChange,
    data,
    updateData,
}) {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [draggedQuestionIndex, setDraggedQuestionIndex] = useState(null);
    const [scrollToQuestionId, setScrollToQuestionId] = useState(null);
    const [showScrollIndicatorTop, setShowScrollIndicatorTop] = useState(false);
    const [showScrollIndicatorBottom, setShowScrollIndicatorBottom] =
        useState(false);
    const questionRefs = useRef({});

    const questions = useMemo(() => data?.questions || [], [data?.questions]);

    // Initialize expandedQuestions: if 1 question, open it; if more, close all
    const [expandedQuestions, setExpandedQuestions] = useState(() => {
        const initialQuestions = data?.questions || [];
        // If only 1 question, expand it; otherwise, keep all closed
        if (initialQuestions.length === 1) {
            return new Set([initialQuestions[0].id]);
        }
        return new Set();
    });

    const setQuestions = (newQuestions) => {
        updateData("questions", newQuestions);
    };

    // Auto-scroll during drag
    useEffect(() => {
        if (draggedQuestionIndex === null) {
            return;
        }

        // Scroll speed and threshold
        const SCROLL_THRESHOLD = 100; // Distance from edge in pixels
        const SCROLL_SPEED = 15; // Pixels to scroll per event

        const handleDragMove = (e) => {
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY;
            const mouseY = e.clientY;

            // Check if first or last question is visible on screen
            const firstQuestionId = questions[0]?.id;
            const lastQuestionId = questions[questions.length - 1]?.id;
            const firstQuestionEl = firstQuestionId
                ? questionRefs.current[firstQuestionId]
                : null;
            const lastQuestionEl = lastQuestionId
                ? questionRefs.current[lastQuestionId]
                : null;

            let isFirstQuestionVisible = false;
            let isLastQuestionVisible = false;

            if (firstQuestionEl) {
                const rect = firstQuestionEl.getBoundingClientRect();
                isFirstQuestionVisible =
                    rect.top >= 0 && rect.top <= windowHeight;
            }

            if (lastQuestionEl) {
                const rect = lastQuestionEl.getBoundingClientRect();
                isLastQuestionVisible =
                    rect.bottom >= 0 && rect.bottom <= windowHeight;
            }

            // Calculate scroll direction and show indicators
            let scrollDirection = 0;
            let showTopIndicator = false;
            let showBottomIndicator = false;

            // Near top edge - scroll up (only if first question is not visible)
            if (mouseY < SCROLL_THRESHOLD && !isFirstQuestionVisible) {
                // Closer to edge = faster scroll
                const distanceFromEdge = mouseY;
                scrollDirection =
                    -1 * (1 - distanceFromEdge / SCROLL_THRESHOLD);
                showTopIndicator = true;
            }
            // Near bottom edge - scroll down (only if last question is not visible)
            else if (
                mouseY > windowHeight - SCROLL_THRESHOLD &&
                !isLastQuestionVisible
            ) {
                const distanceFromEdge = windowHeight - mouseY;
                scrollDirection = 1 * (1 - distanceFromEdge / SCROLL_THRESHOLD);
                showBottomIndicator = true;
            }

            // Update indicator visibility
            setShowScrollIndicatorTop(showTopIndicator);
            setShowScrollIndicatorBottom(showBottomIndicator);

            // Perform scroll
            if (scrollDirection !== 0) {
                const maxScroll =
                    document.documentElement.scrollHeight - windowHeight;
                const scrollAmount = scrollDirection * SCROLL_SPEED;
                const newScrollY = Math.max(
                    0,
                    Math.min(maxScroll, scrollY + scrollAmount)
                );

                if (newScrollY !== scrollY) {
                    window.scrollTo({
                        top: newScrollY,
                        behavior: "auto",
                    });
                }
            }
        };

        // Add global event listener for drag
        document.addEventListener("dragover", handleDragMove);

        return () => {
            document.removeEventListener("dragover", handleDragMove);
            // Reset indicators when drag ends
            setShowScrollIndicatorTop(false);
            setShowScrollIndicatorBottom(false);
        };
    }, [draggedQuestionIndex, questions]);

    // Drag and drop handlers
    const handleQuestionDragStart = (e, index) => {
        setDraggedQuestionIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "reorder-question");
        // Add visual feedback
        e.currentTarget.style.opacity = "0.5";
    };

    const handleQuestionDragOver = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedQuestionIndex !== null && draggedQuestionIndex !== index) {
            setDragOverIndex(index);
            e.dataTransfer.dropEffect = "move";
        }
    };

    const handleQuestionDragEnd = (e) => {
        e.currentTarget.style.opacity = "1";
        setDragOverIndex(null);
        setDraggedQuestionIndex(null);
    };

    const handleQuestionDrop = (e, dropIndex) => {
        e.preventDefault();
        e.stopPropagation();

        if (
            draggedQuestionIndex !== null &&
            draggedQuestionIndex !== dropIndex
        ) {
            const newQuestions = [...questions];
            const draggedQuestion = newQuestions[draggedQuestionIndex];
            newQuestions.splice(draggedQuestionIndex, 1);
            newQuestions.splice(dropIndex, 0, draggedQuestion);
            setQuestions(newQuestions);
        }

        setDragOverIndex(null);
        setDraggedQuestionIndex(null);
    };

    // Validate all questions
    useEffect(() => {
        const newErrors = {};
        let isValid = true;

        // Require at least one question
        if (questions.length === 0) {
            isValid = false;
        }

        questions.forEach((question) => {
            const questionErrors = {};

            // Validate title - required for all questions
            if (!question.title?.trim()) {
                questionErrors.title = "Question title is required";
                isValid = false;
            }

            // Validate options - required for question types that have options
            if (
                question.type === "single-choice" ||
                question.type === "multiple-choice" ||
                question.type === "dropdown-list" ||
                question.type === "true-false"
            ) {
                if (!question.options || question.options.length < 2) {
                    questionErrors.options = "At least 2 options are required";
                    isValid = false;
                } else {
                    // Check if all options have non-empty text values
                    const emptyOptions = question.options.filter((opt) => {
                        const text = getOptionText(opt);
                        return !text?.trim();
                    });
                    if (emptyOptions.length > 0) {
                        questionErrors.options =
                            "All options must have a value";
                        isValid = false;
                    }
                }
            }

            if (Object.keys(questionErrors).length > 0) {
                newErrors[question.id] = questionErrors;
            }
        });

        setErrors(newErrors);
        onValidationChange?.(isValid);
    }, [questions, onValidationChange]);

    // Scroll to newly added question
    useEffect(() => {
        if (scrollToQuestionId && questionRefs.current[scrollToQuestionId]) {
            const element = questionRefs.current[scrollToQuestionId];
            setTimeout(() => {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
                setScrollToQuestionId(null);
            }, 100);
        }
    }, [scrollToQuestionId, questions]);

    const addQuestion = () => {
        const newQuestionId = Date.now();
        setQuestions([
            ...questions,
            {
                id: newQuestionId,
                title: `Question ${questions.length + 1}`,
                description: "",
                type: "single-choice",
                required: false,
                options: [
                    {
                        text: "Option 1",
                        image: "",
                        imageType: "upload",
                        hasImage: false,
                    },
                    {
                        text: "Option 2",
                        image: "",
                        imageType: "upload",
                        hasImage: false,
                    },
                ],
                correctAnswer: null,
                maxLength: null,
                placeholder: "",
            },
        ]);
        // Open the new question
        setExpandedQuestions((prev) => {
            const newSet = new Set(prev);
            newSet.add(newQuestionId);
            return newSet;
        });
        // Set scroll target
        setScrollToQuestionId(newQuestionId);
    };

    const duplicateQuestion = (id) => {
        const questionToDuplicate = questions.find((q) => q.id === id);
        if (questionToDuplicate) {
            const newQuestionId = Date.now();
            // Normalize options to ensure they're in the correct format
            const normalizedOptions = questionToDuplicate.options.map((opt) =>
                normalizeOption(opt)
            );
            const newQuestion = {
                ...questionToDuplicate,
                id: newQuestionId,
                title: `${questionToDuplicate.title} (Copy)`,
                options: normalizedOptions,
                correctAnswer: null, // Reset correct answer for the duplicate
            };
            const index = questions.findIndex((q) => q.id === id);
            setQuestions([
                ...questions.slice(0, index + 1),
                newQuestion,
                ...questions.slice(index + 1),
            ]);
            // Open the duplicated question
            setExpandedQuestions((prev) => {
                const newSet = new Set(prev);
                newSet.add(newQuestionId);
                return newSet;
            });
            // Set scroll target
            setScrollToQuestionId(newQuestionId);
        }
    };

    const removeQuestion = (id) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    const updateQuestion = (id, field, value) => {
        // Mark field as touched when user starts editing
        if (!touched[id]) {
            setTouched((prev) => ({
                ...prev,
                [id]: { [field]: true },
            }));
        } else if (!touched[id][field]) {
            setTouched((prev) => ({
                ...prev,
                [id]: { ...prev[id], [field]: true },
            }));
        }

        setQuestions(
            questions.map((q) => {
                if (q.id === id) {
                    const updated = { ...q, [field]: value };
                    // If changing to true-false, set default options
                    if (field === "type" && value === "true-false") {
                        updated.options = [
                            {
                                text: "True",
                                image: "",
                                imageType: "upload",
                                hasImage: false,
                            },
                            {
                                text: "False",
                                image: "",
                                imageType: "upload",
                                hasImage: false,
                            },
                        ];
                        updated.correctAnswer = null;
                    }
                    // If changing from true-false to another type, reset options
                    if (
                        field === "type" &&
                        q.type === "true-false" &&
                        value !== "true-false"
                    ) {
                        updated.options = [
                            {
                                text: "Option 1",
                                image: "",
                                imageType: "upload",
                                hasImage: false,
                            },
                            {
                                text: "Option 2",
                                image: "",
                                imageType: "upload",
                                hasImage: false,
                            },
                        ];
                        updated.correctAnswer = null;
                    }
                    return updated;
                }
                return q;
            })
        );
    };

    const updateOption = (questionId, optionIndex, value) => {
        // Mark options as touched
        if (!touched[questionId]) {
            setTouched((prev) => ({
                ...prev,
                [questionId]: { options: true },
            }));
        } else if (!touched[questionId].options) {
            setTouched((prev) => ({
                ...prev,
                [questionId]: { ...prev[questionId], options: true },
            }));
        }

        setQuestions(
            questions.map((q) => {
                if (q.id === questionId) {
                    const newOptions = [...q.options];
                    const currentOption = normalizeOption(
                        newOptions[optionIndex]
                    );
                    newOptions[optionIndex] = {
                        ...currentOption,
                        text: value,
                    };
                    return { ...q, options: newOptions };
                }
                return q;
            })
        );
    };

    const updateOptionImage = (questionId, optionIndex, image) => {
        setQuestions(
            questions.map((q) => {
                if (q.id === questionId) {
                    const newOptions = [...q.options];
                    const currentOption = normalizeOption(
                        newOptions[optionIndex]
                    );
                    newOptions[optionIndex] = {
                        ...currentOption,
                        image: image || "",
                    };
                    return { ...q, options: newOptions };
                }
                return q;
            })
        );
    };

    const updateOptionImageType = (questionId, optionIndex, imageType) => {
        setQuestions(
            questions.map((q) => {
                if (q.id === questionId) {
                    const newOptions = [...q.options];
                    const currentOption = normalizeOption(
                        newOptions[optionIndex]
                    );
                    newOptions[optionIndex] = {
                        ...currentOption,
                        imageType: imageType || "upload",
                    };
                    return { ...q, options: newOptions };
                }
                return q;
            })
        );
    };

    const updateOptionHasImage = (questionId, optionIndex, hasImage) => {
        setQuestions(
            questions.map((q) => {
                if (q.id === questionId) {
                    const newOptions = [...q.options];
                    const currentOption = normalizeOption(
                        newOptions[optionIndex]
                    );
                    newOptions[optionIndex] = {
                        ...currentOption,
                        hasImage: hasImage,
                        // Clear image if unchecking
                        image: hasImage ? currentOption.image : "",
                    };
                    return { ...q, options: newOptions };
                }
                return q;
            })
        );
    };

    const addOption = (questionId) => {
        setQuestions(
            questions.map((q) => {
                if (q.id === questionId) {
                    // Don't allow adding options to true-false questions
                    if (q.type === "true-false") {
                        return q;
                    }
                    const optionNumber = q.options.length + 1;
                    return {
                        ...q,
                        options: [
                            ...q.options,
                            {
                                text: `Option ${optionNumber}`,
                                image: "",
                                imageType: "upload",
                                hasImage: false,
                            },
                        ],
                    };
                }
                return q;
            })
        );
    };

    const removeOption = (questionId, optionIndex) => {
        setQuestions(
            questions.map((q) => {
                // Don't allow removing options from true-false questions (must keep exactly 2)
                if (
                    q.id === questionId &&
                    q.options.length > 2 &&
                    q.type !== "true-false"
                ) {
                    const newOptions = q.options.filter(
                        (_, idx) => idx !== optionIndex
                    );
                    // Reset correctAnswer if it was the deleted option
                    let newCorrectAnswer = q.correctAnswer;
                    if (q.correctAnswer === optionIndex) {
                        newCorrectAnswer = null;
                    } else if (q.correctAnswer > optionIndex) {
                        newCorrectAnswer = q.correctAnswer - 1;
                    }
                    return {
                        ...q,
                        options: newOptions,
                        correctAnswer: newCorrectAnswer,
                    };
                }
                return q;
            })
        );
    };

    const toggleQuestionExpanded = (questionId) => {
        setExpandedQuestions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    // Toggle expand/collapse all questions
    const toggleAllQuestions = () => {
        const allExpanded = questions.every((q) => expandedQuestions.has(q.id));
        if (allExpanded) {
            // Collapse all
            setExpandedQuestions(new Set());
        } else {
            // Expand all
            setExpandedQuestions(new Set(questions.map((q) => q.id)));
        }
    };

    // Check if all questions are expanded
    const allExpanded =
        questions.length > 0 &&
        questions.every((q) => expandedQuestions.has(q.id));

    // Check if a question is complete (all required fields filled)
    const isQuestionComplete = (question) => {
        // Check if title is filled
        if (!question.title?.trim()) {
            return false;
        }

        // Check if options are valid for question types that require them
        if (
            question.type === "single-choice" ||
            question.type === "multiple-choice" ||
            question.type === "dropdown-list" ||
            question.type === "true-false"
        ) {
            if (!question.options || question.options.length < 2) {
                return false;
            }
            // Check if all options have non-empty text values
            const emptyOptions = question.options.filter((opt) => {
                const text = getOptionText(opt);
                return !text?.trim();
            });
            if (emptyOptions.length > 0) {
                return false;
            }
        }

        return true;
    };

    return (
        <>
            {/* Scroll indicators */}
            {showScrollIndicatorTop && draggedQuestionIndex !== null && (
                <div className="fixed top-[60px] left-0 right-0 z-[1000] flex justify-center pointer-events-none ">
                    <div className="bg-primary text-primary-foreground rounded-b-lg px-6 py-3 shadow-lg flex items-center gap-2 animate-pulse w-1/2 mx-auto justify-center">
                        <ChevronUp className="h-5 w-5" />
                        <span className="text-sm font-medium">Scroll up</span>
                    </div>
                </div>
            )}
            {showScrollIndicatorBottom && draggedQuestionIndex !== null && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center pointer-events-none">
                    <div className="bg-primary text-primary-foreground rounded-t-lg px-6 py-3 shadow-lg flex items-center gap-2 animate-pulse w-1/2 mx-auto justify-center">
                        <ChevronDown className="h-5 w-5" />
                        <span className="text-sm font-medium">Scroll down</span>
                    </div>
                </div>
            )}
            <div className="space-y-6">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg py-4 border-b border-border mb-6 flex sm:items-center items-start justify-between sm:flex-row flex-col md:gap-4 gap-2">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">
                            Questions
                        </h2>
                        <p className="text-muted-foreground">
                            Add and configure your quiz questions
                        </p>
                    </div>
                    <div className="flex md:items-center gap-2 flex-wrap sm:text-base text-sm md:self-center self-end justify-end">
                        <CustomButton
                            onClick={addQuestion}
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Question
                        </CustomButton>
                        {questions.length > 0 && (
                            <CustomButton
                                onClick={toggleAllQuestions}
                                // size="sm"
                                variant="outline"
                                className="flex items-center gap-2 py-3"
                            >
                                {allExpanded ? (
                                    <ChevronsUpDown className="h-4 w-4" />
                                ) : (
                                    <ChevronsDownUp className="h-4 w-4" />
                                )}
                                {allExpanded ? "Collapse all" : "Expand all"}
                            </CustomButton>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {questions.map((question, qIndex) => {
                        const isDraggedOver =
                            dragOverIndex === qIndex &&
                            draggedQuestionIndex !== qIndex;
                        return (
                            <div
                                key={question.id}
                                ref={(el) => {
                                    if (el) {
                                        questionRefs.current[question.id] = el;
                                    }
                                }}
                                draggable
                                onDragStart={(e) =>
                                    handleQuestionDragStart(e, qIndex)
                                }
                                onDragOver={(e) =>
                                    handleQuestionDragOver(e, qIndex)
                                }
                                onDragEnd={handleQuestionDragEnd}
                                onDrop={(e) => handleQuestionDrop(e, qIndex)}
                                className={cn(
                                    "border rounded-lg p-6 space-y-6 bg-card transition-all duration-200",
                                    isDraggedOver &&
                                        "border-primary border-2 shadow-lg",
                                    draggedQuestionIndex === qIndex &&
                                        "opacity-50"
                                )}
                            >
                                {/* Question Header */}
                                <div className="flex sm:items-center items-start justify-between sm:flex-row flex-col md:gap-4 gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move flex-shrink-0" />
                                        <div className="flex flex-col gap-2 items-start">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex-shrink-0">
                                                    Question {qIndex + 1}
                                                </span>
                                                {isQuestionComplete(
                                                    question
                                                ) ? (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Complete
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
                                                        <XCircle className="h-3 w-3" />
                                                        Incomplete
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-1 min-w-0 px-3 flex-wrap">
                                                <span className="font-medium text-sm truncate">
                                                    {question.title ||
                                                        "Untitled Question"}
                                                </span>
                                                <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs flex-shrink-0">
                                                    {question.type ===
                                                    "single-choice"
                                                        ? "Single Choice"
                                                        : question.type ===
                                                          "multiple-choice"
                                                        ? "Multiple Choice"
                                                        : question.type ===
                                                          "dropdown-list"
                                                        ? "Dropdown List"
                                                        : question.type ===
                                                          "true-false"
                                                        ? "True/False"
                                                        : question.type ===
                                                          "short-answer"
                                                        ? "Short Answer"
                                                        : question.type ===
                                                          "textarea"
                                                        ? "Textarea"
                                                        : question.type ===
                                                          "file"
                                                        ? "File Upload"
                                                        : question.type ===
                                                          "date"
                                                        ? "Date"
                                                        : question.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:self-center self-end">
                                        <CustomButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                toggleQuestionExpanded(
                                                    question.id
                                                )
                                            }
                                            className="text-muted-foreground hover:text-white sm:text-base text-sm"
                                        >
                                            {expandedQuestions.has(
                                                question.id
                                            ) ? (
                                                <>
                                                    <ChevronUp className="h-4 w-4 mr-1" />
                                                    <span className="sm:block hidden">
                                                        Hide Details
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="h-4 w-4 mr-1" />
                                                    <span className="sm:block hidden">
                                                        Show Details
                                                    </span>
                                                </>
                                            )}
                                        </CustomButton>
                                        <CustomButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                duplicateQuestion(question.id)
                                            }
                                            className="text-muted-foreground hover:text-white!"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </CustomButton>
                                        <CustomButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                removeQuestion(question.id)
                                            }
                                            className="text-destructive hover:text-white dark:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </CustomButton>
                                    </div>
                                </div>

                                {/* Question Details - Collapsible */}
                                {expandedQuestions.has(question.id) && (
                                    <div className="space-y-6 pt-4 border-t">
                                        {/* Question Type */}
                                        <div className="space-y-2">
                                            <CustomLabel
                                                htmlFor={`type-${question.id}`}
                                            >
                                                Question Type
                                            </CustomLabel>
                                            <select
                                                id={`type-${question.id}`}
                                                value={question.type}
                                                onChange={(e) =>
                                                    updateQuestion(
                                                        question.id,
                                                        "type",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 !mt-1 border border-input rounded-md bg-background dark:bg-gray-800 dark:text-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            >
                                                <option value="single-choice">
                                                    Single Choice (Radio)
                                                </option>
                                                <option value="multiple-choice">
                                                    Multiple Choice (Checkbox)
                                                </option>
                                                <option value="dropdown-list">
                                                    Dropdown List
                                                </option>
                                                <option value="true-false">
                                                    True/False
                                                </option>
                                                {/* <option value="short-answer">
                                                    Short Answer
                                                </option> */}
                                                <option value="textarea">
                                                    Textarea
                                                </option>
                                                {/* <option value="file">
                                                    File Upload
                                                </option> */}
                                                <option value="date">
                                                    Date
                                                </option>
                                            </select>
                                        </div>

                                        {/* Question Title */}
                                        <FormField
                                            id={`title-${question.id}`}
                                            label="Question Title"
                                            required
                                            value={question.title}
                                            onChange={(e) =>
                                                updateQuestion(
                                                    question.id,
                                                    "title",
                                                    e.target.value
                                                )
                                            }
                                            onBlur={() => {
                                                if (!touched[question.id]) {
                                                    setTouched((prev) => ({
                                                        ...prev,
                                                        [question.id]: {
                                                            title: true,
                                                        },
                                                    }));
                                                } else if (
                                                    !touched[question.id].title
                                                ) {
                                                    setTouched((prev) => ({
                                                        ...prev,
                                                        [question.id]: {
                                                            ...prev[
                                                                question.id
                                                            ],
                                                            title: true,
                                                        },
                                                    }));
                                                }
                                            }}
                                            placeholder="Enter question title"
                                            error={
                                                touched[question.id]?.title
                                                    ? errors[question.id]?.title
                                                    : undefined
                                            }
                                        />

                                        {/* Description (Optional) */}
                                        <div className="space-y-2">
                                            <CustomLabel
                                                htmlFor={`description-${question.id}`}
                                            >
                                                Description (Optional)
                                            </CustomLabel>
                                            <textarea
                                                id={`description-${question.id}`}
                                                value={question.description}
                                                onChange={(e) =>
                                                    updateQuestion(
                                                        question.id,
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Additional context for the question"
                                                rows={3}
                                                className="w-full px-3 py-2 border border-input rounded-md bg-background dark:bg-gray-800  text-black dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-y"
                                            />
                                        </div>

                                        {/* Required Toggle */}
                                        <div className="flex items-center justify-start gap-3">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={question.required}
                                                    onChange={(e) =>
                                                        updateQuestion(
                                                            question.id,
                                                            "required",
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                            <CustomLabel>Required</CustomLabel>
                                        </div>

                                        {/* Max Length and Placeholder for textarea, file, and date */}
                                        {(question.type === "textarea" ||
                                            question.type ===
                                                "short-answer") && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    id={`maxLength-${question.id}`}
                                                    label="Max Length"
                                                    type="number"
                                                    value={
                                                        question.maxLength || ""
                                                    }
                                                    onChange={(e) =>
                                                        updateQuestion(
                                                            question.id,
                                                            "maxLength",
                                                            e.target.value
                                                                ? parseInt(
                                                                      e.target
                                                                          .value
                                                                  )
                                                                : null
                                                        )
                                                    }
                                                    placeholder="e.g., 500"
                                                    helperText="Optional - Maximum character/byte limit"
                                                />
                                                <FormField
                                                    id={`placeholder-${question.id}`}
                                                    label="Placeholder"
                                                    value={
                                                        question.placeholder ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        updateQuestion(
                                                            question.id,
                                                            "placeholder",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter placeholder text"
                                                    helperText="Optional - Hint text for the input"
                                                />
                                            </div>
                                        )}

                                        {/* Options Section */}
                                        {(question.type === "single-choice" ||
                                            question.type ===
                                                "multiple-choice" ||
                                            question.type === "dropdown-list" ||
                                            question.type === "true-false") && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <CustomLabel>
                                                        Options
                                                        <span className="text-red-600 dark:text-red-400 ml-1">
                                                            *
                                                        </span>
                                                    </CustomLabel>
                                                    {question.type !==
                                                        "true-false" && (
                                                        <CustomButton
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                addOption(
                                                                    question.id
                                                                )
                                                            }
                                                            className="flex items-center gap-1 sm:text-base text-sm"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add Option
                                                        </CustomButton>
                                                    )}
                                                </div>
                                                {question.options.map(
                                                    (option, optIndex) => {
                                                        const normalizedOption =
                                                            normalizeOption(
                                                                option
                                                            );
                                                        const optionText =
                                                            getOptionText(
                                                                option
                                                            );
                                                        return (
                                                            <div
                                                                key={optIndex}
                                                                className="space-y-2"
                                                            >
                                                                <div className="flex items-center gap-2 sm:flex-row flex-col md:gap-4">
                                                                    <CustomInput
                                                                        value={
                                                                            optionText
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateOption(
                                                                                question.id,
                                                                                optIndex,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        onBlur={() => {
                                                                            if (
                                                                                !touched[
                                                                                    question
                                                                                        .id
                                                                                ]
                                                                            ) {
                                                                                setTouched(
                                                                                    (
                                                                                        prev
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        [question.id]:
                                                                                            {
                                                                                                options: true,
                                                                                            },
                                                                                    })
                                                                                );
                                                                            } else if (
                                                                                !touched[
                                                                                    question
                                                                                        .id
                                                                                ]
                                                                                    .options
                                                                            ) {
                                                                                setTouched(
                                                                                    (
                                                                                        prev
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        [question.id]:
                                                                                            {
                                                                                                ...prev[
                                                                                                    question
                                                                                                        .id
                                                                                                ],
                                                                                                options: true,
                                                                                            },
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        placeholder={`Option ${
                                                                            optIndex +
                                                                            1
                                                                        }`}
                                                                        className="flex-1"
                                                                        error={
                                                                            touched[
                                                                                question
                                                                                    .id
                                                                            ]
                                                                                ?.options &&
                                                                            errors[
                                                                                question
                                                                                    .id
                                                                            ]
                                                                                ?.options &&
                                                                            !optionText?.trim()
                                                                                ? "Option cannot be empty"
                                                                                : undefined
                                                                        }
                                                                    />
                                                                    <div className="flex items-center gap-2 sm:self-center self-end">
                                                                        {(question.type ===
                                                                            "single-choice" ||
                                                                            question.type ===
                                                                                "multiple-choice") && (
                                                                            <div className="flex items-center gap-2 pl-2">
                                                                                <label className="relative inline-flex items-center cursor-pointer">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={
                                                                                            normalizedOption.hasImage ||
                                                                                            false
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            updateOptionHasImage(
                                                                                                question.id,
                                                                                                optIndex,
                                                                                                e
                                                                                                    .target
                                                                                                    .checked
                                                                                            )
                                                                                        }
                                                                                        className="sr-only peer"
                                                                                    />
                                                                                    <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                                                </label>
                                                                                <CustomLabel className="text-xs text-muted-foreground">
                                                                                    Image
                                                                                </CustomLabel>
                                                                            </div>
                                                                        )}
                                                                        {question.type !==
                                                                            "true-false" && (
                                                                            <Tooltip
                                                                                content={
                                                                                    question
                                                                                        .options
                                                                                        .length <=
                                                                                    2
                                                                                        ? "At least 2 options are required"
                                                                                        : ""
                                                                                }
                                                                                side="top"
                                                                            >
                                                                                <CustomButton
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        removeOption(
                                                                                            question.id,
                                                                                            optIndex
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        question
                                                                                            .options
                                                                                            .length <=
                                                                                        2
                                                                                    }
                                                                                    className={cn(
                                                                                        "text-destructive hover:text-white dark:text-red-500",
                                                                                        question
                                                                                            .options
                                                                                            .length <=
                                                                                            2 &&
                                                                                            "opacity-50 cursor-not-allowed"
                                                                                    )}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </CustomButton>
                                                                            </Tooltip>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {/* Image controls for radio and checkbox only */}

                                                                {/* Show image controls only if hasImage is true */}
                                                                {(question.type ===
                                                                    "single-choice" ||
                                                                    question.type ===
                                                                        "multiple-choice") &&
                                                                    normalizedOption.hasImage && (
                                                                        <div className="space-y-2 pl-2 border-l-2 border-muted sm:w-[70%] w-full">
                                                                            <div className="flex items-center gap-2">
                                                                                <CustomLabel className="text-xs text-muted-foreground">
                                                                                    Image
                                                                                </CustomLabel>
                                                                                <div className="flex items-center gap-2">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            updateOptionImageType(
                                                                                                question.id,
                                                                                                optIndex,
                                                                                                "upload"
                                                                                            )
                                                                                        }
                                                                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                                                                            normalizedOption.imageType ===
                                                                                            "upload"
                                                                                                ? "bg-primary text-primary-foreground"
                                                                                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                                                        }`}
                                                                                    >
                                                                                        Upload
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            updateOptionImageType(
                                                                                                question.id,
                                                                                                optIndex,
                                                                                                "link"
                                                                                            )
                                                                                        }
                                                                                        className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                                                                                            normalizedOption.imageType ===
                                                                                            "link"
                                                                                                ? "bg-primary text-primary-foreground"
                                                                                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                                                        }`}
                                                                                    >
                                                                                        <Link2 className="h-3 w-3" />
                                                                                        Link
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                            {normalizedOption.imageType ===
                                                                            "upload" ? (
                                                                                <SingleImageUpload
                                                                                    label=""
                                                                                    value={
                                                                                        normalizedOption.image ||
                                                                                        ""
                                                                                    }
                                                                                    onChange={(
                                                                                        url
                                                                                    ) =>
                                                                                        updateOptionImage(
                                                                                            question.id,
                                                                                            optIndex,
                                                                                            url ||
                                                                                                ""
                                                                                        )
                                                                                    }
                                                                                    onRemove={() =>
                                                                                        updateOptionImage(
                                                                                            question.id,
                                                                                            optIndex,
                                                                                            ""
                                                                                        )
                                                                                    }
                                                                                    className="w-full"
                                                                                    smallPreview={
                                                                                        true
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                <div className="space-y-2">
                                                                                    <FormField
                                                                                        id={`option-image-link-${question.id}-${optIndex}`}
                                                                                        label=""
                                                                                        value={
                                                                                            normalizedOption.image ||
                                                                                            ""
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            updateOptionImage(
                                                                                                question.id,
                                                                                                optIndex,
                                                                                                e
                                                                                                    .target
                                                                                                    .value ||
                                                                                                    ""
                                                                                            )
                                                                                        }
                                                                                        placeholder="https://example.com/image.jpg"
                                                                                        type="url"
                                                                                    />
                                                                                    {normalizedOption.image && (
                                                                                        <div className="relative inline-block">
                                                                                            <img
                                                                                                src={
                                                                                                    normalizedOption.image
                                                                                                }
                                                                                                alt={`Option ${
                                                                                                    optIndex +
                                                                                                    1
                                                                                                } preview`}
                                                                                                className="max-w-full h-auto max-h-32 rounded-md border border-input object-contain"
                                                                                                onError={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    e.target.style.display =
                                                                                                        "none";
                                                                                                }}
                                                                                            />
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                    updateOptionImage(
                                                                                                        question.id,
                                                                                                        optIndex,
                                                                                                        ""
                                                                                                    )
                                                                                                }
                                                                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                                                                title="Remove image"
                                                                                            >
                                                                                                <X className="h-3 w-3" />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                <hr />
                                                            </div>
                                                        );
                                                    }
                                                )}
                                                {touched[question.id]
                                                    ?.options &&
                                                    errors[question.id]
                                                        ?.options && (
                                                        <p className="text-sm text-red-600 dark:text-red-400">
                                                            {
                                                                errors[
                                                                    question.id
                                                                ].options
                                                            }
                                                        </p>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {questions.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-lg mb-2">
                                No questions added yet
                            </p>
                            <p className="text-sm">
                                Click &quot;Add Question&quot; to get started
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
