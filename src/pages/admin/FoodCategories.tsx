import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface FoodCategory {
  id: string
  category_name: string
  parent_category_id: string | null
  avg_calories: number | null
  avg_protein: number | null
  avg_carbs: number | null
  avg_fat: number | null
  standard_portion_size: string | null
  coach_id: string
  created_at: string
  parent_category?: {
    category_name: string
  } | null
}

export default function FoodCategories() {
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<FoodCategory | null>(null)
  const [formData, setFormData] = useState({
    category_name: "",
    parent_category_id: "",
    avg_calories: "",
    avg_protein: "",
    avg_carbs: "",
    avg_fat: "",
    standard_portion_size: ""
  })
  const { toast } = useToast()

  const fetchCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('food_categories')
        .select(`
          *,
          parent_category:food_categories!parent_category_id(category_name)
        `)
        .eq('coach_id', user.id)
        .order('category_name')

      if (error) throw error
      setCategories(data || [])
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno dohvaćanje kategorija",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const resetForm = () => {
    setFormData({
      category_name: "",
      parent_category_id: "",
      avg_calories: "",
      avg_protein: "",
      avg_carbs: "",
      avg_fat: "",
      standard_portion_size: ""
    })
    setEditingCategory(null)
  }

  const handleOpenModal = (category?: FoodCategory) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        category_name: category.category_name,
        parent_category_id: category.parent_category_id || "",
        avg_calories: category.avg_calories?.toString() || "",
        avg_protein: category.avg_protein?.toString() || "",
        avg_carbs: category.avg_carbs?.toString() || "",
        avg_fat: category.avg_fat?.toString() || "",
        standard_portion_size: category.standard_portion_size || ""
      })
    } else {
      resetForm()
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category_name.trim()) {
      toast({
        title: "Greška",
        description: "Ime kategorije je obavezno",
        variant: "destructive"
      })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const categoryData = {
        category_name: formData.category_name,
        parent_category_id: formData.parent_category_id || null,
        avg_calories: formData.avg_calories ? parseFloat(formData.avg_calories) : null,
        avg_protein: formData.avg_protein ? parseFloat(formData.avg_protein) : null,
        avg_carbs: formData.avg_carbs ? parseFloat(formData.avg_carbs) : null,
        avg_fat: formData.avg_fat ? parseFloat(formData.avg_fat) : null,
        standard_portion_size: formData.standard_portion_size || null,
        coach_id: user.id
      }

      if (editingCategory) {
        const { error } = await supabase
          .from('food_categories')
          .update(categoryData)
          .eq('id', editingCategory.id)

        if (error) throw error
        
        toast({
          title: "Uspjeh",
          description: "Kategorija je uspješno ažurirana"
        })
      } else {
        const { error } = await supabase
          .from('food_categories')
          .insert(categoryData)

        if (error) throw error
        
        toast({
          title: "Uspjeh",
          description: "Kategorija je uspješno kreirana"
        })
      }

      setModalOpen(false)
      resetForm()
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Dogodila se greška prilikom spremanja kategorije",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovu kategoriju?")) return

    try {
      const { error } = await supabase
        .from('food_categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      toast({
        title: "Uspjeh",
        description: "Kategorija je uspješno obrisana"
      })
      
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Greška prilikom brisanja kategorije",
        variant: "destructive"
      })
    }
  }

  const parentCategories = categories.filter(cat => !cat.parent_category_id)

  return (
    <AdminLayout title="Kategorije Namirnica">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/nutrition">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Natrag na Nutrition Library
              </Link>
            </Button>
          </div>
          
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Kategorija
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Uredi Kategoriju" : "Nova Kategorija"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category_name">Ime Kategorije *</Label>
                    <Input
                      id="category_name"
                      value={formData.category_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value }))}
                      placeholder="npr. Proteini, Ugljikohidrati..."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="parent_category">Nadkategorija</Label>
                    <Select
                      value={formData.parent_category_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, parent_category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberite nadkategoriju (opcionalno)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nema nadkategorije</SelectItem>
                        {parentCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="standard_portion_size">Standardna Porcija</Label>
                  <Input
                    id="standard_portion_size"
                    value={formData.standard_portion_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, standard_portion_size: e.target.value }))}
                    placeholder="npr. 1 šalica, 150g, 1 šaka..."
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="avg_calories">Prosječne Kalorije</Label>
                    <Input
                      id="avg_calories"
                      type="number"
                      step="0.1"
                      value={formData.avg_calories}
                      onChange={(e) => setFormData(prev => ({ ...prev, avg_calories: e.target.value }))}
                      placeholder="kcal"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="avg_protein">Prosječni Proteini</Label>
                    <Input
                      id="avg_protein"
                      type="number"
                      step="0.1"
                      value={formData.avg_protein}
                      onChange={(e) => setFormData(prev => ({ ...prev, avg_protein: e.target.value }))}
                      placeholder="g"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="avg_carbs">Prosječni Ugljikohidrati</Label>
                    <Input
                      id="avg_carbs"
                      type="number"
                      step="0.1"
                      value={formData.avg_carbs}
                      onChange={(e) => setFormData(prev => ({ ...prev, avg_carbs: e.target.value }))}
                      placeholder="g"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="avg_fat">Prosječne Masti</Label>
                    <Input
                      id="avg_fat"
                      type="number"
                      step="0.1"
                      value={formData.avg_fat}
                      onChange={(e) => setFormData(prev => ({ ...prev, avg_fat: e.target.value }))}
                      placeholder="g"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCategory ? "Ažuriraj" : "Kreiraj"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Odustani
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kategorije Namirnica</CardTitle>
            <CardDescription>
              Upravljajte kategorijama namirnica za fleksibilne planove prehrane
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Učitavam kategorije...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nema kreiranih kategorija</p>
                <p className="text-sm">Kreirajte prvu kategoriju da biste započeli</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategorija</TableHead>
                    <TableHead>Nadkategorija</TableHead>
                    <TableHead>Standardna Porcija</TableHead>
                    <TableHead>Prosječne Vrijednosti</TableHead>
                    <TableHead className="w-[100px]">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.category_name}
                      </TableCell>
                      <TableCell>
                        {category.parent_category ? (
                          <Badge variant="secondary">
                            {category.parent_category.category_name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {category.standard_portion_size || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {category.avg_calories ? (
                          <div className="text-sm space-y-1">
                            <div>{category.avg_calories} kcal</div>
                            <div className="text-muted-foreground">
                              P: {category.avg_protein || 0}g, 
                              C: {category.avg_carbs || 0}g, 
                              F: {category.avg_fat || 0}g
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}