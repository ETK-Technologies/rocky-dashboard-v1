"use client";

import { PageForm } from "@/features/pages";
import { useParams } from "next/navigation";

export default function EditPagePage() {
    const params = useParams();
    const pageId = params.id;

    return <PageForm pageId={pageId} />;
}
