"use client";

import { useState } from "react";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { PageContainer } from "@/components/ui";
import RedundantCarts from "./RedundantCarts";
import AbandonedCarts from "./AbandonedCarts";

export default function Carts() {
  const [activeTab, setActiveTab] = useState("redundant");

  return (
    <PageContainer>
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="redundant" icon={ShoppingCart}>
              Redundant Carts
            </TabsTrigger>
            <TabsTrigger value="abandoned" icon={AlertTriangle}>
              Abandoned Carts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="redundant" className="mt-4">
            <RedundantCarts />
          </TabsContent>

          <TabsContent value="abandoned" className="mt-4">
            <AbandonedCarts />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

