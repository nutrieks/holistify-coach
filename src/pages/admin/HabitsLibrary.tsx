import { useState } from "react"
import { AdminLayout } from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Target } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

interface Habit {
  id: string
  habit_name: string
  description: string | null
  created_at: string
}

export default function HabitsLibrary() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newHabit, setNewHabit] = useState({ habit_name: "", description: "" })
  const [editHabit, setEditHabit] = useState({ habit_name: "", description: "" })

  // Fetch habits
  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('coach_id', profile?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!profile?.id
  })

  // Create habit
  const createHabit = useMutation({
    mutationFn: async (data: { habit_name: string; description: string }) => {
      const { error } = await supabase
        .from('habits')
        .insert({
          ...data,
          coach_id: profile?.id
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      setIsCreateOpen(false)
      setNewHabit({ habit_name: "", description: "" })
      toast({ title: "Navika kreirana uspješno" })
    },
    onError: () => {
      toast({ title: "Greška pri kreiranju navike", variant: "destructive" })
    }
  })

  // Update habit
  const updateHabit = useMutation({
    mutationFn: async (data: { id: string; habit_name: string; description: string }) => {
      const { id, ...updateData } = data
      const { error } = await supabase
        .from('habits')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      setIsEditOpen(false)
      setSelectedHabit(null)
      toast({ title: "Navika ažurirana uspješno" })
    },
    onError: () => {
      toast({ title: "Greška pri ažuriranju navike", variant: "destructive" })
    }
  })

  // Delete habit
  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      toast({ title: "Navika obrisana uspješno" })
    },
    onError: () => {
      toast({ title: "Greška pri brisanju navike", variant: "destructive" })
    }
  })

  const handleCreateHabit = () => {
    if (!newHabit.habit_name.trim()) return
    createHabit.mutate(newHabit)
  }

  const handleEditHabit = () => {
    if (!selectedHabit || !editHabit.habit_name.trim()) return
    updateHabit.mutate({
      id: selectedHabit.id,
      ...editHabit
    })
  }

  const openEditDialog = (habit: Habit) => {
    setSelectedHabit(habit)
    setEditHabit({
      habit_name: habit.habit_name,
      description: habit.description || ""
    })
    setIsEditOpen(true)
  }

  if (isLoading) {
    return (
      <AdminLayout title="Biblioteka Navika">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-lg">Učitavam...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Biblioteka Navika">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Upravljanje Navikama</h2>
            <p className="text-muted-foreground">
              Kreirajte i upravljajte navikama koje možete dodijeliti klijentima
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Navika
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kreiraj Novu Naviku</DialogTitle>
                <DialogDescription>
                  Unesite informacije o novoj navici
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="habit_name">Naziv Navike</Label>
                  <Input
                    id="habit_name"
                    value={newHabit.habit_name}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, habit_name: e.target.value }))}
                    placeholder="npr. Pijte 2L vode dnevno"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Opis</Label>
                  <Textarea
                    id="description"
                    value={newHabit.description}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detaljnije objašnjenje navike i zašto je važna"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Odustani
                </Button>
                <Button onClick={handleCreateHabit}>
                  Kreiraj
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Vaše Navike
            </CardTitle>
            <CardDescription>
              Pregled svih kreiranih navika koje možete dodijeliti klijentima
            </CardDescription>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nema kreiranih navika</p>
                <p className="text-sm">Kreirajte prvu naviku klikom na "Nova Navika"</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naziv Navike</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead>Kreirana</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {habits.map((habit) => (
                    <TableRow key={habit.id}>
                      <TableCell className="font-medium">{habit.habit_name}</TableCell>
                      <TableCell>
                        {habit.description ? (
                          <span className="text-sm text-muted-foreground">
                            {habit.description.length > 100 
                              ? `${habit.description.substring(0, 100)}...` 
                              : habit.description
                            }
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(habit.created_at).toLocaleDateString('hr-HR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(habit)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteHabit.mutate(habit.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Uredi Naviku</DialogTitle>
              <DialogDescription>
                Ažurirajte informacije o navici
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_habit_name">Naziv Navike</Label>
                <Input
                  id="edit_habit_name"
                  value={editHabit.habit_name}
                  onChange={(e) => setEditHabit(prev => ({ ...prev, habit_name: e.target.value }))}
                  placeholder="npr. Pijte 2L vode dnevno"
                />
              </div>
              <div>
                <Label htmlFor="edit_description">Opis</Label>
                <Textarea
                  id="edit_description"
                  value={editHabit.description}
                  onChange={(e) => setEditHabit(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detaljnije objašnjenje navike i zašto je važna"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Odustani
              </Button>
              <Button onClick={handleEditHabit}>
                Spremi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}