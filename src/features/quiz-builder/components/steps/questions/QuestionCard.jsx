import { useMemo, useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Copy,
    GripVertical,
    Link2,
    Plus,
    Trash2,
    X,
    XCircle,
} from "lucide-react";
import {
    CustomButton,
    CustomInput,
    CustomLabel,
    FormField,
    Tooltip,
} from "@/components/ui";
import { SingleImageUpload } from "../../SingleImageUpload";
import { cn } from "@/utils/cn";
import {
    getOptionText,
    normalizeOption,
} from "@/features/quiz-builder/components/steps/questions/utils";

const COMPONENT_OPTIONS = [
    {
        id: "hero-banner",
        label: "Hero Banner",
        description: "Full-width hero section with headline, copy, and CTA.",
    },
    {
        id: "feature-grid",
        label: "Feature Grid",
        description: "Three-column layout for highlighting product features.",
    },
    {
        id: "testimonial-slider",
        label: "Testimonial Slider",
        description: "Carousel showcasing customer testimonials.",
    },
    {
        id: "faq-accordion",
        label: "FAQ Accordion",
        description: "Collapsible list for frequently asked questions.",
    },
    {
        id: "pricing-table",
        label: "Pricing Table",
        description: "Tiered pricing comparison with highlighted plan.",
    },
];

const PAGE_OPTIONS = [
    {
        id: "about",
        label: "About Us",
        description: "Company story, mission, and values overview.",
    },
    {
        id: "contact",
        label: "Contact",
        description: "Contact form with location and support details.",
    },
    {
        id: "services",
        label: "Services",
        description: "List of services with supporting descriptions.",
    },
    {
        id: "blog-home",
        label: "Blog Home",
        description: "Featured posts and latest articles feed.",
    },
    {
        id: "careers",
        label: "Careers",
        description: "Open roles, benefits, and company culture highlights.",
    },
];
export function QuestionCard({
    question,
    index,
    questionRef,
    isDraggedOver,
    isDragging,
    expanded,
    isStepComplete,
    errors,
    touched,
    onToggleExpanded,
    onDuplicate,
    onRemove,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
    onUpdateQuestion,
    onUpdateOption,
    onUpdateOptionImage,
    onUpdateOptionImageType,
    onUpdateOptionHasImage,
    onAddOption,
    onRemoveOption,
    onMarkQuestionFieldTouched,
    onMarkQuestionOptionsTouched,
    onReplaceQuestion,
}) {
    const stepType = question.stepType ?? "question";
    const questionTypeLabel = useMemo(
        () => getQuestionTypeLabel(question.type),
        [question.type]
    );

    const stepTypeLabel = useMemo(
        () => getStepTypeLabel(stepType, questionTypeLabel),
        [stepType, questionTypeLabel]
    );

    return (
        <div
            ref={questionRef}
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            className={cn(
                "border rounded-lg p-6 space-y-6 bg-card transition-all duration-200",
                isDraggedOver && "border-primary border-2 shadow-lg",
                isDragging && "opacity-50"
            )}
        >
            <QuestionHeader
                index={index}
                question={question}
                stepTypeLabel={stepTypeLabel}
                isStepComplete={isStepComplete}
                expanded={expanded}
                onToggleExpanded={onToggleExpanded}
                onDuplicate={onDuplicate}
                onRemove={onRemove}
            />
            {expanded ? (
                <QuestionDetails
                    question={question}
                    stepType={stepType}
                    errors={errors}
                    touched={touched}
                    onUpdateQuestion={onUpdateQuestion}
                    onUpdateOption={onUpdateOption}
                    onUpdateOptionImage={onUpdateOptionImage}
                    onUpdateOptionImageType={onUpdateOptionImageType}
                    onUpdateOptionHasImage={onUpdateOptionHasImage}
                    onAddOption={onAddOption}
                    onRemoveOption={onRemoveOption}
                    onMarkQuestionFieldTouched={onMarkQuestionFieldTouched}
                    onMarkQuestionOptionsTouched={onMarkQuestionOptionsTouched}
                    onReplaceQuestion={onReplaceQuestion}
                />
            ) : null}
        </div>
    );
}

