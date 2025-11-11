"use client";

import React, {
    useState,
    useCallback,
    useEffect,
    useRef,
    useMemo,
} from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { CustomCard, CustomCardContent, CustomButton } from "@/components/ui";
import { cn } from "@/utils/cn";
import QuizDetailsStep from "./steps/QuizDetailsStep";
import QuestionsStep from "./steps/QuestionsStep";
import LogicStep from "./steps/LogicStep";
import ResultsStep from "./steps/ResultsStep";
import LogicResultsStep from "./steps/LogicResultsStep";

const ALL_STEPS = [
    { id: 1, name: "Details", component: QuizDetailsStep },
    { id: 2, name: "Steps", component: QuestionsStep },
    { id: 3, name: "Logic", component: LogicStep },
    { id: 4, name: "Results", component: ResultsStep },
    { id: 5, name: "Logic Results", component: LogicResultsStep },
];

export default function QuizBuilder({
    onDataChange,
    initialData,
    initialStep,
    onStepChange,
}) {
    const [currentStep, setCurrentStep] = useState(initialStep || 1);
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [stepValidations, setStepValidations] = useState({});

    // Centralized quiz data state - persists across step navigation
    const [quizData, setQuizData] = useState(
        initialData || {
            // Step 1: Quiz Details
            quizDetails: {
                name: "",
                slug: "",
                requireLogin: false,
                preQuiz: false,
                addThankYouPage: false,
                thankYouTitle: "",
                thankYouDescription: "",
                thankYouImage: "",
                thankYouImageType: "upload",
            },
            // Step 2: Steps
            questions: [],
            // Step 3: Logic
            logic: {
                nodes: [],
                edges: [],
            },
            // Step 4: Results
            results: [
                {
                    id: 1,
                    isDefault: true,
                    title: "",
                    description: "",
                    note: "",
                    image: "",
                    imageType: "upload",
                },
            ],
            // Step 5: Logic Results
            logicResults: {
                nodes: [],
                edges: [],
            },
        }
    );

    // Restore data from initialData if provided (when switching back from preview)
    // Track the last initialData we processed to avoid infinite loops
    const lastInitialDataRef = useRef(null);
    const isRestoringRef = useRef(false);

    useEffect(() => {
        // Skip if no initialData
        if (!initialData || Object.keys(initialData).length === 0) {
            return;
        }

        const initialDataStr = JSON.stringify(initialData);
        const lastInitialDataStr = lastInitialDataRef.current
            ? JSON.stringify(lastInitialDataRef.current)
            : null;

        // Only restore if initialData is actually different from what we last processed
        if (initialDataStr !== lastInitialDataStr) {
            isRestoringRef.current = true;
            lastInitialDataRef.current = initialData;
            setQuizData(initialData);
            prevQuizDataRef.current = initialData;
            // Reset the flag after a brief delay
            setTimeout(() => {
                isRestoringRef.current = false;
            }, 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    // Restore step from initialStep if provided
    useEffect(() => {
        if (initialStep && initialStep !== currentStep) {
            setCurrentStep(initialStep);
        }
    }, [initialStep, currentStep]);

    const updateQuizData = useCallback((step, data) => {
        setQuizData((prev) => {
            const updated = {
                ...prev,
                [step]: data,
            };
            return updated;
        });
    }, []);

    // Track previous quizData to only notify on actual changes
    const prevQuizDataRef = useRef(null);
    const isInitialMountRef = useRef(true);

    // Expose quizData to parent on updates (not during initial render)
    useEffect(() => {
        // Skip on initial mount
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            prevQuizDataRef.current = quizData;
            return;
        }

        // Skip if we're currently restoring data (to avoid infinite loop)
        if (isRestoringRef.current) {
            prevQuizDataRef.current = quizData;
            return;
        }

        // Only notify if data actually changed (deep comparison)
        if (onDataChange) {
            const prevStr = JSON.stringify(prevQuizDataRef.current);
            const currentStr = JSON.stringify(quizData);

            if (prevStr !== currentStr) {
                prevQuizDataRef.current = quizData;
                // Use setTimeout to defer the call to avoid render-time updates
                const timer = setTimeout(() => {
                    onDataChange(quizData);
                }, 0);
                return () => clearTimeout(timer);
            }
        }
    }, [onDataChange, quizData]);

    // Get filtered steps based on useDefaultForAllLogics
    const STEPS = useMemo(() => {
        const useDefaultForAllLogics =
            quizData?.quizDetails?.useDefaultForAllLogics || false;
        if (useDefaultForAllLogics) {
            // Remove step 5 (Logic Results) when useDefaultForAllLogics is true
            return ALL_STEPS.filter((step) => step.id !== 5);
        }
        return ALL_STEPS;
    }, [quizData?.quizDetails?.useDefaultForAllLogics]);

    const handleNext = () => {
        // Check if current step is valid before proceeding
        if (stepValidations[currentStep] && currentStep < STEPS.length) {
            const newStep = currentStep + 1;
            setCurrentStep(newStep);
            if (onStepChange) {
                onStepChange(newStep);
            }
        }
    };

    const handleValidationChange = useCallback((stepId, isValid) => {
        setStepValidations((prev) => ({
            ...prev,
            [stepId]: isValid,
        }));
    }, []);

    const handleCurrentStepValidation = useCallback(
        (isValid) => {
            handleValidationChange(currentStep, isValid);
        },
        [currentStep, handleValidationChange]
    );

    const handlePrevious = () => {
        if (currentStep > 1) {
            const newStep = currentStep - 1;
            setCurrentStep(newStep);
            if (onStepChange) {
                onStepChange(newStep);
            }
        }
    };

    const handleStepClick = (stepId) => {
        // Only allow clicking on completed steps or the next step
        if (stepId <= currentStep || completedSteps.has(stepId - 1)) {
            setCurrentStep(stepId);
            if (onStepChange) {
                onStepChange(stepId);
            }
        }
    };

    const markStepComplete = (stepId) => {
        setCompletedSteps((prev) => new Set([...prev, stepId]));
    };

    const CurrentStepComponent = STEPS.find(
        (step) => step.id === currentStep
    )?.component;

    return (
        <div className="space-y-6">
            {/* Step Indicator */}
            <CustomCard>
                <CustomCardContent className="md:px-6 px-2 py-6">
                    <div className="flex items-center md:justify-center justify-evenly w-full">
                        {STEPS.map((step, index) => (
                            <React.Fragment key={step.id}>
                                {/* Step circle and label */}
                                <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                                    <button
                                        onClick={() => handleStepClick(step.id)}
                                        disabled={
                                            step.id > currentStep &&
                                            !completedSteps.has(step.id - 1)
                                        }
                                        className={cn(
                                            "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 bg-card",
                                            step.id === currentStep
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : step.id < currentStep ||
                                                  completedSteps.has(step.id)
                                                ? "bg-green-500 border-green-500 text-white"
                                                : "bg-background border-muted-foreground/30 text-muted-foreground cursor-not-allowed"
                                        )}
                                    >
                                        {step.id < currentStep ||
                                        completedSteps.has(step.id) ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <span className="font-semibold">
                                                {step.id}
                                            </span>
                                        )}
                                    </button>
                                    <span
                                        className={cn(
                                            "mt-2 text-sm font-medium sm:block hidden whitespace-nowrap",
                                            step.id === currentStep
                                                ? "text-primary"
                                                : step.id < currentStep ||
                                                  completedSteps.has(step.id)
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {step.name}
                                    </span>
                                </div>
                                {/* Connecting line after each step (except last) */}
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={cn(
                                            "flex-1 h-0.5 transition-colors duration-200 md:block hidden mx-2 -mt-5",
                                            step.id < currentStep
                                                ? "bg-green-500"
                                                : "bg-muted-foreground/30"
                                        )}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </CustomCardContent>
            </CustomCard>

            {/* Step Content */}
            <CustomCard>
                <CustomCardContent className="sm:px-6 px-2 py-6">
                    {CurrentStepComponent && (
                        <CurrentStepComponent
                            onComplete={() => markStepComplete(currentStep)}
                            onValidationChange={handleCurrentStepValidation}
                            data={quizData}
                            updateData={updateQuizData}
                        />
                    )}
                </CustomCardContent>
            </CustomCard>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <CustomButton
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sm:block hidden">Previous</span>
                </CustomButton>

                <div className="text-sm text-muted-foreground">
                    Step {currentStep} of {STEPS.length}
                </div>

                <CustomButton
                    onClick={handleNext}
                    disabled={!stepValidations[currentStep]}
                    className="flex items-center gap-2"
                >
                    {currentStep === STEPS.length ||
                    (currentStep === 4 &&
                        quizData?.quizDetails?.useDefaultForAllLogics) ? (
                        <>
                            <span className="sm:block hidden">Submit</span>
                            {/* <ChevronRight className="h-4 w-4" /> */}
                            <Check className="h-4 w-4" />
                        </>
                    ) : (
                        <>
                            <span className="sm:block hidden">Next</span>
                            <ChevronRight className="h-4 w-4" />
                        </>
                    )}
                </CustomButton>
            </div>
        </div>
    );
}
