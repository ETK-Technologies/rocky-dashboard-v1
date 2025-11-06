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

// Question Node Component
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
                selected ? "border-primary" : "border-border"
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

    const onEdgeClick = (e) => {
        e.stopPropagation();
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
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
                {selected && (
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
};

const edgeTypes = {
    default: CustomEdge,
};

export default function LogicStep({
    onComplete,
    onValidationChange,
    data,
    updateData,
}) {
    const questions = useMemo(() => data?.questions || [], [data?.questions]);
    const logicEdges = data?.logic?.edges || [];
    const savedNodes = useMemo(
        () => data?.logic?.nodes || [],
        [data?.logic?.nodes]
    );

    // Initialize nodes from questions
    const initialNodes = useMemo(() => {
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
            };
        });
    }, [questions, savedNodes]);

    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(
        logicEdges.map((edge) => ({
            id: edge.id,
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
        }))
    );

    // Track if we're initializing to prevent save loop
    const isInitializingRef = useRef(true);
    const prevQuestionsRef = useRef(questions);

    // Update nodes when questions change
    useEffect(() => {
        // Check if questions actually changed (not just a reference change)
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

        const newNodes = questions.map((question, index) => {
            const hasOptions =
                question.options &&
                Array.isArray(question.options) &&
                question.options.length > 0 &&
                (question.type === "single-choice" ||
                    question.type === "multiple-choice" ||
                    question.type === "dropdown-list" ||
                    question.type === "true-false");

            // Try to preserve position from current nodes or saved nodes
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
            };
        });

        // Remove nodes for questions that no longer exist
        const questionIds = new Set(questions.map((q) => `question-${q.id}`));
        const filteredNodes = newNodes.filter((node) =>
            questionIds.has(node.id)
        );

        setNodes(filteredNodes);

        // Remove edges connected to deleted questions
        setEdges((currentEdges) =>
            currentEdges.filter(
                (edge) =>
                    questionIds.has(edge.source) && questionIds.has(edge.target)
            )
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questions]);

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
                    // Highlight edge if it originates from a selected node
                    const isFromActive = selectedNodeIds.has(edge.source);
                    return {
                        ...edge,
                        style: {
                            ...edge.style,
                            stroke: isFromActive ? "#60a5fa" : "#94a3b8",
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

    const onConnect = useCallback((params) => {
        setEdges((edgesSnapshot) => {
            // Check if an edge already exists from the same source and sourceHandle
            const existingEdge = edgesSnapshot.find(
                (edge) =>
                    edge.source === params.source &&
                    edge.sourceHandle === params.sourceHandle
            );

            // If an edge already exists from this source handle, don't create a new one
            if (existingEdge) {
                return edgesSnapshot;
            }

            const newEdge = addEdge(
                {
                    ...params,
                    animated: true,
                    type: "default",
                    style: {
                        stroke: "#60a5fa",
                        strokeWidth: 2,
                    },
                },
                edgesSnapshot
            );
            return newEdge;
        });
    }, []);

    // Save nodes and edges to data when they change (only after initialization)
    const prevNodesRef = useRef(nodes);
    const prevEdgesRef = useRef(edges);

    useEffect(() => {
        // Skip saving during initialization
        if (isInitializingRef.current) {
            prevNodesRef.current = nodes;
            prevEdgesRef.current = edges;
            return;
        }

        // Check if nodes positions actually changed
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

        // Check if edges actually changed
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

        // Only save if something actually changed
        if (nodesChanged || edgesChanged) {
            const logicData = {
                nodes: nodes.map((node) => ({
                    id: node.id,
                    position: node.position,
                })),
                edges: edges.map((edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    sourceHandle: edge.sourceHandle,
                    strokeDasharray: edge.style?.strokeDasharray,
                })),
            };
            updateData("logic", logicData);
            prevNodesRef.current = nodes;
            prevEdgesRef.current = edges;
        }
    }, [nodes, edges, updateData]);

    // Always consider valid (no required fields)
    useEffect(() => {
        onValidationChange?.(true);
    }, [onValidationChange]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Logic</h2>
                <p className="text-muted-foreground">
                    Connect questions and options to create conditional logic
                </p>
            </div>

            <div
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

            {questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No questions available. Please add questions first.</p>
                </div>
            )}
        </div>
    );
}
