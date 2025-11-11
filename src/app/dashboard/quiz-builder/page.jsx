"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { PageContainer, PageHeader } from "@/components/ui";
import { CustomButton, CustomModal } from "@/components/ui";
import { QuizBuilder } from "@/features/quiz-builder";
import {
    Eye,
    Save,
    Download,
    Edit,
    FileText,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const STORAGE_KEY = "quiz-builder-draft";

export default function QuizBuilderPage() {
    const [quizData, setQuizData] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [draftData, setDraftData] = useState(null);
    const [isRawJsonOpen, setIsRawJsonOpen] = useState(false);
    const quizDataRef = useRef(null);
    const currentStepRef = useRef(1);

    // Handle data changes from QuizBuilder
    const handleDataChange = useCallback((data) => {
        // Only update if data actually changed (avoid unnecessary updates)
        const currentDataStr = JSON.stringify(quizDataRef.current);
        const newDataStr = JSON.stringify(data);

        if (currentDataStr !== newDataStr) {
            quizDataRef.current = data;
            setQuizData(data);
        }
    }, []);

    // Handle step changes from QuizBuilder
    const handleStepChange = useCallback((step) => {
        currentStepRef.current = step;
        setCurrentStep(step);
    }, []);

    // Load draft from localStorage on mount
    const loadDraft = useCallback(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const data = JSON.parse(saved);
                    setDraftData(data);
                    setShowDraftModal(true);
                }
            } catch (error) {
                console.error("Error loading draft:", error);
            }
        }
    }, []);

    // Handle loading the draft
    const handleLoadDraft = useCallback(() => {
        if (draftData) {
            // Extract currentStep from draftData and remove it from quiz data
            const { currentStep: savedStep, ...quizDataOnly } = draftData;

            setQuizData(quizDataOnly);
            quizDataRef.current = quizDataOnly;

            // Restore the saved step if available
            if (savedStep) {
                setCurrentStep(savedStep);
                currentStepRef.current = savedStep;
            }
            setShowDraftModal(false);
        }
    }, [draftData]);

    // Handle starting a new quiz
    const handleStartNew = useCallback(() => {
        // Clear the draft from localStorage
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY);
        }
        setDraftData(null);
        setShowDraftModal(false);
        // Reset quiz data to default
        setQuizData(null);
        quizDataRef.current = null;
    }, []);

    // Save draft to localStorage
    const handleSaveDraft = useCallback(() => {
        const data = quizDataRef.current || quizData;
        if (!data) {
            toast.warning("No quiz data to save");
            return;
        }

        try {
            // Save data along with current step
            const draftToSave = {
                ...data,
                currentStep: currentStepRef.current || currentStep,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draftToSave));
            toast.success("Draft saved successfully!");
        } catch (error) {
            console.error("Error saving draft:", error);
            toast.error("Failed to save draft");
        }
    }, [quizData, currentStep]);

    // Helper function to generate formatted logic flow
    const generateLogicFlow = useCallback((data) => {
        if (
            !data?.logic?.edges ||
            !data?.questions ||
            data.logic.edges.length === 0
        ) {
            return [];
        }

        return data.logic.edges
            .map((edge) => {
                // Parse source: question-{id}
                const sourceMatch = edge.source.match(/^question-(\d+)/);
                const targetMatch = edge.target.match(/^question-(\d+)/);

                if (!sourceMatch || !targetMatch) return null;

                const sourceQuestionId = parseInt(sourceMatch[1]);
                const targetQuestionId = parseInt(targetMatch[1]);

                // Find question indices
                const sourceQuestionIdx = data.questions.findIndex(
                    (q) => q.id === sourceQuestionId
                );
                const targetQuestionIdx = data.questions.findIndex(
                    (q) => q.id === targetQuestionId
                );

                if (sourceQuestionIdx === -1 || targetQuestionIdx === -1)
                    return null;

                const sourceQuestion = data.questions[sourceQuestionIdx];
                const targetQuestion = data.questions[targetQuestionIdx];

                // Parse option index from sourceHandle
                let optionInfo = null;
                if (
                    edge.sourceHandle &&
                    edge.sourceHandle.includes("option-")
                ) {
                    const optionMatch = edge.sourceHandle.match(/option-(\d+)/);
                    if (optionMatch) {
                        const optionIdx = parseInt(optionMatch[1]);
                        if (
                            sourceQuestion.options &&
                            Array.isArray(sourceQuestion.options) &&
                            sourceQuestion.options[optionIdx]
                        ) {
                            const normalizedOption =
                                typeof sourceQuestion.options[optionIdx] ===
                                "string"
                                    ? {
                                          text: sourceQuestion.options[
                                              optionIdx
                                          ],
                                      }
                                    : sourceQuestion.options[optionIdx];
                            optionInfo = {
                                index: optionIdx + 1,
                                text:
                                    normalizedOption?.text ||
                                    `Option ${optionIdx + 1}`,
                            };
                        }
                    }
                }

                return {
                    from: {
                        questionNumber: sourceQuestionIdx + 1,
                        questionId: sourceQuestionId,
                        questionTitle:
                            sourceQuestion.title ||
                            `Question ${sourceQuestionIdx + 1}`,
                        option: optionInfo,
                    },
                    to: {
                        questionNumber: targetQuestionIdx + 1,
                        questionId: targetQuestionId,
                        questionTitle:
                            targetQuestion.title ||
                            `Question ${targetQuestionIdx + 1}`,
                    },
                    flow: optionInfo
                        ? `Q${sourceQuestionIdx + 1}, O${optionInfo.index} (${
                              optionInfo.text
                          }) → Q${targetQuestionIdx + 1}`
                        : `Q${sourceQuestionIdx + 1} → Q${
                              targetQuestionIdx + 1
                          }`,
                };
            })
            .filter(Boolean);
    }, []);

    // Generate results flow (question/option to result connections)
    const generateResultsFlow = useCallback((data) => {
        if (
            !data?.logicResults?.edges ||
            !data?.questions ||
            !data?.results ||
            data.logicResults.edges.length === 0
        ) {
            return [];
        }

        return data.logicResults.edges
            .map((edge) => {
                // Parse source: question-{id} or question-{id}-option-{index}
                const sourceMatch = edge.source.match(/^question-(\d+)/);
                const resultMatch = edge.target.match(/^result-(\d+)-/);

                if (!sourceMatch) return null;

                const sourceQuestionId = parseInt(sourceMatch[1]);

                // Find question index
                const sourceQuestionIdx = data.questions.findIndex(
                    (q) => q.id === sourceQuestionId
                );

                if (sourceQuestionIdx === -1) return null;

                const sourceQuestion = data.questions[sourceQuestionIdx];

                // Parse option index from sourceHandle
                let optionInfo = null;
                if (
                    edge.sourceHandle &&
                    edge.sourceHandle.includes("option-")
                ) {
                    const optionMatch = edge.sourceHandle.match(/option-(\d+)/);
                    if (optionMatch) {
                        const optionIdx = parseInt(optionMatch[1]);
                        if (
                            sourceQuestion.options &&
                            Array.isArray(sourceQuestion.options) &&
                            sourceQuestion.options[optionIdx]
                        ) {
                            const normalizedOption =
                                typeof sourceQuestion.options[optionIdx] ===
                                "string"
                                    ? {
                                          text: sourceQuestion.options[
                                              optionIdx
                                          ],
                                      }
                                    : sourceQuestion.options[optionIdx];
                            optionInfo = {
                                index: optionIdx + 1,
                                text:
                                    normalizedOption?.text ||
                                    `Option ${optionIdx + 1}`,
                            };
                        }
                    }
                }

                // Find result
                let resultInfo = null;
                if (resultMatch) {
                    const resultId = parseInt(resultMatch[1]);
                    const result = data.results?.find((r) => r.id === resultId);
                    if (result) {
                        resultInfo = {
                            resultId: resultId,
                            resultTitle: result.title || "Untitled Result",
                            isDefault: result.isDefault || false,
                        };
                    }
                } else {
                    // Try to find result by parsing the full ID
                    const fullResultMatch = edge.target.match(/result-(\d+)-/);
                    if (fullResultMatch) {
                        const resultId = parseInt(fullResultMatch[1]);
                        const result = data.results?.find(
                            (r) => r.id === resultId
                        );
                        if (result) {
                            resultInfo = {
                                resultId: resultId,
                                resultTitle: result.title || "Untitled Result",
                                isDefault: result.isDefault || false,
                            };
                        }
                    }
                }

                if (!resultInfo) return null;

                return {
                    from: {
                        questionNumber: sourceQuestionIdx + 1,
                        questionId: sourceQuestionId,
                        questionTitle:
                            sourceQuestion.title ||
                            `Question ${sourceQuestionIdx + 1}`,
                        option: optionInfo,
                    },
                    to: {
                        resultId: resultInfo.resultId,
                        resultTitle: resultInfo.resultTitle,
                        isDefault: resultInfo.isDefault,
                    },
                    flow: optionInfo
                        ? `Q${sourceQuestionIdx + 1}, O${optionInfo.index} (${
                              optionInfo.text
                          }) → ${resultInfo.resultTitle}`
                        : `Q${sourceQuestionIdx + 1} → ${
                              resultInfo.resultTitle
                          }`,
                };
            })
            .filter(Boolean);
    }, []);

    const prepareDataForOutput = useCallback(
        (inputData) => {
            if (!inputData) return null;
            const cloned = JSON.parse(JSON.stringify(inputData));
            if (cloned.currentStep !== undefined) {
                delete cloned.currentStep;
            }

            const hasQuestions =
                cloned.questions && Array.isArray(cloned.questions);
            if (hasQuestions) {
                const sanitizedSteps = cloned.questions.map((q) => {
                    const { required, ...rest } = q;
                    const stepData = { ...rest };

                    if (!stepData.stepType && stepData.type) {
                        stepData.stepType = "question";
                    }

                    if (stepData.stepType === "question") {
                        stepData.questionType = stepData.type || "";
                        const hasOptions =
                            stepData.type === "single-choice" ||
                            stepData.type === "multiple-choice" ||
                            stepData.type === "true-false" ||
                            stepData.type === "dropdown-list";
                        if (!hasOptions) {
                            delete stepData.options;
                        }
                    } else {
                        delete stepData.options;
                    }

                    if (stepData.stepType !== "question") {
                        delete stepData.questionType;
                    }

                    return stepData;
                });

                cloned.steps = sanitizedSteps;
            }

            const flow = generateLogicFlow(cloned);
            if (flow.length > 0) {
                cloned.flow = flow;
            }

            const resultsFlow = generateResultsFlow(cloned);
            if (resultsFlow.length > 0) {
                cloned.resultsFlow = resultsFlow;
            }

            if (hasQuestions) {
                delete cloned.questions;
            }

            return cloned;
        },
        [generateLogicFlow, generateResultsFlow]
    );

    // Export to JSON file
    const handleExport = useCallback(() => {
        const data = quizDataRef.current || quizData;
        if (!data) {
            toast.warning("No quiz data to export");
            return;
        }

        try {
            const cleanData = prepareDataForOutput(data);
            if (!cleanData) {
                toast.error("Unable to prepare quiz data for export");
                return;
            }

            const jsonString = JSON.stringify(cleanData, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `quiz-${
                cleanData?.quizDetails?.name || "export"
            }-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Quiz exported successfully!");
        } catch (error) {
            console.error("Error exporting quiz:", error);
            toast.error("Failed to export quiz");
        }
    }, [quizData, prepareDataForOutput]);

    // Toggle preview mode
    const handlePreview = useCallback(() => {
        if (isPreviewMode) {
            // Switch back to edit mode
            setIsPreviewMode(false);
        } else {
            // Switch to preview mode - save current state first
            const data = quizDataRef.current || quizData;
            if (!data) {
                toast.warning("No quiz data to preview");
                return;
            }

            // Auto-save draft when switching to preview
            try {
                const draftToSave = {
                    ...data,
                    currentStep: currentStepRef.current || currentStep,
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(draftToSave));
            } catch (error) {
                console.error("Error auto-saving draft:", error);
            }

            setIsPreviewMode(true);
        }
    }, [isPreviewMode, quizData, currentStep]);

    // Render preview content
    const renderPreview = () => {
        const data = quizDataRef.current || quizData;
        if (!data) return null;

        // Remove currentStep from data if it exists (shouldn't be in quiz data, but just in case)
        const { currentStep: _, ...cleanData } = data;

        return (
            <div className="space-y-6">
                <div className="bg-card border rounded-lg sm:px-8 px-2 py-8">
                    <h1 className="text-3xl font-bold mb-8">
                        Quiz Preview:{" "}
                        {data?.quizDetails?.name || "Untitled Quiz"}
                    </h1>

                    <div className="space-y-8">
                        {/* Quiz Details */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                                Quiz Details
                            </h2>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-semibold text-muted-foreground">
                                        Name:
                                    </span>{" "}
                                    <span className="ml-2">
                                        {data?.quizDetails?.name || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-muted-foreground">
                                        Slug:
                                    </span>{" "}
                                    <span className="ml-2">
                                        {data?.quizDetails?.slug || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-muted-foreground">
                                        Require Login:
                                    </span>{" "}
                                    <span className="ml-2">
                                        {data?.quizDetails?.requireLogin
                                            ? "Yes"
                                            : "No"}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-muted-foreground">
                                        Pre-Quiz:
                                    </span>{" "}
                                    <span className="ml-2">
                                        {data?.quizDetails?.preQuiz
                                            ? "Yes"
                                            : "No"}
                                    </span>
                                </div>
                                {/* Thank You Page */}
                                {data?.quizDetails?.addThankYouPage && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <div className="font-semibold text-muted-foreground mb-2">
                                            Thank You Page:
                                        </div>
                                        {data?.quizDetails?.thankYouTitle && (
                                            <div className="mb-2">
                                                <span className="text-sm text-muted-foreground">
                                                    Title:
                                                </span>{" "}
                                                <span className="ml-2">
                                                    {
                                                        data.quizDetails
                                                            .thankYouTitle
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        {data?.quizDetails
                                            ?.thankYouDescription && (
                                            <div className="mb-2">
                                                <span className="text-sm text-muted-foreground">
                                                    Description:
                                                </span>{" "}
                                                <div className="ml-2 mt-1 text-sm">
                                                    {
                                                        data.quizDetails
                                                            .thankYouDescription
                                                    }
                                                </div>
                                            </div>
                                        )}
                                        {data?.quizDetails?.thankYouImage && (
                                            <div className="mt-3">
                                                <span className="text-sm text-muted-foreground block mb-2">
                                                    Image:
                                                </span>
                                                <img
                                                    src={
                                                        data.quizDetails
                                                            .thankYouImage
                                                    }
                                                    alt="Thank you page"
                                                    className="max-w-full h-auto max-h-64 rounded-md border border-input object-contain"
                                                    onError={(e) => {
                                                        e.target.style.display =
                                                            "none";
                                                    }}
                                                />
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {data.quizDetails
                                                        .thankYouImageType ===
                                                    "link" ? (
                                                        <div className="text-xs  text-ellipsis  line-clamp-[2] mt-1">
                                                            Link:
                                                            <a
                                                                href={
                                                                    data
                                                                        .quizDetails
                                                                        .thankYouImage
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {" "}
                                                                {
                                                                    data
                                                                        .quizDetails
                                                                        .thankYouImage
                                                                }
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        "Uploaded image"
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Steps */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                                Steps ({data?.questions?.length || 0})
                            </h2>
                            {data?.questions && data.questions.length > 0 ? (
                                <div className="space-y-4">
                                    {data.questions.map((q, idx) => {
                                        const getOptionText = (opt) => {
                                            return typeof opt === "string"
                                                ? opt
                                                : opt?.text || opt || "";
                                        };
                                        const normalizeOption = (opt) => {
                                            if (typeof opt === "string") {
                                                return {
                                                    text: opt,
                                                    image: "",
                                                    imageType: "upload",
                                                    hasImage: false,
                                                };
                                            }
                                            return {
                                                text: opt?.text || "",
                                                image: opt?.image || "",
                                                imageType:
                                                    opt?.imageType || "upload",
                                                hasImage:
                                                    opt?.hasImage || false,
                                            };
                                        };
                                        return (
                                            <div
                                                key={idx}
                                                className="bg-muted/50 p-4 rounded-lg"
                                            >
                                                <div className="font-semibold mb-2">
                                                    Step {idx + 1}:{" "}
                                                    {q.title || "Untitled Step"}
                                                </div>
                                                <div className="text-sm text-muted-foreground mb-2 space-y-1">
                                                    <div>
                                                        Step Type:{" "}
                                                        {q.stepType
                                                            ? q.stepType
                                                                  .charAt(0)
                                                                  .toUpperCase() +
                                                              q.stepType.slice(
                                                                  1
                                                              )
                                                            : "N/A"}
                                                    </div>
                                                    {q.stepType ===
                                                        "question" && (
                                                        <div>
                                                            Question Type:{" "}
                                                            {q.type
                                                                ? q.type
                                                                      .charAt(0)
                                                                      .toUpperCase() +
                                                                  q.type.slice(
                                                                      1
                                                                  )
                                                                : "N/A"}
                                                        </div>
                                                    )}
                                                </div>
                                                {q.description && (
                                                    <div className="text-sm text-muted-foreground mb-2">
                                                        {q.description}
                                                    </div>
                                                )}
                                                {/* Only show options for question types that have options */}
                                                {(() => {
                                                    const hasOptions =
                                                        q.stepType ===
                                                            "question" &&
                                                        (q.type ===
                                                            "single-choice" ||
                                                            q.type ===
                                                                "multiple-choice" ||
                                                            q.type ===
                                                                "true-false" ||
                                                            q.type ===
                                                                "dropdown-list");
                                                    return (
                                                        hasOptions &&
                                                        q.options &&
                                                        q.options.length >
                                                            0 && (
                                                            <div className="mt-3">
                                                                <div className="font-semibold text-sm mb-2">
                                                                    Options:
                                                                </div>
                                                                <ul className="space-y-3 text-sm">
                                                                    {q.options.map(
                                                                        (
                                                                            opt,
                                                                            optIdx
                                                                        ) => {
                                                                            const normalizedOpt =
                                                                                normalizeOption(
                                                                                    opt
                                                                                );
                                                                            return (
                                                                                <li
                                                                                    key={
                                                                                        optIdx
                                                                                    }
                                                                                    className="flex flex-col gap-2"
                                                                                >
                                                                                    <div className="flex items-start gap-2">
                                                                                        <span className="font-medium">
                                                                                            {optIdx +
                                                                                                1}

                                                                                            .
                                                                                        </span>
                                                                                        <span className="flex-1">
                                                                                            {getOptionText(
                                                                                                opt
                                                                                            )}
                                                                                        </span>
                                                                                    </div>
                                                                                    {normalizedOpt.hasImage &&
                                                                                        normalizedOpt.image && (
                                                                                            <div className="ml-6">
                                                                                                <img
                                                                                                    src={
                                                                                                        normalizedOpt.image
                                                                                                    }
                                                                                                    alt={`Option ${
                                                                                                        optIdx +
                                                                                                        1
                                                                                                    }`}
                                                                                                    className="max-w-full h-auto max-h-32 rounded-md border border-input object-contain"
                                                                                                    onError={(
                                                                                                        e
                                                                                                    ) => {
                                                                                                        e.target.style.display =
                                                                                                            "none";
                                                                                                    }}
                                                                                                />
                                                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                                                    {normalizedOpt.imageType ===
                                                                                                    "link"
                                                                                                        ? "Link: " +
                                                                                                          normalizedOpt.image
                                                                                                        : "Uploaded image"}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                </li>
                                                                            );
                                                                        }
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )
                                                    );
                                                })()}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">
                                    No steps added yet.
                                </p>
                            )}
                        </div>

                        {/* Logic */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                                Logic
                            </h2>
                            {data?.logic?.edges &&
                            data.logic.edges.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Logic Flow Text Format */}
                                    <div>
                                        <h3 className="font-semibold mb-2">
                                            Logic Flow:
                                        </h3>
                                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                            {data.logic.edges.map(
                                                (edge, edgeIdx) => {
                                                    // Parse source: question-{id} or question-{id}-option-{index}
                                                    const sourceMatch =
                                                        edge.source.match(
                                                            /^question-(\d+)/
                                                        );
                                                    const targetMatch =
                                                        edge.target.match(
                                                            /^question-(\d+)/
                                                        );

                                                    if (
                                                        !sourceMatch ||
                                                        !targetMatch
                                                    )
                                                        return null;

                                                    const sourceQuestionId =
                                                        parseInt(
                                                            sourceMatch[1]
                                                        );
                                                    const targetQuestionId =
                                                        parseInt(
                                                            targetMatch[1]
                                                        );

                                                    // Find question indices
                                                    const sourceQuestionIdx =
                                                        data.questions.findIndex(
                                                            (q) =>
                                                                q.id ===
                                                                sourceQuestionId
                                                        );
                                                    const targetQuestionIdx =
                                                        data.questions.findIndex(
                                                            (q) =>
                                                                q.id ===
                                                                targetQuestionId
                                                        );

                                                    if (
                                                        sourceQuestionIdx ===
                                                            -1 ||
                                                        targetQuestionIdx === -1
                                                    )
                                                        return null;

                                                    const sourceQuestion =
                                                        data.questions[
                                                            sourceQuestionIdx
                                                        ];
                                                    const targetQuestion =
                                                        data.questions[
                                                            targetQuestionIdx
                                                        ];

                                                    // Parse option index from sourceHandle
                                                    let optionInfo = "";
                                                    if (
                                                        edge.sourceHandle &&
                                                        edge.sourceHandle.includes(
                                                            "option-"
                                                        )
                                                    ) {
                                                        const optionMatch =
                                                            edge.sourceHandle.match(
                                                                /option-(\d+)/
                                                            );
                                                        if (optionMatch) {
                                                            const optionIdx =
                                                                parseInt(
                                                                    optionMatch[1]
                                                                );
                                                            const normalizedOption =
                                                                typeof sourceQuestion
                                                                    .options[
                                                                    optionIdx
                                                                ] === "string"
                                                                    ? {
                                                                          text: sourceQuestion
                                                                              .options[
                                                                              optionIdx
                                                                          ],
                                                                      }
                                                                    : sourceQuestion
                                                                          .options[
                                                                          optionIdx
                                                                      ];
                                                            optionInfo = `, O${
                                                                optionIdx + 1
                                                            } (${
                                                                normalizedOption?.text ||
                                                                "Option " +
                                                                    (optionIdx +
                                                                        1)
                                                            })`;
                                                        }
                                                    }

                                                    return (
                                                        <div
                                                            key={edgeIdx}
                                                            className="flex items-center gap-2 text-sm"
                                                        >
                                                            <span className="font-semibold">
                                                                Q
                                                                {sourceQuestionIdx +
                                                                    1}
                                                                {optionInfo}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                →
                                                            </span>
                                                            <span className="font-semibold">
                                                                Q
                                                                {targetQuestionIdx +
                                                                    1}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground ml-2">
                                                                (
                                                                {sourceQuestion.title ||
                                                                    "Question " +
                                                                        (sourceQuestionIdx +
                                                                            1)}
                                                                {" → "}
                                                                {targetQuestion.title ||
                                                                    "Question " +
                                                                        (targetQuestionIdx +
                                                                            1)}
                                                                )
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>

                                    {/* Logic Flow Visual Diagram */}
                                    <div>
                                        <h3 className="font-semibold mb-2">
                                            Visual Flow:
                                        </h3>
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <div className="flex flex-wrap gap-4 items-center justify-start">
                                                {data.questions.map(
                                                    (q, qIdx) => {
                                                        const questionEdges =
                                                            data.logic.edges.filter(
                                                                (e) =>
                                                                    e.source.match(
                                                                        /^question-(\d+)/
                                                                    )?.[1] ==
                                                                    q.id
                                                            );
                                                        const incomingEdges =
                                                            data.logic.edges.filter(
                                                                (e) =>
                                                                    e.target.match(
                                                                        /^question-(\d+)/
                                                                    )?.[1] ==
                                                                    q.id
                                                            );

                                                        return (
                                                            <div
                                                                key={qIdx}
                                                                className="flex flex-col items-center gap-2"
                                                            >
                                                                {/* Incoming arrows */}
                                                                {incomingEdges.length >
                                                                    0 && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        ↑
                                                                    </div>
                                                                )}

                                                                {/* Question box */}
                                                                <div className="bg-card border-2 border-primary rounded-lg px-4 py-2 min-w-[150px] text-center">
                                                                    <div className="font-semibold text-sm">
                                                                        Q
                                                                        {qIdx +
                                                                            1}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground truncate">
                                                                        {q.title ||
                                                                            "Question " +
                                                                                (qIdx +
                                                                                    1)}
                                                                    </div>
                                                                </div>

                                                                {/* Outgoing arrows */}
                                                                {questionEdges.length >
                                                                    0 && (
                                                                    <div className="flex flex-col gap-1">
                                                                        {questionEdges.map(
                                                                            (
                                                                                edge,
                                                                                eIdx
                                                                            ) => {
                                                                                const targetMatch =
                                                                                    edge.target.match(
                                                                                        /^question-(\d+)/
                                                                                    );
                                                                                if (
                                                                                    !targetMatch
                                                                                )
                                                                                    return null;
                                                                                const targetQuestionId =
                                                                                    parseInt(
                                                                                        targetMatch[1]
                                                                                    );
                                                                                const targetQuestionIdx =
                                                                                    data.questions.findIndex(
                                                                                        (
                                                                                            q
                                                                                        ) =>
                                                                                            q.id ===
                                                                                            targetQuestionId
                                                                                    );

                                                                                // Parse option
                                                                                let optionLabel =
                                                                                    "";
                                                                                if (
                                                                                    edge.sourceHandle &&
                                                                                    edge.sourceHandle.includes(
                                                                                        "option-"
                                                                                    )
                                                                                ) {
                                                                                    const optionMatch =
                                                                                        edge.sourceHandle.match(
                                                                                            /option-(\d+)/
                                                                                        );
                                                                                    if (
                                                                                        optionMatch
                                                                                    ) {
                                                                                        const optionIdx =
                                                                                            parseInt(
                                                                                                optionMatch[1]
                                                                                            );
                                                                                        optionLabel = `O${
                                                                                            optionIdx +
                                                                                            1
                                                                                        }`;
                                                                                    }
                                                                                }

                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            eIdx
                                                                                        }
                                                                                        className="flex items-center gap-1 text-xs"
                                                                                    >
                                                                                        {optionLabel && (
                                                                                            <span className="text-primary font-semibold">
                                                                                                {
                                                                                                    optionLabel
                                                                                                }
                                                                                            </span>
                                                                                        )}
                                                                                        <span className="text-muted-foreground">
                                                                                            ↓
                                                                                        </span>
                                                                                        <span className="text-primary font-semibold">
                                                                                            Q
                                                                                            {targetQuestionIdx +
                                                                                                1}
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">
                                    No logic rules configured yet.
                                </p>
                            )}
                        </div>

                        {/* Results */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                                Results ({data?.results?.length || 0})
                            </h2>
                            {data?.results && data.results.length > 0 ? (
                                <div className="space-y-4">
                                    {data.results.map((r, idx) => (
                                        <div
                                            key={r.id || idx}
                                            className="bg-muted/50 p-4 rounded-lg space-y-4"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold">
                                                    {r.isDefault
                                                        ? "Default Result"
                                                        : `Result ${idx + 1}`}
                                                </span>
                                                {r.isDefault && (
                                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            {r.title && (
                                                <div className="mb-2">
                                                    <span className="font-semibold text-sm">
                                                        Result Title:
                                                    </span>{" "}
                                                    <span className="ml-2">
                                                        {r.title}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Continue Popup and Add-ons */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">
                                                        Continue Popup:
                                                    </span>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${
                                                            r.continuePopup
                                                                ? "bg-green-500/10 text-green-500"
                                                                : "bg-gray-500/10 text-gray-500"
                                                        }`}
                                                    >
                                                        {r.continuePopup
                                                            ? "Yes"
                                                            : "No"}
                                                    </span>
                                                </div>
                                                {r.continuePopup && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">
                                                            Add-ons:
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs ${
                                                                r.addons
                                                                    ? "bg-green-500/10 text-green-500"
                                                                    : "bg-gray-500/10 text-gray-500"
                                                            }`}
                                                        >
                                                            {r.addons
                                                                ? "Yes"
                                                                : "No"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Products */}
                                            {r.products &&
                                                Array.isArray(r.products) &&
                                                r.products.length > 0 && (
                                                    <div className="mt-4">
                                                        <span className="font-semibold text-sm block mb-3">
                                                            Products (
                                                            {r.products.length}
                                                            ):
                                                        </span>
                                                        <div className="space-y-3">
                                                            {r.products.map(
                                                                (
                                                                    product,
                                                                    productIdx
                                                                ) => {
                                                                    const productId =
                                                                        product.id ||
                                                                        product._id;
                                                                    const productName =
                                                                        product.name ||
                                                                        product.title ||
                                                                        "Unnamed Product";
                                                                    const productPrice =
                                                                        product.basePrice ||
                                                                        product.price ||
                                                                        product.amount ||
                                                                        "0.00";
                                                                    const productDescription =
                                                                        product.description ||
                                                                        product.shortDescription ||
                                                                        "";
                                                                    const productImage =
                                                                        product.images &&
                                                                        product
                                                                            .images
                                                                            .length >
                                                                            0
                                                                            ? product
                                                                                  .images[0]
                                                                                  .url ||
                                                                              product
                                                                                  .images[0]
                                                                                  .src
                                                                            : null;
                                                                    const isPrimary =
                                                                        product.isPrimary ||
                                                                        false;

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                productId ||
                                                                                productIdx
                                                                            }
                                                                            className="border rounded-lg p-3 bg-background"
                                                                        >
                                                                            <div className="flex gap-3">
                                                                                <div className="w-20 h-20 rounded-md border border-input flex items-center justify-center bg-muted shrink-0 relative overflow-hidden">
                                                                                    {productImage ? (
                                                                                        <img
                                                                                            src={
                                                                                                productImage
                                                                                            }
                                                                                            alt={
                                                                                                productName
                                                                                            }
                                                                                            className="w-full h-full object-cover rounded-md"
                                                                                            onError={(
                                                                                                e
                                                                                            ) => {
                                                                                                e.target.style.display =
                                                                                                    "none";
                                                                                                const placeholder =
                                                                                                    e.target.parentElement.querySelector(
                                                                                                        ".no-image-placeholder"
                                                                                                    );
                                                                                                if (
                                                                                                    placeholder
                                                                                                ) {
                                                                                                    placeholder.style.display =
                                                                                                        "flex";
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    ) : null}
                                                                                    <div
                                                                                        className="no-image-placeholder w-full h-full flex items-center justify-center text-xs text-muted-foreground"
                                                                                        style={{
                                                                                            display:
                                                                                                productImage
                                                                                                    ? "none"
                                                                                                    : "flex",
                                                                                        }}
                                                                                    >
                                                                                        No
                                                                                        Image
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex-1 space-y-1">
                                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                                        <span className="font-semibold">
                                                                                            {
                                                                                                productName
                                                                                            }
                                                                                        </span>
                                                                                        {isPrimary && (
                                                                                            <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                                                                                                Primary
                                                                                            </span>
                                                                                        )}
                                                                                        <span className="text-lg font-bold text-primary">
                                                                                            $
                                                                                            {
                                                                                                productPrice
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                    {productDescription && (
                                                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                                                            {
                                                                                                productDescription
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">
                                    No results configured yet.
                                </p>
                            )}
                        </div>

                        {/* Logic Results */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                                Logic Results
                            </h2>
                            {data?.logicResults?.edges &&
                            data.logicResults.edges.length > 0 ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">
                                            Question/Option to Result
                                            Connections:
                                        </h3>
                                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                            {data.logicResults.edges.map(
                                                (edge, edgeIdx) => {
                                                    // Parse source: question-{id} or question-{id}-option-{index}
                                                    const sourceMatch =
                                                        edge.source.match(
                                                            /^question-(\d+)/
                                                        );
                                                    const resultMatch =
                                                        edge.target.match(
                                                            /^result-(\d+)-/
                                                        );

                                                    if (!sourceMatch)
                                                        return null;

                                                    const sourceQuestionId =
                                                        parseInt(
                                                            sourceMatch[1]
                                                        );

                                                    // Find question index
                                                    const sourceQuestionIdx =
                                                        data.questions.findIndex(
                                                            (q) =>
                                                                q.id ===
                                                                sourceQuestionId
                                                        );

                                                    if (
                                                        sourceQuestionIdx === -1
                                                    )
                                                        return null;

                                                    const sourceQuestion =
                                                        data.questions[
                                                            sourceQuestionIdx
                                                        ];

                                                    // Parse option index from sourceHandle
                                                    let optionInfo = "";
                                                    if (
                                                        edge.sourceHandle &&
                                                        edge.sourceHandle.includes(
                                                            "option-"
                                                        )
                                                    ) {
                                                        const optionMatch =
                                                            edge.sourceHandle.match(
                                                                /option-(\d+)/
                                                            );
                                                        if (optionMatch) {
                                                            const optionIdx =
                                                                parseInt(
                                                                    optionMatch[1]
                                                                );
                                                            if (
                                                                sourceQuestion.options &&
                                                                Array.isArray(
                                                                    sourceQuestion.options
                                                                ) &&
                                                                sourceQuestion
                                                                    .options[
                                                                    optionIdx
                                                                ]
                                                            ) {
                                                                const normalizedOption =
                                                                    typeof sourceQuestion
                                                                        .options[
                                                                        optionIdx
                                                                    ] ===
                                                                    "string"
                                                                        ? {
                                                                              text: sourceQuestion
                                                                                  .options[
                                                                                  optionIdx
                                                                              ],
                                                                          }
                                                                        : sourceQuestion
                                                                              .options[
                                                                              optionIdx
                                                                          ];
                                                                optionInfo = `, O${
                                                                    optionIdx +
                                                                    1
                                                                } (${
                                                                    normalizedOption?.text ||
                                                                    "Option " +
                                                                        (optionIdx +
                                                                            1)
                                                                })`;
                                                            }
                                                        }
                                                    }

                                                    // Find result
                                                    let resultInfo = "";
                                                    if (resultMatch) {
                                                        const resultId =
                                                            parseInt(
                                                                resultMatch[1]
                                                            );
                                                        const result =
                                                            data.results?.find(
                                                                (r) =>
                                                                    r.id ===
                                                                    resultId
                                                            );
                                                        if (result) {
                                                            resultInfo =
                                                                result.title ||
                                                                "Untitled Result";
                                                        }
                                                    } else {
                                                        // Try to find result by parsing the full ID
                                                        const fullResultMatch =
                                                            edge.target.match(
                                                                /result-(\d+)-/
                                                            );
                                                        if (fullResultMatch) {
                                                            const resultId =
                                                                parseInt(
                                                                    fullResultMatch[1]
                                                                );
                                                            const result =
                                                                data.results?.find(
                                                                    (r) =>
                                                                        r.id ===
                                                                        resultId
                                                                );
                                                            if (result) {
                                                                resultInfo =
                                                                    result.title ||
                                                                    "Untitled Result";
                                                            }
                                                        }
                                                    }

                                                    return (
                                                        <div
                                                            key={edgeIdx}
                                                            className="flex items-center gap-2 text-sm"
                                                        >
                                                            <span className="font-semibold">
                                                                Q
                                                                {sourceQuestionIdx +
                                                                    1}
                                                                {optionInfo}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                →
                                                            </span>
                                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                                {resultInfo ||
                                                                    "Result"}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground ml-2">
                                                                (
                                                                {sourceQuestion.title ||
                                                                    "Question " +
                                                                        (sourceQuestionIdx +
                                                                            1)}
                                                                {" → "}
                                                                {resultInfo})
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">
                                    No logic results configured yet.
                                </p>
                            )}
                        </div>

                        {/* Raw JSON */}
                        <div>
                            <button
                                onClick={() => setIsRawJsonOpen(!isRawJsonOpen)}
                                className="flex items-center justify-between w-full text-xl font-semibold mb-4 pb-2 border-b hover:text-primary transition-colors"
                            >
                                <span>Raw JSON</span>
                                {isRawJsonOpen ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </button>
                            {isRawJsonOpen && (
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                    {JSON.stringify(
                                        prepareDataForOutput(data),
                                        null,
                                        2
                                    )}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Load draft on mount
    useEffect(() => {
        loadDraft();
    }, [loadDraft]);

    return (
        <PageContainer>
            <div className="flex sm:items-center justify-between mb-6 sm:flex-row flex-col md:gap-4 gap-2 w-full">
                <PageHeader
                    className="w-full"
                    title="Quiz Builder"
                    description="Create and manage your quizzes"
                    action={
                        <div className="flex items-center gap-2 flex-wrap sm:text-base text-sm">
                            <CustomButton
                                onClick={handlePreview}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                {isPreviewMode ? (
                                    <>
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </>
                                )}
                            </CustomButton>
                            <CustomButton
                                onClick={handleSaveDraft}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save Draft
                            </CustomButton>
                            <CustomButton
                                onClick={handleExport}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </CustomButton>
                        </div>
                    }
                />
            </div>
            <div className="mt-6">
                {!isPreviewMode && (
                    <QuizBuilder
                        onDataChange={handleDataChange}
                        onStepChange={handleStepChange}
                        initialData={quizData}
                        initialStep={currentStep}
                    />
                )}
                {isPreviewMode && <div>{renderPreview()}</div>}
            </div>

            {/* Draft Modal */}
            <CustomModal
                isOpen={showDraftModal}
                onClose={handleStartNew}
                title="Saved Draft Found"
                size="md"
            >
                <div className="space-y-6">
                    <div className="flex items-start gap-4 p-2">
                        <div className="p-3 bg-primary/10 rounded-lg sm:block hidden">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-4">
                                A saved draft was found. Would you like to load
                                it or start a new quiz?
                            </p>
                            {draftData?.quizDetails?.name && (
                                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                                    <div className="text-xs text-muted-foreground mb-1">
                                        Draft Quiz Name:
                                    </div>
                                    <div className="font-semibold text-foreground">
                                        {draftData.quizDetails.name ||
                                            "Untitled Quiz"}
                                    </div>
                                    {draftData.questions?.length > 0 && (
                                        <div className="text-xs text-muted-foreground mt-2">
                                            {draftData.questions.length}{" "}
                                            question(s)
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border px-2">
                        <CustomButton
                            onClick={handleStartNew}
                            variant="outline"
                            size="sm"
                        >
                            Start New
                        </CustomButton>
                        <CustomButton
                            onClick={handleLoadDraft}
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            Load Draft
                        </CustomButton>
                    </div>
                </div>
            </CustomModal>
        </PageContainer>
    );
}