function QuestionHeader({
    index,
    question,
    stepTypeLabel,
    isStepComplete,
    expanded,
    onToggleExpanded,
    onDuplicate,
    onRemove,
}) {
    return (
        <div className="flex sm:items-center items-start justify-between sm:flex-row flex-col md:gap-4 gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move flex-shrink-0" />
                <div className="flex flex-col gap-2 items-start">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex-shrink-0">
                            Step {index + 1}
                        </span>
                        {isStepComplete ? (
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
                            {question.title || "Untitled Step"}
                        </span>
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs flex-shrink-0">
                            {stepTypeLabel}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:self-center self-end">
                <CustomButton
                    variant="ghost"
                    size="sm"
                    onClick={onToggleExpanded}
                    className="text-muted-foreground hover:text-white sm:text-base text-sm"
                >
                    {expanded ? (
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
                    onClick={onDuplicate}
                    className="text-muted-foreground hover:text-white!"
                >
                    <Copy className="h-4 w-4" />
                </CustomButton>
                <CustomButton
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="text-destructive hover:text-white dark:text-red-500"
                >
                    <Trash2 className="h-4 w-4" />
                </CustomButton>
            </div>
        </div>
    );
}

function QuestionDetails({
    question,
    stepType,
    errors,
    touched,
    onUpdateQuestion,
    onUpdateOption,
    onUpdateOptionImage,
    onUpdateOptionImageType,
    onUpdateOptionHasImage,
    onAddOption,
    onRemoveOption,
    onMarkQuestionFieldTouched,
    onMarkQuestionOptionsTouched,
    onReplaceQuestion,
}) {
    return (
        <div className="space-y-6 pt-4 border-t">
            <StepTypeField
                question={question}
                errors={errors}
                touched={touched}
                onUpdateQuestion={onUpdateQuestion}
            />
            {stepType === "question" ? (
                <>
                    <QuestionTypeField
                        question={question}
                        onUpdateQuestion={onUpdateQuestion}
                    />

                    <QuestionTitleField
                        question={question}
                        stepType={stepType}
                        errors={errors}
                        touched={touched}
                        onUpdateQuestion={onUpdateQuestion}
                        onMarkQuestionFieldTouched={onMarkQuestionFieldTouched}
                    />
                    <QuestionDescriptionField
                        question={question}
                        stepType={stepType}
                        onUpdateQuestion={onUpdateQuestion}
                    />
                </>
            ) : null}
            {stepType === "html-markup" && (
                <>
                    <QuestionTitleField
                        question={question}
                        stepType={stepType}
                        errors={errors}
                        touched={touched}
                        onUpdateQuestion={onUpdateQuestion}
                        onMarkQuestionFieldTouched={onMarkQuestionFieldTouched}
                    />
                    <QuestionDescriptionField
                        question={question}
                        stepType={stepType}
                        onUpdateQuestion={onUpdateQuestion}
                    />
                </>
            )}
            {renderStepConfiguration({
                question,
                stepType,
                errors,
                touched,
                onUpdateQuestion,
                onUpdateOption,
                onUpdateOptionImage,
                onUpdateOptionImageType,
                onUpdateOptionHasImage,
                onAddOption,
                onRemoveOption,
                onMarkQuestionOptionsTouched,
                onReplaceQuestion,
                onMarkQuestionFieldTouched,
            })}
        </div>
    );
}

function StepTypeField({ question, errors, touched, onUpdateQuestion }) {
    const stepType = question.stepType ?? "question";
    return (
        <div className="space-y-2">
            <CustomLabel
                htmlFor={`stepType-${question.id}`}
                className="flex items-center gap-1"
            >
                Step Type
                <span className="text-red-600 dark:text-red-400">*</span>
            </CustomLabel>
            <select
                id={`stepType-${question.id}`}
                value={stepType}
                onChange={(e) =>
                    onUpdateQuestion(question.id, "stepType", e.target.value)
                }
                required
                className={`w-full px-3 py-2 !mt-1 border rounded-md bg-background dark:bg-gray-800 dark:text-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-offset-2 `}
            >
                <option value="" disabled>
                    Select step type
                </option>
                <option value="question">Question</option>
                <option value="html-markup">HTML Markup</option>
                <option value="component">Component</option>
                <option value="page">Page</option>
            </select>
            {/* {touched?.stepType && errors?.stepType ? (
                <p className="text-sm text-destructive">{errors.stepType}</p>
            ) : null} */}
        </div>
    );
}

function QuestionTypeField({ question, onUpdateQuestion }) {
    return (
        <div className="space-y-2">
            <CustomLabel htmlFor={`type-${question.id}`}>
                Question Type
            </CustomLabel>
            <select
                id={`type-${question.id}`}
                value={question.type}
                onChange={(e) =>
                    onUpdateQuestion(question.id, "type", e.target.value)
                }
                className="w-full px-3 py-2 !mt-1 border border-input rounded-md bg-background dark:bg-gray-800 dark:text-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <option value="single-choice">Single Choice (Radio)</option>
                <option value="multiple-choice">
                    Multiple Choice (Checkbox)
                </option>
                <option value="dropdown-list">Dropdown List</option>
                <option value="true-false">True/False</option>
                <option value="textarea">Textarea</option>
                <option value="date">Date</option>
                <option value="counter">Counter</option>
            </select>
        </div>
    );
}

function QuestionTitleField({
    question,
    stepType,
    errors,
    touched,
    onUpdateQuestion,
    onMarkQuestionFieldTouched,
}) {
    return (
        <FormField
            id={`title-${question.id}`}
            label={stepType === "question" ? "Question Title" : "Title"}
            required
            value={question.title}
            onChange={(e) =>
                onUpdateQuestion(question.id, "title", e.target.value)
            }
            onBlur={() => onMarkQuestionFieldTouched(question.id, "title")}
            placeholder={
                stepType === "question"
                    ? "Enter question title"
                    : "Enter step title"
            }
            error={touched?.title ? errors?.title : undefined}
        />
    );
}

function QuestionDescriptionField({ question, stepType, onUpdateQuestion }) {
    return (
        <div className="space-y-2">
            <CustomLabel htmlFor={`description-${question.id}`}>
                Description (Optional)
            </CustomLabel>
            <textarea
                id={`description-${question.id}`}
                value={question.description}
                onChange={(e) =>
                    onUpdateQuestion(question.id, "description", e.target.value)
                }
                placeholder={
                    stepType === "question"
                        ? "Additional context for the question"
                        : "Additional context for the step"
                }
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background dark:bg-gray-800  text-black dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-y"
            />
        </div>
    );
}

function renderStepConfiguration({
    question,
    stepType,
    errors,
    touched,
    onUpdateQuestion,
    onUpdateOption,
    onUpdateOptionImage,
    onUpdateOptionImageType,
    onUpdateOptionHasImage,
    onAddOption,
    onRemoveOption,
    onMarkQuestionOptionsTouched,
    onReplaceQuestion,
    onMarkQuestionFieldTouched,
}) {
    if (stepType === "") {
        return (
            <p className="text-sm text-muted-foreground text-center">
                Select a step type to configure this step.
            </p>
        );
    }

    if (stepType === "question") {
        return (
            <>
                {/* <QuestionRequiredToggle
                    question={question}
                    onUpdateQuestion={onUpdateQuestion}
                /> */}
                <QuestionAdvancedFields
                    question={question}
                    onUpdateQuestion={onUpdateQuestion}
                />
                <QuestionOptions
                    question={question}
                    errors={errors}
                    touched={touched}
                    onUpdateOption={onUpdateOption}
                    onUpdateOptionImage={onUpdateOptionImage}
                    onUpdateOptionImageType={onUpdateOptionImageType}
                    onUpdateOptionHasImage={onUpdateOptionHasImage}
                    onAddOption={onAddOption}
                    onRemoveOption={onRemoveOption}
                    onMarkQuestionOptionsTouched={onMarkQuestionOptionsTouched}
                />
            </>
        );
    }

    if (stepType === "html-markup") {
        return (
            <HtmlMarkupFields
                question={question}
                onUpdateQuestion={onUpdateQuestion}
            />
        );
    }

    if (stepType === "component") {
        return (
            <SelectableLibrary
                question={question}
                onUpdateQuestion={onUpdateQuestion}
                onReplaceQuestion={onReplaceQuestion}
                onMarkQuestionFieldTouched={onMarkQuestionFieldTouched}
                options={COMPONENT_OPTIONS}
                storageKey="selectedComponentId"
                label="Component"
                error={errors?.selectedComponentId}
                touched={touched?.selectedComponentId}
            />
        );
    }

    if (stepType === "page") {
        return (
            <SelectableLibrary
                question={question}
                onUpdateQuestion={onUpdateQuestion}
                onReplaceQuestion={onReplaceQuestion}
                onMarkQuestionFieldTouched={onMarkQuestionFieldTouched}
                options={PAGE_OPTIONS}
                storageKey="selectedPageId"
                label="Page"
                error={errors?.selectedPageId}
                touched={touched?.selectedPageId}
            />
        );
    }

    return (
        <p className="text-sm text-muted-foreground">
            No additional configuration is required for{" "}
            {stepType === "html-markup"
                ? "HTML Markup"
                : stepType === "component"
                ? "Component"
                : "Page"}{" "}
            steps yet.
        </p>
    );
}

function QuestionRequiredToggle({ question, onUpdateQuestion }) {
    return (
        <div className="flex items-center justify-start gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) =>
                        onUpdateQuestion(
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
    );
}

function QuestionAdvancedFields({ question, onUpdateQuestion }) {
    const showLengthFields =
        question.type === "textarea" || question.type === "short-answer";
    const isCounter = question.type === "counter";

    return (
        <>
            {showLengthFields ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        id={`maxLength-${question.id}`}
                        label="Max Length"
                        type="number"
                        value={question.maxLength || ""}
                        onChange={(e) =>
                            onUpdateQuestion(
                                question.id,
                                "maxLength",
                                e.target.value ? parseInt(e.target.value) : null
                            )
                        }
                        placeholder="e.g., 500"
                        helperText="Optional - Maximum character/byte limit"
                    />
                    <FormField
                        id={`placeholder-${question.id}`}
                        label="Placeholder"
                        value={question.placeholder || ""}
                        onChange={(e) =>
                            onUpdateQuestion(
                                question.id,
                                "placeholder",
                                e.target.value
                            )
                        }
                        placeholder="Enter placeholder text"
                        helperText="Optional - Hint text for the input"
                    />
                </div>
            ) : null}

            {isCounter ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        id={`minValue-${question.id}`}
                        label="Min Value"
                        type="number"
                        value={
                            question.minValue !== null &&
                            question.minValue !== undefined
                                ? question.minValue
                                : ""
                        }
                        onChange={(e) =>
                            onUpdateQuestion(
                                question.id,
                                "minValue",
                                e.target.value ? parseInt(e.target.value) : null
                            )
                        }
                        placeholder="e.g., 0"
                        helperText="Optional - Minimum counter value"
                    />
                    <FormField
                        id={`maxValue-${question.id}`}
                        label="Max Value"
                        type="number"
                        value={
                            question.maxValue !== null &&
                            question.maxValue !== undefined
                                ? question.maxValue
                                : ""
                        }
                        onChange={(e) =>
                            onUpdateQuestion(
                                question.id,
                                "maxValue",
                                e.target.value ? parseInt(e.target.value) : null
                            )
                        }
                        placeholder="e.g., 100"
                        helperText="Optional - Maximum counter value"
                    />
                    <FormField
                        id={`placeholder-${question.id}`}
                        label="Placeholder"
                        value={question.placeholder || ""}
                        onChange={(e) =>
                            onUpdateQuestion(
                                question.id,
                                "placeholder",
                                e.target.value
                            )
                        }
                        placeholder="Enter placeholder text"
                        helperText="Optional - Hint text for the input"
                    />
                </div>
            ) : null}
        </>
    );
}

function QuestionOptions({
    question,
    errors,
    touched,
    onUpdateOption,
    onUpdateOptionImage,
    onUpdateOptionImageType,
    onUpdateOptionHasImage,
    onAddOption,
    onRemoveOption,
    onMarkQuestionOptionsTouched,
}) {
    if (
        !(
            question.type === "single-choice" ||
            question.type === "multiple-choice" ||
            question.type === "dropdown-list" ||
            question.type === "true-false"
        )
    ) {
        return null;
    }

    const optionsError =
        touched?.options && errors?.options ? errors.options : undefined;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <CustomLabel>
                    Options
                    <span className="text-red-600 dark:text-red-400 ml-1">
                        *
                    </span>
                </CustomLabel>
                {question.type !== "true-false" ? (
                    <CustomButton
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddOption(question.id)}
                        className="flex items-center gap-1 sm:text-base text-sm"
                    >
                        <Plus className="h-3 w-3" />
                        Add Option
                    </CustomButton>
                ) : null}
            </div>
            {question.options.map((option, index) => {
                const normalizedOption = normalizeOption(option);
                const optionText = getOptionText(option);
                const showOptionError = optionsError && !optionText?.trim();

                return (
                    <OptionRow
                        key={index}
                        question={question}
                        optionIndex={index}
                        optionText={optionText}
                        normalizedOption={normalizedOption}
                        showOptionError={showOptionError}
                        onUpdateOption={onUpdateOption}
                        onUpdateOptionImage={onUpdateOptionImage}
                        onUpdateOptionImageType={onUpdateOptionImageType}
                        onUpdateOptionHasImage={onUpdateOptionHasImage}
                        onRemoveOption={onRemoveOption}
                        onMarkQuestionOptionsTouched={
                            onMarkQuestionOptionsTouched
                        }
                    />
                );
            })}
            {optionsError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                    {optionsError}
                </p>
            ) : null}
        </div>
    );
}

