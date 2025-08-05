import { AdminLayout } from "@/components/AdminLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExerciseDatabase } from "@/components/training/ExerciseDatabase"

export default function TrainingLibrary() {
  return (
    <AdminLayout title="Biblioteka Treninga">
      <div className="space-y-6">
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