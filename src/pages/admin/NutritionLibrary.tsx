import { useState } from "react"
import { AdminLayout } from "@/components/AdminLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { FoodDatabase } from "@/components/nutrition/FoodDatabase"
import { RecipeDatabase } from "@/components/nutrition/RecipeDatabase"

export default function NutritionLibrary() {
  return (
    <AdminLayout title="Nutrition Library">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nutrition Library</h2>
            <p className="text-muted-foreground">
              Upravljanje bazom namirnica i recepata
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/plans/nutrition/create">
              <Plus className="mr-2 h-4 w-4" />
              Kreiraj Plan Prehrane
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="food" className="space-y-4">
          <TabsList>
            <TabsTrigger value="food">Baza Namirnica</TabsTrigger>
            <TabsTrigger value="recipes">Baza Recepata</TabsTrigger>
          </TabsList>

          <TabsContent value="food" className="space-y-4">
            <FoodDatabase />
          </TabsContent>

          <TabsContent value="recipes" className="space-y-4">
            <RecipeDatabase />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}