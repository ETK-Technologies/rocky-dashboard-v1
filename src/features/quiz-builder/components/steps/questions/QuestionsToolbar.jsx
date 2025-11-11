import { CustomButton } from "@/components/ui";
import { ChevronsDownUp, ChevronsUpDown, Plus } from "lucide-react";

export function QuestionsToolbar({
    onAddStep,
    onToggleAll,
    hasQuestions,
    allExpanded,
    hasQuestionStep,
}) {
    return (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg py-4 border-b border-border mb-6 flex sm:items-center items-start justify-between sm:flex-row flex-col md:gap-4 gap-2">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Steps</h2>
                <p className="text-muted-foreground">
                    Add and configure your quiz steps
                </p>
                <p
                    className={`text-sm font-medium ${
                        hasQuestionStep
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                    }`}
                >
                    {hasQuestionStep
                        ? "Great! You have at least one question step."
                        : "At least one step must be a question."}
                </p>
            </div>
            <div className="flex md:items-center gap-2 flex-wrap sm:text-base text-sm md:self-center self-end justify-end">
                <CustomButton
                    onClick={onAddStep}
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Step
                </CustomButton>
                {hasQuestions && (
                    <CustomButton
                        onClick={onToggleAll}
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
    );
}
