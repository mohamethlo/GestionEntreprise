import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Package, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
}

const API_URL = "http://localhost:5000/api/products"; 

const ProductContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    designation: string;
    quantite: number;
    seuilAlerte: number;
    prixUnitaire: number;
    fournisseur: string;
    imageFile: File | null;
  }>({
    designation: "",
    quantite: 0,
    seuilAlerte: 5,
    prixUnitaire: 0,
    fournisseur: "",
    imageFile: null,
  });

  // 🔹 Charger la liste des produits au montage
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      // 🔹 Mapping : Les noms de champs correspondent aux clés du backend Flask
      const mappedProducts = data.map((p: any) => ({
        id: String(p.id),
        designation: p.name,
        quantite: p.quantity,
        seuilAlerte: p.alert_quantity,
        prixUnitaire: p.unit_price,
        fournisseur: p.supplier,
        imageUrl: p.image_path ? `http://localhost:5000/${p.image_path}` : null, 
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    }
  };

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
        imageFile: null,
      });
      setPreviewImage(product.imageUrl || null);
    } else {
      setCurrentProductId(null);
      setFormData({
        designation: "",
        quantite: 0,
        seuilAlerte: 5,
        prixUnitaire: 0,
        fournisseur: "",
        imageFile: null,
      });
      setPreviewImage(null);
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    // Clés alignées sur le modèle Flask
    form.append("name", formData.designation);
    form.append("quantity", String(formData.quantite)); 
    form.append("alert_quantity", String(formData.seuilAlerte));
    form.append("unit_price", String(formData.prixUnitaire));
    form.append("supplier", formData.fournisseur); 
    if (formData.imageFile) form.append("image", formData.imageFile); 

    try {
      if (currentProductId) {
        await fetch(`${API_URL}/${currentProductId}`, {
          method: "PUT",
          body: form,
        });
        Swal.fire("Succès!", "Produit mis à jour avec succès", "success");
      } else {
        await fetch(API_URL, {
          method: "POST",
          body: form,
        });
        Swal.fire("Succès!", "Produit ajouté avec succès", "success");
      }

      setOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Erreur sauvegarde produit:", error);
      Swal.fire("Erreur!", "Impossible d'enregistrer le produit", "error");
    }
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Vous ne pourrez pas annuler cette action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${API_URL}/${id}`, { method: "DELETE" });
          Swal.fire("Supprimé!", "Le produit a été supprimé.", "success");
          fetchProducts();
        } catch (error) {
          console.error("Erreur suppression:", error);
          Swal.fire("Erreur!", "Impossible de supprimer le produit", "error");
        }
      }
    });
  };

  // 🔹 Fonction d'aide pour le statut
  const getProductStatus = (quantite: number, seuilAlerte: number) => {
    if (quantite === 0) return { label: "Rupture", variant: "destructive", className: "" };
    if (quantite <= seuilAlerte)
      return {
        label: "Stock faible",
        variant: "secondary",
        className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      };
    return { label: "En stock", variant: "default", className: "" };
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Gestion des Produits
        </h2>
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
          value={""} 
          onChange={() => {}} 
        /> 
      </div>

      {/* Tableau */}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucun produit enregistré
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter un produit.
              </p>
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
                  {products.map((product) => {
                    // 1. Récupération ultra-robuste des valeurs
                    const quantite = Number(product.quantite) || 0;
                    const prixUnitaire = Number(product.prixUnitaire) || 0;
                    const fournisseur = (product.fournisseur && String(product.fournisseur).trim() !== '') ? product.fournisseur : "-";

                    const status = getProductStatus(
                      quantite,
                      product.seuilAlerte ?? 5
                    );
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.designation ?? "Produit"}
                              className="h-10 w-10 object-cover rounded-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.designation ?? "-"}
                        </TableCell>
                        
                        {/* 🟢 CORRECTION : AFFICHAGE DE LA QUANTITÉ */}
                        <TableCell className="text-right font-medium">
                          {quantite}
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Badge
                            // @ts-ignore
                            variant={status.variant} 
                            className={status.className}
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        
                        {/* 🟢 CORRECTION : AFFICHAGE DU PRIX UNITAIRE */}
                        <TableCell className="text-right font-medium">
                          {prixUnitaire.toLocaleString('fr-FR', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}{' '}
                          FCFA
                        </TableCell>
                        
                        {/* 🟢 CORRECTION : AFFICHAGE DU FOURNISSEUR */}
                        <TableCell>
                          {fournisseur}
                        </TableCell>
                        
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentProductId ? "Modifier le produit" : "Ajouter un nouveau produit"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulaire pour l'ajout ou la modification d'un produit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="designation">Désignation *</Label>
                <Input
                  id="designation"
                  value={formData.designation ?? ""} 
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantite">Quantité *</Label>
                  <Input
                    id="quantite"
                    type="number"
                    min="0"
                    value={formData.quantite} 
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantite: Number(e.target.value),
                      })
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
                      setFormData({
                        ...formData,
                        seuilAlerte: Number(e.target.value),
                      })
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
                    setFormData({
                      ...formData,
                      prixUnitaire: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fournisseur">Fournisseur</Label>
                <Input
                  id="fournisseur"
                  value={formData.fournisseur ?? ""} 
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
                {previewImage && (
                  <div className="mt-2">
                    <img
                      src={previewImage}
                      alt="Aperçu"
                      className="h-32 w-32 object-cover rounded-md border"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).style.display = "none")
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
