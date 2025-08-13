import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { AddFoodModal } from "./AddFoodModal"
import { EditFoodModal } from "./EditFoodModal"
import { useToast } from "@/hooks/use-toast"
import { TableSkeleton } from "@/components/TableSkeleton"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { useAsyncOperation } from "@/hooks/useAsyncOperation"
import type { Database } from "@/integrations/supabase/types"

type FoodItem = Database['public']['Tables']['food_database']['Row']

export function FoodDatabase() {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; food: FoodItem | null }>({ open: false, food: null })
  const { toast } = useToast()
  const { execute: executeDelete, loading: deleteLoading } = useAsyncOperation()

  useEffect(() => {
    fetchFoods()
  }, [])

  const fetchFoods = async () => {
    try {
      const { data, error } = await supabase
        .from('food_database')
        .select('*')
        .order('name')

      if (error) throw error
      setFoods(data || [])
    } catch (error) {
      console.error('Error fetching foods:', error)
      toast({
        title: "Error",
        description: "Failed to load food database",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (food: FoodItem) => {
    setDeleteDialog({ open: true, food })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.food) return
    
    await executeDelete(
      async () => {
        const { error } = await supabase
          .from('food_database')
          .delete()
          .eq('id', deleteDialog.food!.id)

        if (error) throw error
        
        setFoods(foods.filter(f => f.id !== deleteDialog.food!.id))
      },
      {
        successMessage: "Namirnica je uspješno obrisana",
        errorMessage: "Greška pri brisanju namirnice"
      }
    )
    
    setDeleteDialog({ open: false, food: null })
  }

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <TableSkeleton columns={7} rows={5} />
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Baza Namirnica
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj novu namirnicu
            </Button>
          </CardTitle>
          <CardDescription>
            Upravljanje bazom namirnica s nutritivnim vrijednostima
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži namirnice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Kalorije</TableHead>
                    <TableHead>Proteini (g)</TableHead>
                    <TableHead>Ugljikohidrati (g)</TableHead>
                    <TableHead>Masti (g)</TableHead>
                    <TableHead>Količina (g)</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFoods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        {searchTerm ? "Nema rezultata pretrage" : "Nema namirnica u bazi"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFoods.map((food) => (
                      <TableRow key={food.id}>
                        <TableCell className="font-medium">{food.name}</TableCell>
                        <TableCell>{food.calories}</TableCell>
                        <TableCell>{food.protein}</TableCell>
                        <TableCell>{food.carbs}</TableCell>
                        <TableCell>{food.fat}</TableCell>
                        <TableCell>{food.serving_size_grams}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingFood(food)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(food)}
                              disabled={deleteLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddFoodModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          fetchFoods()
          setShowAddModal(false)
        }}
      />

      <EditFoodModal
        food={editingFood}
        open={!!editingFood}
        onOpenChange={(open) => !open && setEditingFood(null)}
        onSuccess={() => {
          fetchFoods()
          setEditingFood(null)
        }}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, food: deleteDialog.food })}
        title="Obriši namirnicu"
        description={`Jeste li sigurni da želite obrisati "${deleteDialog.food?.name}"? Ova akcija se ne može poništiti.`}
        onConfirm={confirmDelete}
        confirmText="Obriši"
        cancelText="Odustani"
        variant="destructive"
      />
    </>
  )
}