function OptionRow({
    question,
    optionIndex,
    optionText,
    normalizedOption,
    showOptionError,
    onUpdateOption,
    onUpdateOptionImage,
    onUpdateOptionImageType,
    onUpdateOptionHasImage,
    onRemoveOption,
    onMarkQuestionOptionsTouched,
}) {
    const isTrueFalse = question.type === "true-false";
    const canRemoveOption = question.options.length > 2 && !isTrueFalse;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 sm:flex-row flex-col md:gap-4">
                <CustomInput
                    value={optionText}
                    onChange={(e) =>
                        onUpdateOption(question.id, optionIndex, e.target.value)
                    }
                    onBlur={() => onMarkQuestionOptionsTouched(question.id)}
                    placeholder={`Option ${optionIndex + 1}`}
                    className="flex-1"
                    error={
                        showOptionError ? "Option cannot be empty" : undefined
                    }
                />
                <div className="flex items-center gap-2 sm:self-center self-end">
                    {supportsOptionImages(question.type) ? (
                        <OptionImageToggle
                            checked={normalizedOption.hasImage || false}
                            onChange={(checked) =>
                                onUpdateOptionHasImage(
                                    question.id,
                                    optionIndex,
                                    checked
                                )
                            }
                        />
                    ) : null}
                    {!isTrueFalse ? (
                        <Tooltip
                            content={
                                canRemoveOption
                                    ? ""
                                    : "At least 2 options are required"
                            }
                            side="top"
                        >
                            <CustomButton
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    onRemoveOption(question.id, optionIndex)
                                }
                                disabled={!canRemoveOption}
                                className={cn(
                                    "text-destructive hover:text-white dark:text-red-500",
                                    !canRemoveOption &&
                                        "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Trash2 className="h-4 w-4" />
                            </CustomButton>
                        </Tooltip>
                    ) : null}
                </div>
            </div>
            {supportsOptionImages(question.type) &&
            normalizedOption.hasImage ? (
                <OptionImageControls
                    question={question}
                    optionIndex={optionIndex}
                    normalizedOption={normalizedOption}
                    onUpdateOptionImage={onUpdateOptionImage}
                    onUpdateOptionImageType={onUpdateOptionImageType}
                />
            ) : null}
            <hr />
        </div>
    );
}

