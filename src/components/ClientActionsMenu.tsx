import { MoreVertical, Archive, ArchiveRestore, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ConfirmDialog } from "./ConfirmDialog"
import { useClientActions } from "@/hooks/useClientActions"

interface ClientActionsMenuProps {
  clientUserId: string
  clientName: string
  isArchived: boolean
  onActionComplete?: () => void
}

export function ClientActionsMenu({ 
  clientUserId, 
  clientName, 
  isArchived,
  onActionComplete 
}: ClientActionsMenuProps) {
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeleteDoubleConfirm, setShowDeleteDoubleConfirm] = useState(false)
  
  const { archiveClient, unarchiveClient, deleteClient, loading } = useClientActions()

  const handleArchive = async () => {
    const success = isArchived 
      ? await unarchiveClient(clientUserId, clientName)
      : await archiveClient(clientUserId, clientName)
    
    if (success) {
      onActionComplete?.()
    }
  }

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false)
    setShowDeleteDoubleConfirm(true)
  }

  const handleDelete = async () => {
    await deleteClient(clientUserId, clientName)
    onActionComplete?.()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={loading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowArchiveConfirm(true)}>
            {isArchived ? (
              <>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Reaktiviraj klijenta
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Arhiviraj klijenta
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteConfirm(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Obriši klijenta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive Confirm */}
      <ConfirmDialog
        open={showArchiveConfirm}
        onOpenChange={setShowArchiveConfirm}
        title={isArchived ? "Reaktiviraj klijenta?" : "Arhiviraj klijenta?"}
        description={
          isArchived
            ? `Klijent ${clientName} će biti reaktiviran i ponovno će se prikazivati u aktivnoj listi.`
            : `Klijent ${clientName} će biti arhiviran. Moći ćete ga kasnije reaktivirati.`
        }
        onConfirm={handleArchive}
        confirmText={isArchived ? "Reaktiviraj" : "Arhiviraj"}
      />

      {/* Delete First Confirm */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Obriši klijenta?"
        description={`Jeste li sigurni da želite trajno obrisati klijenta ${clientName}? Ova akcija će obrisati SVE podatke klijenta.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Nastavi"
        variant="destructive"
      />

      {/* Delete Double Confirm */}
      <ConfirmDialog
        open={showDeleteDoubleConfirm}
        onOpenChange={setShowDeleteDoubleConfirm}
        title="KONAČNA POTVRDA - Obriši klijenta"
        description={`OVO JE NEPOVRATNA AKCIJA! Svi podaci klijenta ${clientName} će biti trajno obrisani: treninzi, planovi prehrane, upitnici, napredak, poruke. Jeste li APSOLUTNO sigurni?`}
        onConfirm={handleDelete}
        confirmText="DA, TRAJNO OBRIŠI"
        cancelText="NE, ODUSTANI"
        variant="destructive"
      />
    </>
  )
}
