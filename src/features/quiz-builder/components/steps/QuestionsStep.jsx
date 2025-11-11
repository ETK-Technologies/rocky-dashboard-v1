"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { QuestionsToolbar } from "./questions/QuestionsToolbar";
import { QuestionCard } from "./questions/QuestionCard";
import { normalizeOption, getOptionText } from "./questions/utils";

const DEFAULT_QUESTION = {
    id: 1,
    title: "Step 1",
    stepType: "",
    description: "",
    type: "",
    required: false,
    options: [],
    correctAnswer: null,
    maxLength: null,
    placeholder: "",
    minValue: null,
    maxValue: null,
    markupImage: "",
    markupImageType: "upload",
    selectedComponentId: null,
    selectedPageId: null,
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

    // Initialize expandedQuestions: if 1 step, open it; if more, close all
    const [expandedQuestions, setExpandedQuestions] = useState(() => {
        const initialQuestions = data?.questions || [];
        // If only 1 step, expand it; otherwise, keep all closed
        if (initialQuestions.length === 1) {
            return new Set([initialQuestions[0].id]);
        }
        return new Set();
    });

    const markQuestionFieldTouched = (id, field) => {
        setTouched((prev) => {
            const existing = prev[id] || {};
            if (existing[field]) {
                return prev;
            }
            return {
                ...prev,
                [id]: {
                    ...existing,
                    [field]: true,
                },
            };
        });
    };

    const markQuestionOptionsTouched = (id) => {
        setTouched((prev) => {
            const existing = prev[id] || {};
            if (existing.options) {
                return prev;
            }
            return {
                ...prev,
                [id]: {
                    ...existing,
                    options: true,
                },
            };
        });
    };

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
        e.dataTransfer.setData("text/plain", "reorder-step");
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

    // Validate all steps
    useEffect(() => {
        const newErrors = {};
        let isValid = true;
        let hasQuestionStep = false;

        // Require at least one step
        if (questions.length === 0) {
            isValid = false;
        }

        questions.forEach((question) => {
            const questionErrors = {};
            const stepType = question.stepType ?? "question";

            if (!stepType) {
                questionErrors.stepType = "Step type is required";
                isValid = false;
            }

            // Validate title - required for all steps
            if (!question.title?.trim()) {
                questionErrors.title = "Step title is required";
                isValid = false;
            }

            if (stepType === "question") {
                hasQuestionStep = true;
            }

            if (stepType === "question") {
                if (
                    question.type === "single-choice" ||
                    question.type === "multiple-choice" ||
                    question.type === "dropdown-list" ||
                    question.type === "true-false"
                ) {
                    if (!question.options || question.options.length < 2) {
                        questionErrors.options =
                            "At least 2 options are required";
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
            }

            if (stepType === "component" && !question.selectedComponentId) {
                questionErrors.selectedComponentId =
                    "Select a component for this step";
                isValid = false;
            }

            if (stepType === "page" && !question.selectedPageId) {
                questionErrors.selectedPageId = "Select a page for this step";
                isValid = false;
            }

            if (Object.keys(questionErrors).length > 0) {
                newErrors[question.id] = questionErrors;
            }
        });

        if (!hasQuestionStep && questions.length > 0) {
            isValid = false;
        }

        setErrors(() => {
            const merged = { ...newErrors };
            if (!hasQuestionStep && questions.length > 0) {
                questions.forEach((question) => {
                    merged[question.id] = {
                        ...(merged[question.id] || {}),
                        stepType:
                            "At least one step must be a question. Please add or convert a step to a question.",
                    };
                });
            }
            return merged;
        });

        onValidationChange?.(isValid);
    }, [questions, onValidationChange]);

    // Scroll to newly added step
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
        console.log("questions", questions);

        setQuestions([
            ...questions,
            {
                id: newQuestionId,
                title: `Step ${questions.length + 1}`,
                stepType: "",
                description: "",
                type: "",
                required: false,
                options: [],
                correctAnswer: null,
                maxLength: null,
                placeholder: "",
                minValue: null,
                maxValue: null,
                markupImage: "",
                markupImageType: "upload",
                selectedComponentId: null,
                selectedPageId: null,
            },
        ]);
        // Open the new step
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
                stepType: questionToDuplicate.stepType ?? "question",
                options: normalizedOptions,
                correctAnswer: null, // Reset correct answer for the duplicate
            };
            const index = questions.findIndex((q) => q.id === id);
            setQuestions([
                ...questions.slice(0, index + 1),
                newQuestion,
                ...questions.slice(index + 1),
            ]);
            // Open the duplicated step
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

        const newQuestions = questions.map((q) => {
            if (q.id === id) {
                const updated = { ...q, [field]: value };
                const rawStepType =
                    field === "stepType"
                        ? value
                        : updated.stepType !== undefined
                        ? updated.stepType
                        : "question";
                const nextStepType =
                    rawStepType === "" ? "" : rawStepType || "question";

                if (field === "stepType") {
                    updated.title = "";
                    updated.description = "";
                }

                if (field === "stepType" && value === "question") {
                    if (!updated.type) {
                        updated.type = "single-choice";
                    }
                    if (
                        !updated.options ||
                        (Array.isArray(updated.options) &&
                            updated.options.length < 2)
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
                    }
                }
                if (field === "stepType" && value !== "question") {
                    updated.required = false;
                }

                if (field === "stepType") {
                    if (value !== "question") {
                        updated.type = "";
                        updated.options = [];
                        updated.correctAnswer = null;
                    }

                    if (value === "html-markup") {
                        updated.markupImage = "";
                        updated.markupImageType = "upload";
                    }
                    if (value === "component") {
                        updated.selectedComponentId = null;
                        updated.selectedPageId = null;
                        updated.markupImage = "";
                        updated.markupImageType = "upload";
                    }
                    if (value === "page") {
                        updated.selectedComponentId = null;
                        updated.selectedPageId = null;
                        updated.markupImage = "";
                        updated.markupImageType = "upload";
                    }
                    if (value !== "component" && q.selectedComponentId) {
                        updated.selectedComponentId = null;
                    }
                    if (value !== "page" && q.selectedPageId) {
                        updated.selectedPageId = null;
                    }
                }

                if (
                    nextStepType === "question" &&
                    field === "type" &&
                    value === "true-false"
                ) {
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
                if (
                    nextStepType === "question" &&
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
                if (
                    nextStepType === "question" &&
                    field === "type" &&
                    value === "counter"
                ) {
                    updated.options = [];
                    updated.correctAnswer = null;
                }
                if (
                    nextStepType === "question" &&
                    field === "type" &&
                    q.type === "counter" &&
                    (value === "single-choice" ||
                        value === "multiple-choice" ||
                        value === "dropdown-list" ||
                        value === "true-false")
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
        });

        setQuestions(newQuestions);
    };

    const replaceQuestion = (id, updater, fieldsToMark = []) => {
        const newQuestions = questions.map((q) =>
            q.id === id ? updater(q) : q
        );
        setQuestions(newQuestions);
        if (fieldsToMark.length > 0) {
            fieldsToMark.forEach((field) =>
                markQuestionFieldTouched(id, field)
            );
        }
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
    const isStepComplete = (question) => {
        const stepType = question.stepType ?? "question";
        if (!stepType) {
            return false;
        }
        // Check if title is filled
        if (!question.title?.trim()) {
            return false;
        }

        if (stepType === "question") {
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
                <QuestionsToolbar
                    onAddStep={addQuestion}
                    onToggleAll={toggleAllQuestions}
                    hasQuestions={questions.length > 0}
                    allExpanded={allExpanded}
                    hasQuestionStep={questions.some(
                        (q) => (q.stepType ?? "question") === "question"
                    )}
                />

                <div className="space-y-6">
                    {questions.map((question, qIndex) => {
                        const isDraggedOver =
                            dragOverIndex === qIndex &&
                            draggedQuestionIndex !== qIndex;
                        return (
                            <QuestionCard
                                key={question.id}
                                question={question}
                                index={qIndex}
                                questionRef={(el) => {
                                    if (el) {
                                        questionRefs.current[question.id] = el;
                                    } else {
                                        delete questionRefs.current[
                                            question.id
                                        ];
                                    }
                                }}
                                isDraggedOver={isDraggedOver}
                                isDragging={draggedQuestionIndex === qIndex}
                                expanded={expandedQuestions.has(question.id)}
                                isStepComplete={isStepComplete(question)}
                                errors={errors[question.id]}
                                touched={touched[question.id]}
                                onToggleExpanded={() =>
                                    toggleQuestionExpanded(question.id)
                                }
                                onDuplicate={() =>
                                    duplicateQuestion(question.id)
                                }
                                onRemove={() => removeQuestion(question.id)}
                                onDragStart={(e) =>
                                    handleQuestionDragStart(e, qIndex)
                                }
                                onDragOver={(e) =>
                                    handleQuestionDragOver(e, qIndex)
                                }
                                onDragEnd={handleQuestionDragEnd}
                                onDrop={(e) => handleQuestionDrop(e, qIndex)}
                                onUpdateQuestion={updateQuestion}
                                onUpdateOption={updateOption}
                                onUpdateOptionImage={updateOptionImage}
                                onUpdateOptionImageType={updateOptionImageType}
                                onUpdateOptionHasImage={updateOptionHasImage}
                                onAddOption={addOption}
                                onRemoveOption={removeOption}
                                onMarkQuestionFieldTouched={
                                    markQuestionFieldTouched
                                }
                                onMarkQuestionOptionsTouched={
                                    markQuestionOptionsTouched
                                }
                                onReplaceQuestion={replaceQuestion}
                            />
                        );
                    })}
                    {questions.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-lg mb-2">No steps added yet</p>
                            <p className="text-sm">
                                Click &quot;Add Step&quot; to get started
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
