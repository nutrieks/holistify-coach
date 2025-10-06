import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface CategoryItem {
  id: string
  name: string
  quantity: number
}

interface AddCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCategory: (item: CategoryItem) => void
}

interface FoodCategory {
  id: string
  category_name: string
  standard_portion_size: string | null
  avg_calories: number | null
  avg_protein: number | null
  avg_carbs: number | null
  avg_fats: number | null
}

export function AddCategoryModal({ open, onOpenChange, onAddCategory }: AddCategoryModalProps) {
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<FoodCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [quantity, setQuantity] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('food_categories')
        .select('*')
        .order('category_name')

      if (error) throw error
      setCategories(data || [])
      setFilteredCategories(data || [])
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno dohvaćanje kategorija",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    if (open) {
      fetchCategories()
      setSearchTerm("")
      setSelectedCategory("")
      setQuantity("")
    }
  }, [open])

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCategories(filtered)
  }, [searchTerm, categories])

  const handleAdd = () => {
    if (!selectedCategory) {
      toast({
        title: "Greška",
        description: "Molim odaberite kategoriju",
        variant: "destructive"
      })
      return
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Greška",
        description: "Molim unesite važeću količinu",
        variant: "destructive"
      })
      return
    }

    const category = categories.find(c => c.id === selectedCategory)
    if (!category) return

    onAddCategory({
      id: category.id,
      name: category.category_name,
      quantity: parseFloat(quantity)
    })

    onOpenChange(false)
    setSearchTerm("")
    setSelectedCategory("")
    setQuantity("")
  }

  const selectedCategoryData = categories.find(c => c.id === selectedCategory)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Dodaj Kategoriju Namirnica</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Pretraži kategorije</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Pretraži po imenu kategorije..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Odaberi kategoriju</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberite kategoriju namirnica" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-60">
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex flex-col">
                        <span>{category.category_name}</span>
                        {category.standard_portion_size && (
                          <span className="text-xs text-muted-foreground">
                            {category.standard_portion_size}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          {selectedCategoryData && (
            <div className="p-3 bg-muted rounded-md space-y-2">
              <h4 className="font-medium">{selectedCategoryData.category_name}</h4>
              {selectedCategoryData.standard_portion_size && (
                <p className="text-sm text-muted-foreground">
                  Standardna porcija: {selectedCategoryData.standard_portion_size}
                </p>
              )}
              {selectedCategoryData.avg_calories && (
                <div className="text-sm">
                  <p>Prosječne vrijednosti po porciji:</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <span>{selectedCategoryData.avg_calories} kcal</span>
                    <span>P: {selectedCategoryData.avg_protein || 0}g</span>
                    <span>C: {selectedCategoryData.avg_carbs || 0}g</span>
                    <span>F: {selectedCategoryData.avg_fats || 0}g</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="quantity">Količina</Label>
            <Input
              id="quantity"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Unesite količinu..."
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {selectedCategoryData?.standard_portion_size && (
              <p className="text-xs text-muted-foreground mt-1">
                Izraziti u {selectedCategoryData.standard_portion_size}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleAdd} disabled={loading} className="flex-1">
              Dodaj Kategoriju
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}