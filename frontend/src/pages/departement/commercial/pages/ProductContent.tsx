import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Package, AlertCircle, Search, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface Product {
  id: string;
  designation: string;
  quantite: number;
  seuilAlerte: number;
  prixUnitaire: number;
  fournisseur: string;
  imageUrl?: string;
  imageFile?: File | null;
}

const ProductContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    designation: '',
    quantite: 0,
    seuilAlerte: 5,
    prixUnitaire: 0,
    fournisseur: '',
    imageFile: null
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, imageFile: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpen = (product: Product | null = null) => {
    if (product) {
      setCurrentProductId(product.id);
      setFormData({
        designation: product.designation,
        quantite: product.quantite,
        seuilAlerte: product.seuilAlerte,
        prixUnitaire: product.prixUnitaire,
        fournisseur: product.fournisseur,
        imageUrl: product.imageUrl,
        imageFile: null
      });
      if (product.imageUrl) {
        setPreviewImage(product.imageUrl);
      }
    } else {
      setCurrentProductId(null);
      setFormData({
        designation: '',
        quantite: 0,
        seuilAlerte: 5,
        prixUnitaire: 0,
        fournisseur: '',
        imageFile: null
      });
      setPreviewImage(null);
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentProductId) {
      // Mise à jour du produit existant
      setProducts(products.map(p => 
        p.id === currentProductId ? { ...formData, id: currentProductId, imageUrl: previewImage || '' } : p
      ));
      Swal.fire({
        title: 'Succès!',
        text: 'Produit mis à jour avec succès',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {
      // Création d'un nouveau produit
      const newProduct: Product = {
        id: Date.now().toString(),
        ...formData,
        imageUrl: previewImage || ''
      };
      setProducts([...products, newProduct]);
      Swal.fire({
        title: 'Succès!',
        text: 'Produit ajouté avec succès',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    }
    
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Vous ne pourrez pas annuler cette action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts(products.filter(product => product.id !== id));
        Swal.fire(
          'Supprimé!',
          'Le produit a été supprimé.',
          'success'
        );
      }
    });
  };

  const getStockStatus = (quantite: number, seuilAlerte: number) => {
    if (quantite === 0) return 'Rupture';
    if (quantite <= seuilAlerte) return 'Stock faible';
    return 'En stock';
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Gestion des Produits</h2>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un produit..."
          className="w-full pl-8"
        />
      </div>

      {/* Tableau des produits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Liste des Produits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit enregistré</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un produit.</p>
              <div className="mt-6">
                <Button onClick={() => handleOpen()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un produit
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Désignation</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-right">Prix Unitaire</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.designation}
                            className="h-10 w-10 object-cover rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.designation}</TableCell>
                      <TableCell className="text-right">{product.quantite}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={getStockStatus(product.quantite, product.seuilAlerte) === 'En stock' ? 'default' : 
                                  getStockStatus(product.quantite, product.seuilAlerte) === 'Stock faible' ? 'secondary' : 'destructive'}
                          className={getStockStatus(product.quantite, product.seuilAlerte) === 'Stock faible' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                        >
                          {getStockStatus(product.quantite, product.seuilAlerte)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{product.prixUnitaire.toLocaleString()} FCFA</TableCell>
                      <TableCell>{product.fournisseur}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpen(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/modification */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentProductId ? "Modifier le produit" : "Ajouter un nouveau produit"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="designation">Désignation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantite">Quantité initiale *</Label>
                  <Input
                    id="quantite"
                    type="number"
                    min="0"
                    value={formData.quantite}
                    onChange={(e) =>
                      setFormData({ ...formData, quantite: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seuilAlerte">Niveau d'alerte *</Label>
                  <Input
                    id="seuilAlerte"
                    type="number"
                    min="0"
                    value={formData.seuilAlerte}
                    onChange={(e) =>
                      setFormData({ ...formData, seuilAlerte: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prixUnitaire">Prix Unitaire (FCFA) *</Label>
                <Input
                  id="prixUnitaire"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prixUnitaire}
                  onChange={(e) =>
                    setFormData({ ...formData, prixUnitaire: Number(e.target.value) })
                  }
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fournisseur">Fournisseur</Label>
                <Input
                  id="fournisseur"
                  value={formData.fournisseur}
                  onChange={(e) =>
                    setFormData({ ...formData, fournisseur: e.target.value })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label>Image du produit</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {(previewImage || formData.imageUrl) && (
                  <div className="mt-2">
                    <img
                      src={previewImage || formData.imageUrl}
                      alt="Aperçu de l'image"
                      className="h-32 w-32 object-cover rounded-md border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                {currentProductId ? "Mettre à jour" : "Ajouter le produit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductContent;