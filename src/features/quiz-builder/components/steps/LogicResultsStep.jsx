"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    ReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Background,
    Handle,
    Position,
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";

// Helper to normalize options
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

const getOptionText = (option) => {
    return typeof option === "string" ? option : option?.text || "";
};

// Question Node Component (Read-only)
function QuestionNode({ id, data, selected }) {
    const hasOptions =
        data.options &&
        Array.isArray(data.options) &&
        data.options.length > 0 &&
        (data.type === "single-choice" ||
            data.type === "multiple-choice" ||
            data.type === "dropdown-list" ||
            data.type === "true-false");

    return (
        <div
            className={cn(
                "px-4 py-3 shadow-md rounded-lg bg-card border-2 relative min-w-[200px]",
                selected ? "border-primary" : "border-border",
                "opacity-75 cursor-not-allowed"
            )}
        >
            {/* Target handle (input) - on the left */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-primary border-2 border-card"
            />

            {/* Question Title */}
            <div className="font-semibold text-sm mb-2 text-foreground">
                {data.title || `Question ${data.index + 1}`}
            </div>

            {/* Question Type Badge */}
            <div className="text-xs text-muted-foreground mb-2">
                {data.type === "single-choice"
                    ? "Single Choice"
                    : data.type === "multiple-choice"
                    ? "Multiple Choice"
                    : data.type === "dropdown-list"
                    ? "Dropdown List"
                    : data.type === "true-false"
                    ? "True/False"
                    : data.type === "short-answer"
                    ? "Short Answer"
                    : data.type === "textarea"
                    ? "Textarea"
                    : data.type === "file"
                    ? "File Upload"
                    : data.type === "date"
                    ? "Date"
                    : data.type}
            </div>

            {/* Options if available */}
            {hasOptions && (
                <div className="space-y-1 mt-2 pt-2 border-t border-border">
                    {data.options.map((option, optIndex) => {
                        const normalizedOption = normalizeOption(option);
                        const optionText = getOptionText(option);
                        return (
                            <div
                                key={optIndex}
                                className="flex items-center justify-between text-xs"
                            >
                                <span className="text-muted-foreground truncate flex-1">
                                    {optionText || `Option ${optIndex + 1}`}
                                </span>
                                {/* Option handle (source) - on the right */}
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`option-${optIndex}`}
                                    className="w-2 h-2 bg-blue-500 border border-card ml-2"
                                    style={{ top: "auto", bottom: "auto" }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Source handle (output) - on the right if no options */}
            {!hasOptions && (
                <Handle
                    type="source"
                    position={Position.Right}
                    className="w-3 h-3 bg-primary border-2 border-card"
                />
            )}
        </div>
    );
}

// Result Node Component - only has input handle (in-dot)
function ResultNode({ id, data, selected }) {
    const { setNodes, setEdges } = useReactFlow();

    const handleDelete = (e) => {
        e.stopPropagation();
        // Remove the node
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        // Remove connected edges
        setEdges((edges) =>
            edges.filter((edge) => edge.source !== id && edge.target !== id)
        );
    };

    return (
        <div
            className={cn(
                "px-4 py-3 shadow-md rounded-lg bg-green-50 dark:bg-green-950/20 border-2 relative min-w-[200px]",
                selected
                    ? "border-green-500"
                    : "border-green-300 dark:border-green-700"
            )}
        >
            {/* Target handle (input) - on the left - IN DOT */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-green-500 border-2 border-card"
            />

            {/* Delete button - shown when selected */}
            {selected && (
                <button
                    onClick={handleDelete}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors z-10"
                    title="Delete result"
                >
                    <X className="h-3 w-3" />
                </button>
            )}

            {/* Result Title */}
            <div className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
                {data.title || "Untitled Result"}
            </div>

            {/* Result Badge */}
            <div className="text-xs text-green-700 dark:text-green-300">
                {data.isDefault ? "Default Result" : "Result"}
            </div>

            {/* NO OUTPUT HANDLE - Results only have input */}
        </div>
    );
}

// Custom Edge Component with Delete Button
function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    style,
    data,
}) {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Don't allow deleting logic edges (from Logic step)
    const isLogicEdge = id.startsWith("logic-");

    const onEdgeClick = (e) => {
        e.stopPropagation();
        // Only allow deleting logic results edges, not logic step edges
        if (!isLogicEdge) {
            setEdges((edges) => edges.filter((edge) => edge.id !== id));
        }
    };

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={style}
                markerEnd="url(#react-flow__arrowclosed)"
            />
            <EdgeLabelRenderer>
                {selected && !isLogicEdge && (
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: "all",
                        }}
                        className="nodrag nopan"
                    >
                        <button
                            onClick={onEdgeClick}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                            title="Delete edge"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </EdgeLabelRenderer>
        </>
    );
}

const nodeTypes = {
    questionNode: QuestionNode,
    resultNode: ResultNode,
};

const edgeTypes = {
    default: CustomEdge,
};

export default function LogicResultsStep({
    onComplete,
    onValidationChange,
    data,
    updateData,
}) {
    const questions = useMemo(() => data?.questions || [], [data?.questions]);
    const results = useMemo(() => data?.results || [], [data?.results]);
    const logicResultsEdges = useMemo(
        () => data?.logicResults?.edges || [],
        [data?.logicResults?.edges]
    );
    const logicEdges = useMemo(
        () => data?.logic?.edges || [],
        [data?.logic?.edges]
    ); // Get edges from Logic step
    const savedNodes = useMemo(
        () => data?.logicResults?.nodes || [],
        [data?.logicResults?.nodes]
    );

    // Initialize question nodes (read-only, from questions)
    const questionNodes = useMemo(() => {
        return questions.map((question, index) => {
            const hasOptions =
                question.options &&
                Array.isArray(question.options) &&
                question.options.length > 0 &&
                (question.type === "single-choice" ||
                    question.type === "multiple-choice" ||
                    question.type === "dropdown-list" ||
                    question.type === "true-false");

            // Try to restore position from saved nodes
            const savedNode = savedNodes.find(
                (n) => n.id === `question-${question.id}`
            );

            return {
                id: `question-${question.id}`,
                type: "questionNode",
                position: savedNode?.position || {
                    x: (index % 3) * 300,
                    y: Math.floor(index / 3) * 200,
                },
                data: {
                    title: question.title || `Question ${index + 1}`,
                    type: question.type,
                    options: hasOptions ? question.options : [],
                    index,
                    questionId: question.id,
                },
                draggable: true, // Can still move them around
            };
        });
    }, [questions, savedNodes]);

    // Initialize result nodes (from saved nodes or add them when needed)
    const initialResultNodes = useMemo(() => {
        return savedNodes
            .filter((n) => n.id.startsWith("result-"))
            .map((savedNode) => {
                const resultId = savedNode.id.replace("result-", "");
                const result = results.find((r) => r.id === parseInt(resultId));
                return {
                    id: savedNode.id,
                    type: "resultNode",
                    position: savedNode.position,
                    data: {
                        title: result?.title || "Untitled Result",
                        isDefault: result?.isDefault || false,
                        resultId: parseInt(resultId),
                    },
                    draggable: true,
                };
            });
    }, [savedNodes, results]);

    const [nodes, setNodes] = useState([
        ...questionNodes,
        ...initialResultNodes,
    ]);

    // Combine edges from Logic step (question-to-question) and Logic Results step (question-to-result)
    const initialEdges = useMemo(() => {
        // Logic step edges (question to question/option) - blue color
        const logicStepEdges = logicEdges.map((edge) => ({
            id: `logic-${edge.id}`,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            animated: true,
            type: "default",
            style: {
                stroke: "#60a5fa",
                strokeWidth: 2,
                strokeDasharray: edge.strokeDasharray || undefined,
            },
        }));

        // Logic Results edges (question to result) - green color
        const logicResultsStepEdges = logicResultsEdges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            animated: true,
            type: "default",
            style: {
                stroke: "#10b981",
                strokeWidth: 2,
                strokeDasharray: edge.strokeDasharray || undefined,
            },
        }));

        return [...logicStepEdges, ...logicResultsStepEdges];
    }, [logicEdges, logicResultsEdges]);

    const [edges, setEdges] = useState(initialEdges);

    // Track if we're initializing
    const isInitializingRef = useRef(true);
    const prevQuestionsRef = useRef(questions);

    // Update question nodes when questions change
    useEffect(() => {
        const questionsChanged =
            questions.length !== prevQuestionsRef.current.length ||
            questions.some(
                (q, idx) =>
                    q.id !== prevQuestionsRef.current[idx]?.id ||
                    q.title !== prevQuestionsRef.current[idx]?.title ||
                    q.type !== prevQuestionsRef.current[idx]?.type
            );

        if (!questionsChanged && !isInitializingRef.current) {
            return;
        }

        isInitializingRef.current = false;
        prevQuestionsRef.current = questions;

        const newQuestionNodes = questions.map((question, index) => {
            const hasOptions =
                question.options &&
                Array.isArray(question.options) &&
                question.options.length > 0 &&
                (question.type === "single-choice" ||
                    question.type === "multiple-choice" ||
                    question.type === "dropdown-list" ||
                    question.type === "true-false");

            const existingNode = nodes.find(
                (n) => n.id === `question-${question.id}`
            );
            const savedNode = savedNodes.find(
                (n) => n.id === `question-${question.id}`
            );

            return {
                id: `question-${question.id}`,
                type: "questionNode",
                position: existingNode?.position ||
                    savedNode?.position || {
                        x: (index % 3) * 300,
                        y: Math.floor(index / 3) * 200,
                    },
                data: {
                    title: question.title || `Question ${index + 1}`,
                    type: question.type,
                    options: hasOptions ? question.options : [],
                    index,
                    questionId: question.id,
                },
                draggable: true,
            };
        });

        // Keep result nodes
        const resultNodes = nodes.filter((n) => n.id.startsWith("result-"));
        const questionIds = new Set(questions.map((q) => `question-${q.id}`));
        const filteredQuestionNodes = newQuestionNodes.filter((node) =>
            questionIds.has(node.id)
        );

        setNodes([...filteredQuestionNodes, ...resultNodes]);

        // Update edges when questions change
        setEdges((currentEdges) => {
            // Get current logic edges from Logic step
            const logicStepEdges = logicEdges.map((edge) => ({
                id: `logic-${edge.id}`,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                animated: true,
                type: "default",
                style: {
                    stroke: "#60a5fa",
                    strokeWidth: 2,
                    strokeDasharray: edge.strokeDasharray || undefined,
                },
            }));

            // Filter logic results edges (keep only valid ones)
            const validLogicResultsEdges = currentEdges
                .filter((edge) => !edge.id.startsWith("logic-"))
                .filter((edge) => questionIds.has(edge.source));

            return [...logicStepEdges, ...validLogicResultsEdges];
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questions, logicEdges]);

    // Sync edges when logicEdges changes (from Logic step)
    useEffect(() => {
        if (isInitializingRef.current) return;

        setEdges((currentEdges) => {
            // Get current logic edges from Logic step
            const logicStepEdges = logicEdges.map((edge) => ({
                id: `logic-${edge.id}`,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                animated: true,
                type: "default",
                style: {
                    stroke: "#60a5fa",
                    strokeWidth: 2,
                    strokeDasharray: edge.strokeDasharray || undefined,
                },
            }));

            // Keep existing logic results edges (not from logic step)
            const logicResultsEdgesOnly = currentEdges.filter(
                (edge) => !edge.id.startsWith("logic-")
            );

            return [...logicStepEdges, ...logicResultsEdgesOnly];
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logicEdges]);

    // Add result node to flow
    const addResultNode = useCallback((result, position = null) => {
        let finalPosition = position;

        // If no position provided (clicked), calculate center of visible viewport
        if (
            !finalPosition &&
            reactFlowInstanceRef.current &&
            reactFlowWrapper.current
        ) {
            const reactFlowPane =
                reactFlowWrapper.current.querySelector(".react-flow__pane");
            if (reactFlowPane) {
                const paneBounds = reactFlowPane.getBoundingClientRect();
                const centerX = paneBounds.left + paneBounds.width / 2;
                const centerY = paneBounds.top + paneBounds.height / 2;

                // Convert screen center to flow coordinates
                finalPosition =
                    reactFlowInstanceRef.current.screenToFlowPosition({
                        x: centerX,
                        y: centerY,
                    });
            }
        }

        // Fallback to random position if still no position
        if (!finalPosition) {
            finalPosition = {
                x: Math.random() * 400 + 600,
                y: Math.random() * 400 + 200,
            };
        }

        const resultNodeId = `result-${result.id}-${Date.now()}`; // Unique ID for multiple instances
        const newResultNode = {
            id: resultNodeId,
            type: "resultNode",
            position: finalPosition,
            data: {
                title: result.title || "Untitled Result",
                isDefault: result.isDefault || false,
                resultId: result.id,
            },
            draggable: true,
        };

        setNodes((prevNodes) => [...prevNodes, newResultNode]);
    }, []);

    const onNodesChange = useCallback((changes) => {
        setNodes((nodesSnapshot) => {
            const updatedNodes = applyNodeChanges(changes, nodesSnapshot);

            // Update edges based on selected nodes
            setEdges((edgesSnapshot) => {
                const selectedNodeIds = new Set(
                    updatedNodes
                        .filter((node) => node.selected)
                        .map((node) => node.id)
                );

                return edgesSnapshot.map((edge) => {
                    const isFromActive = selectedNodeIds.has(edge.source);
                    const isLogicEdge = edge.id.startsWith("logic-");

                    return {
                        ...edge,
                        style: {
                            ...edge.style,
                            // Logic edges (blue) - different highlight
                            stroke: isLogicEdge
                                ? isFromActive
                                    ? "#3b82f6"
                                    : "#60a5fa"
                                : isFromActive
                                ? "#10b981"
                                : "#6ee7b7",
                            strokeWidth: isFromActive ? 3 : 2,
                            strokeDasharray: isFromActive ? "5,5" : undefined,
                            opacity: isFromActive ? 1 : 0.5,
                        },
                    };
                });
            });

            return updatedNodes;
        });
    }, []);

    const onEdgesChange = useCallback(
        (changes) =>
            setEdges((edgesSnapshot) =>
                applyEdgeChanges(changes, edgesSnapshot)
            ),
        []
    );

    const onConnect = useCallback(
        (params) => {
            // Only allow connections from question/option sources to result targets
            const sourceNode = nodes.find((n) => n.id === params.source);
            const targetNode = nodes.find((n) => n.id === params.target);

            if (!sourceNode || !targetNode) return;

            // Source must be a question node
            if (!sourceNode.id.startsWith("question-")) return;

            // Target must be a result node
            if (!targetNode.id.startsWith("result-")) return;

            setEdges((edgesSnapshot) => {
                // Don't allow connecting if an edge already exists from the same source and sourceHandle
                // (prevent multiple edges from the same option or single question)
                // Check ALL edges including logic edges from step 3
                const existingEdge = edgesSnapshot.find(
                    (e) =>
                        e.source === params.source &&
                        e.sourceHandle === params.sourceHandle
                );
                if (existingEdge) return edgesSnapshot;

                const newEdge = addEdge(
                    {
                        ...params,
                        animated: true,
                        type: "default",
                        style: {
                            stroke: "#10b981",
                            strokeWidth: 2,
                        },
                    },
                    edgesSnapshot
                );
                return newEdge;
            });
        },
        [nodes]
    );

    // Handle drop from sidebar
    const reactFlowWrapper = useRef(null);
    const reactFlowInstanceRef = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    // Update ref when reactFlowInstance changes
    useEffect(() => {
        reactFlowInstanceRef.current = reactFlowInstance;
    }, [reactFlowInstance]);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const resultData = event.dataTransfer.getData("application/json");
            if (!resultData) return;

            try {
                const result = JSON.parse(resultData);

                // Check if dropped on ReactFlow canvas
                if (!reactFlowInstanceRef.current) return;

                // Convert screen coordinates to flow coordinates
                // screenToFlowPosition automatically handles zoom and pan
                const position =
                    reactFlowInstanceRef.current.screenToFlowPosition({
                        x: event.clientX,
                        y: event.clientY,
                    });

                addResultNode(result, position);
            } catch (error) {
                console.error("Error parsing dropped result:", error);
            }
        },
        [addResultNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    // Save nodes and edges to data
    const prevNodesRef = useRef(nodes);
    const prevEdgesRef = useRef(edges);

    useEffect(() => {
        if (isInitializingRef.current) {
            prevNodesRef.current = nodes;
            prevEdgesRef.current = edges;
            return;
        }

        const nodesChanged =
            nodes.length !== prevNodesRef.current.length ||
            nodes.some((node, idx) => {
                const prevNode = prevNodesRef.current[idx];
                return (
                    !prevNode ||
                    node.id !== prevNode.id ||
                    node.position.x !== prevNode.position.x ||
                    node.position.y !== prevNode.position.y
                );
            });

        const edgesChanged =
            edges.length !== prevEdgesRef.current.length ||
            edges.some((edge, idx) => {
                const prevEdge = prevEdgesRef.current[idx];
                return (
                    !prevEdge ||
                    edge.id !== prevEdge.id ||
                    edge.source !== prevEdge.source ||
                    edge.target !== prevEdge.target ||
                    edge.sourceHandle !== prevEdge.sourceHandle
                );
            });

        if (nodesChanged || edgesChanged) {
            // Only save logic results edges (not logic step edges)
            const logicResultsEdgesOnly = edges.filter(
                (edge) => !edge.id.startsWith("logic-")
            );

            const logicResultsData = {
                nodes: nodes.map((node) => ({
                    id: node.id,
                    position: node.position,
                })),
                edges: logicResultsEdgesOnly.map((edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    sourceHandle: edge.sourceHandle,
                    strokeDasharray: edge.style?.strokeDasharray,
                })),
            };
            updateData("logicResults", logicResultsData);
            prevNodesRef.current = nodes;
            prevEdgesRef.current = edges;
        }
    }, [nodes, edges, updateData]);

    // Always consider valid
    useEffect(() => {
        onValidationChange?.(true);
    }, [onValidationChange]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Logic Results</h2>
                <p className="text-muted-foreground">
                    Connect questions and options to results to create
                    conditional result logic
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Results List Sidebar */}
                <div className="lg:col-span-1">
                    <div className="border rounded-lg p-4 bg-card">
                        <h3 className="font-semibold mb-4">Results</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Drag or click to add result to flow
                        </p>
                        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                            {results.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No results available. Add results in the
                                    Results step first.
                                </p>
                            ) : (
                                results.map((result) => (
                                    <div
                                        key={result.id}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData(
                                                "application/json",
                                                JSON.stringify(result)
                                            );
                                            e.dataTransfer.effectAllowed =
                                                "move";
                                        }}
                                        className="p-3 border rounded-lg hover:bg-accent cursor-move transition-colors"
                                        onClick={() => addResultNode(result)}
                                    >
                                        <div className="font-medium text-sm">
                                            {result.title || "Untitled Result"}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {result.isDefault
                                                ? "Default Result"
                                                : "Result"}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Flow Canvas */}
                <div className="lg:col-span-3">
                    <div
                        ref={reactFlowWrapper}
                        className="relative border rounded-lg overflow-hidden bg-background"
                        style={{
                            width: "100%",
                            height: "calc(100vh - 400px)",
                            minHeight: "600px",
                        }}
                    >
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onInit={setReactFlowInstance}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            fitView
                            fitViewOptions={{ padding: 0.2 }}
                        >
                            <Background
                                variant="dots"
                                gap={12}
                                size={1}
                                color="#e5e7eb"
                                className="dark:opacity-20"
                            />
                        </ReactFlow>
                    </div>
                </div>
            </div>

            {questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No questions available. Please add questions first.</p>
                </div>
            )}
        </div>
    );
}
