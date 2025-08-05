import { AdminLayout } from "@/components/AdminLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { ExerciseDatabase } from "@/components/training/ExerciseDatabase"

export default function TrainingLibrary() {
  return (
    <AdminLayout title="Biblioteka Treninga">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Training Library</h2>
            <p className="text-muted-foreground">
              Upravljanje bazom vježbi
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/plans/training/create">
              <Plus className="mr-2 h-4 w-4" />
              Kreiraj Plan Treninga
            </Link>
          </Button>
        </div>
        <Tabs defaultValue="exercises" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="exercises">Baza Vježbi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exercises" className="space-y-4">
            <ExerciseDatabase />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}