import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface NutritionalDiagnosticsTabProps {
  clientId: string
}

export function NutritionalDiagnosticsTab({ clientId }: NutritionalDiagnosticsTabProps) {
  return (
    <Tabs defaultValue="macro" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="macro">Makronutritivna analiza</TabsTrigger>
        <TabsTrigger value="micro">Mikronutritivna analiza</TabsTrigger>
      </TabsList>

      <TabsContent value="macro" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Proteini */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Proteini</span>
                <Badge variant="secondary">g</Badge>
              </CardTitle>
              <CardDescription>Potrebe prema algoritmu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dnevne potrebe</span>
                  <span className="text-2xl font-bold">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Potrebe po obroku</span>
                  <span className="text-lg font-semibold">--</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Algoritam za izračun će biti implementiran uskoro
              </p>
            </CardContent>
          </Card>

          {/* Masti */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Masti</span>
                <Badge variant="secondary">g</Badge>
              </CardTitle>
              <CardDescription>Potrebe prema algoritmu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dnevne potrebe</span>
                  <span className="text-2xl font-bold">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Potrebe po obroku</span>
                  <span className="text-lg font-semibold">--</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Algoritam za izračun će biti implementiran uskoro
              </p>
            </CardContent>
          </Card>

          {/* Ugljikohidrati */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ugljikohidrati</span>
                <Badge variant="secondary">g</Badge>
              </CardTitle>
              <CardDescription>Potrebe prema algoritmu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dnevne potrebe</span>
                  <span className="text-2xl font-bold">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Potrebe po obroku</span>
                  <span className="text-lg font-semibold">--</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Algoritam za izračun će biti implementiran uskoro
              </p>
            </CardContent>
          </Card>

          {/* Vlakna */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Vlakna</span>
                <Badge variant="secondary">g</Badge>
              </CardTitle>
              <CardDescription>Potrebe prema algoritmu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dnevne potrebe</span>
                  <span className="text-2xl font-bold">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Potrebe po obroku</span>
                  <span className="text-lg font-semibold">--</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Algoritam za izračun će biti implementiran uskoro
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="micro">
        <Card>
          <CardHeader>
            <CardTitle>Mikronutritivna analiza</CardTitle>
            <CardDescription>Analiza vitamina i minerala</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>Mikronutritivna analiza će biti implementirana uskoro</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