function HtmlMarkupFields({ question, onUpdateQuestion }) {
    const imageType = question.markupImageType || "upload";
    const handleImageTypeChange = (type) =>
        onUpdateQuestion(question.id, "markupImageType", type);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <CustomLabel>Image (Optional)</CustomLabel>
                <div className="space-y-2 w-full md:w-[70%]">
                    <div className="flex items-center gap-2 ">
                        <button
                            type="button"
                            onClick={() => handleImageTypeChange("upload")}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                                imageType === "upload"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                            Upload
                        </button>
                        <button
                            type="button"
                            onClick={() => handleImageTypeChange("link")}
                            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                                imageType === "link"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                            <Link2 className="h-3 w-3" />
                            Link
                        </button>
                    </div>
                    {imageType === "upload" ? (
                        <SingleImageUpload
                            label=""
                            value={question.markupImage || ""}
                            onChange={(url) =>
                                onUpdateQuestion(
                                    question.id,
                                    "markupImage",
                                    url || ""
                                )
                            }
                            onRemove={() =>
                                onUpdateQuestion(question.id, "markupImage", "")
                            }
                            className="w-full"
                            // smallPreview
                        />
                    ) : (
                        <FormField
                            id={`html-markup-image-link-${question.id}`}
                            label=""
                            value={question.markupImage || ""}
                            onChange={(e) =>
                                onUpdateQuestion(
                                    question.id,
                                    "markupImage",
                                    e.target.value || ""
                                )
                            }
                            placeholder="https://example.com/image.jpg"
                            type="url"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function SelectableLibrary({
    question,
    onUpdateQuestion,
    onReplaceQuestion,
    onMarkQuestionFieldTouched,
    options,
    storageKey,
    label,
    error,
    touched,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const filteredOptions = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) {
            return options;
        }
        return options.filter((option) =>
            option.label.toLowerCase().includes(normalizedSearch)
        );
    }, [options, searchTerm]);

    const selectedId = question[storageKey] || null;
    const selectedOption = useMemo(() => {
        if (!selectedId) {
            return null;
        }
        return options.find((option) => option.id === selectedId) || null;
    }, [options, selectedId]);

    const handleSelect = (option) => {
        if (!onReplaceQuestion) {
            onUpdateQuestion(question.id, storageKey, option.id);
            onUpdateQuestion(question.id, "title", option.label);
            onMarkQuestionFieldTouched?.(question.id, storageKey);
            onMarkQuestionFieldTouched?.(question.id, "title");
            return;
        }

        onReplaceQuestion(
            question.id,
            (current) => ({
                ...current,
                [storageKey]: option.id,
                title: option.label,
            }),
            [storageKey, "title"]
        );
        onMarkQuestionFieldTouched?.(question.id, storageKey);
        onMarkQuestionFieldTouched?.(question.id, "title");
    };

    const hasError = touched && !!error;

    return (
        <div className="space-y-3">
            <CustomLabel className="flex items-center gap-1">
                {label}s
                <span className="text-red-600 dark:text-red-400">*</span>
            </CustomLabel>
            {selectedOption ? (
                <div className="px-3 py-2 rounded-md bg-primary/10 text-primary flex items-center gap-3 w-full">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">
                            Selected {label}: {selectedOption.label}
                        </p>
                        {selectedOption.description ? (
                            <p className="text-xs text-primary/80">
                                {selectedOption.description}
                            </p>
                        ) : null}
                    </div>
                    <CustomButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onReplaceQuestion(
                                question.id,
                                (current) => ({
                                    ...current,
                                    [storageKey]: null,
                                    title:
                                        label === "Component" ||
                                        label === "Page"
                                            ? ""
                                            : current.title,
                                }),
                                [storageKey, "title"]
                            );
                            onMarkQuestionFieldTouched?.(
                                question.id,
                                storageKey
                            );
                            onMarkQuestionFieldTouched?.(question.id, "title");
                        }}
                        className="text-primary hover:text-primary-foreground hover:bg-primary/80"
                    >
                        <X className="h-4 w-4" />
                    </CustomButton>
                </div>
            ) : null}
            <CustomInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}s`}
                className={cn(
                    "w-full",
                    hasError &&
                        "border-destructive focus-visible:ring-destructive"
                )}
                onBlur={() =>
                    onMarkQuestionFieldTouched?.(question.id, storageKey)
                }
            />
            <div
                className={cn(
                    "border rounded-md max-h-56 overflow-y-auto divide-y bg-background",
                    hasError ? "border-destructive" : "border-input"
                )}
            >
                {filteredOptions.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">
                        No {label.toLowerCase()}s found
                    </p>
                ) : (
                    filteredOptions.map((option) => {
                        const isSelected = option.id === selectedId;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={cn(
                                    "w-full text-left px-3 py-2 flex items-start justify-between gap-3 hover:bg-muted transition-colors",
                                    isSelected &&
                                        "bg-primary/10 text-primary border-0 border-l-4 border-l-primary "
                                )}
                            >
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">
                                        {option.label}
                                    </p>
                                    {option.description ? (
                                        <p className="text-xs text-muted-foreground">
                                            {option.description}
                                        </p>
                                    ) : null}
                                </div>
                                {isSelected ? (
                                    <CheckCircle2 className="h-4 w-4 mt-1 flex-shrink-0" />
                                ) : null}
                            </button>
                        );
                    })
                )}
            </div>
            {hasError ? (
                <p className="text-sm text-destructive">{error}</p>
            ) : null}
        </div>
    );
}

function OptionImageToggle({ checked, onChange }) {
    return (
        <div className="flex items-center gap-2 pl-2">
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
            <CustomLabel className="text-xs text-muted-foreground">
                Image
            </CustomLabel>
        </div>
    );
}

function OptionImageControls({
    question,
    optionIndex,
    normalizedOption,
    onUpdateOptionImage,
    onUpdateOptionImageType,
}) {
    const imageType = normalizedOption.imageType || "upload";
    const handleImageTypeChange = (type) =>
        onUpdateOptionImageType(question.id, optionIndex, type);

    return (
        <div className="space-y-2 pl-2 border-l-2 border-muted sm:w-[70%] w-full">
            <div className="flex items-center gap-2">
                <CustomLabel className="text-xs text-muted-foreground">
                    Image
                </CustomLabel>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleImageTypeChange("upload")}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                            imageType === "upload"
                                ? "bg-primary text-primary-foreground"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                        Upload
                    </button>
                    <button
                        type="button"
                        onClick={() => handleImageTypeChange("link")}
                        className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                            imageType === "link"
                                ? "bg-primary text-primary-foreground"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                        <Link2 className="h-3 w-3" />
                        Link
                    </button>
                </div>
            </div>
            {imageType === "upload" ? (
                <SingleImageUpload
                    label=""
                    value={normalizedOption.image || ""}
                    onChange={(url) =>
                        onUpdateOptionImage(question.id, optionIndex, url || "")
                    }
                    onRemove={() =>
                        onUpdateOptionImage(question.id, optionIndex, "")
                    }
                    className="w-full"
                    smallPreview
                />
            ) : (
                <OptionImageLinkField
                    question={question}
                    optionIndex={optionIndex}
                    normalizedOption={normalizedOption}
                    onUpdateOptionImage={onUpdateOptionImage}
                />
            )}
        </div>
    );
}

function OptionImageLinkField({
    question,
    optionIndex,
    normalizedOption,
    onUpdateOptionImage,
}) {
    return (
        <div className="space-y-2">
            <FormField
                id={`option-image-link-${question.id}-${optionIndex}`}
                label=""
                value={normalizedOption.image || ""}
                onChange={(e) =>
                    onUpdateOptionImage(
                        question.id,
                        optionIndex,
                        e.target.value || ""
                    )
                }
                placeholder="https://example.com/image.jpg"
                type="url"
            />
            {normalizedOption.image ? (
                <div className="relative inline-block">
                    <img
                        src={normalizedOption.image}
                        alt={`Option ${optionIndex + 1} preview`}
                        className="max-w-full h-auto max-h-32 rounded-md border border-input object-contain"
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                    <button
                        type="button"
                        onClick={() =>
                            onUpdateOptionImage(question.id, optionIndex, "")
                        }
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remove image"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ) : null}
        </div>
    );
}

function supportsOptionImages(questionType) {
    return (
        questionType === "single-choice" || questionType === "multiple-choice"
    );
}

function getQuestionTypeLabel(type) {
    switch (type) {
        case "single-choice":
            return "Single Choice";
        case "multiple-choice":
            return "Multiple Choice";
        case "dropdown-list":
            return "Dropdown List";
        case "true-false":
            return "True/False";
        case "short-answer":
            return "Short Answer";
        case "textarea":
            return "Textarea";
        case "file":
            return "File Upload";
        case "date":
            return "Date";
        case "counter":
            return "Counter";
        default:
            return type;
    }
}

function getStepTypeLabel(stepType, questionTypeLabel) {
    switch (stepType) {
        case "":
            return "Step Type Not Selected";
        case "question":
            return `Question - ${questionTypeLabel}`;
        case "html-markup":
            return "HTML Markup";
        case "component":
            return "Component";
        case "page":
            return "Page";
        default:
            return stepType;
    }
}
