import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, ChefHat } from "lucide-react"
import { AddRecipeModal } from "./AddRecipeModal"
import { EditRecipeModal } from "./EditRecipeModal"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/integrations/supabase/types"

type Recipe = Database['public']['Tables']['recipes']['Row']

export function RecipeDatabase() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('name')

      if (error) throw error
      setRecipes(data || [])
    } catch (error) {
      console.error('Error fetching recipes:', error)
      toast({
        title: "Error",
        description: "Failed to load recipes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj recept?')) return

    try {
      // First delete related recipe_ingredients
      await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id)

      // Then delete the recipe
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)

      if (error) throw error

      setRecipes(recipes.filter(recipe => recipe.id !== id))
      toast({
        title: "Success",
        description: "Recept je uspješno obrisan"
      })
    } catch (error) {
      console.error('Error deleting recipe:', error)
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive"
      })
    }
  }

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-lg">Učitavam...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Baza Recepata
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj novi recept
            </Button>
          </CardTitle>
          <CardDescription>
            Upravljanje receptima i njihovim sastojcima
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži recepte..."
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
                    <TableHead>Slika</TableHead>
                    <TableHead>Instrukcije</TableHead>
                    <TableHead>Kreiran</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {searchTerm ? "Nema rezultata pretrage" : "Nema recepata u bazi"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecipes.map((recipe) => (
                      <TableRow key={recipe.id}>
                        <TableCell className="font-medium">{recipe.name}</TableCell>
                        <TableCell>
                          {recipe.image_url ? (
                            <img 
                              src={recipe.image_url} 
                              alt={recipe.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <ChefHat className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {recipe.instructions || 'Nema instrukcija'}
                        </TableCell>
                        <TableCell>
                          {new Date(recipe.created_at).toLocaleDateString('hr-HR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingRecipe(recipe)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(recipe.id)}
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

      <AddRecipeModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          fetchRecipes()
          setShowAddModal(false)
        }}
      />

      <EditRecipeModal
        recipe={editingRecipe}
        open={!!editingRecipe}
        onOpenChange={(open) => !open && setEditingRecipe(null)}
        onSuccess={() => {
          fetchRecipes()
          setEditingRecipe(null)
        }}
      />
    </>
  )
}