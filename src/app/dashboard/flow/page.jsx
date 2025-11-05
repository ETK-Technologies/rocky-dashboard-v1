"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
    ReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Background,
    useReactFlow,
    Handle,
    Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus } from "lucide-react";
import { PageContainer, PageHeader, CustomButton } from "@/components/ui";

// Custom editable node component
function EditableNode({ id, data, selected }) {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || "");
    const inputRef = useRef(null);
    const { updateNodeData } = useReactFlow();

    // Sync label with data changes from outside
    useEffect(() => {
        if (!isEditing) {
            setLabel(data.label || "");
        }
    }, [data.label, isEditing]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        updateNodeData(id, { label });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setIsEditing(false);
            updateNodeData(id, { label });
        } else if (e.key === "Escape") {
            setLabel(data.label || "");
            setIsEditing(false);
        }
    };

    return (
        <div
            className={`px-4 py-2 shadow-md rounded-md bg-white dark:bg-gray-800 border-2 relative ${
                selected
                    ? "border-primary"
                    : "border-gray-300 dark:border-gray-600"
            }`}
            onDoubleClick={handleDoubleClick}
        >
            {/* Source handle (output) - on the bottom */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-primary border-2 border-white dark:border-gray-800"
            />

            {/* Target handle (input) - on the top */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-primary border-2 border-white dark:border-gray-800"
            />

            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none outline-none text-center font-semibold w-full"
                    style={{ minWidth: "80px" }}
                />
            ) : (
                <div className="text-center font-semibold text-gray-700 dark:text-gray-200 cursor-text">
                    {label || "Node"}
                </div>
            )}
        </div>
    );
}

const initialNodes = [
    {
        id: "n1",
        position: { x: 250, y: 0 },
        data: { label: "Node 1" },
        type: "editableNode",
    },
    {
        id: "n2",
        position: { x: 250, y: 150 },
        data: { label: "Node 2" },
        type: "editableNode",
    },
];

const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

const nodeTypes = {
    editableNode: EditableNode,
};

export default function FlowPage() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback(
        (changes) =>
            setNodes((nodesSnapshot) =>
                applyNodeChanges(changes, nodesSnapshot)
            ),
        []
    );

    const onEdgesChange = useCallback(
        (changes) =>
            setEdges((edgesSnapshot) =>
                applyEdgeChanges(changes, edgesSnapshot)
            ),
        []
    );

    const onConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        []
    );

    const onAddNode = useCallback(() => {
        const newNodeId = `n${nodes.length + 1}`;
        const newNode = {
            id: newNodeId,
            position: {
                x: Math.random() * 400,
                y: Math.random() * 400,
            },
            data: { label: `Node ${nodes.length + 1}` },
            type: "editableNode",
        };
        setNodes((nds) => [...nds, newNode]);
    }, [nodes.length]);

    return (
        <PageContainer>
            <PageHeader
                title="Flow"
                description="Manage and view your flows"
                action={
                    <CustomButton
                        onClick={onAddNode}
                        className="flex items-center gap-2"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Node
                    </CustomButton>
                }
            />
            <div
                className="relative border rounded-lg overflow-hidden"
                style={{
                    width: "100%",
                    height: "calc(100vh - 200px)",
                    minHeight: "600px",
                }}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
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
        </PageContainer>
    );
}
