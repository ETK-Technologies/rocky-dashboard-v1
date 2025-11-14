"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, Key } from "lucide-react";
import {
    PageContainer,
    PageHeader,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    LoadingState,
} from "@/components/ui";
import { RolesTable } from "@/features/roles/components/RolesTable";
import { PermissionsTable } from "@/features/permissions/components/PermissionsTable";

function RolesAndPermissionsContent() {
    const searchParams = useSearchParams();
    const tabFromQuery = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tabFromQuery || "roles");

    useEffect(() => {
        if (tabFromQuery) {
            setActiveTab(tabFromQuery);
        }
    }, [tabFromQuery]);

    return (
        <PageContainer>
            <PageHeader
                title="Roles and Permissions"
                description="Manage roles and permissions for your system. Control access and define what users can do."
            />

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mt-6"
            >
                <TabsList className="mb-6">
                    <TabsTrigger value="roles" icon={Shield}>
                        Roles
                    </TabsTrigger>
                    <TabsTrigger value="permissions" icon={Key}>
                        Permissions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="roles">
                    <RolesTable />
                </TabsContent>

                <TabsContent value="permissions">
                    <PermissionsTable />
                </TabsContent>
            </Tabs>
        </PageContainer>
    );
}

export default function RolesAndPermissionsPage() {
    return (
        <Suspense
            fallback={
                <PageContainer>
                    <LoadingState fullScreen={true} loading={true} />
                </PageContainer>
            }
        >
            <RolesAndPermissionsContent />
        </Suspense>
    );
}
