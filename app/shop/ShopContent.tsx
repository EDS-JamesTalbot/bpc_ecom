"use client";

import Image from "next/image";
import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCart } from "../components/CartContext";
import { ImageCropper } from "../components/ImageCropper";
import { UniversalImageUploader } from "../components/UniversalImageUploader";
import { Pagination } from "../components/Pagination";
import { PageSizeSelector } from "../components/PageSizeSelector";
import { updateProduct, createProduct, deleteProduct } from "../actions/product-actions";
import type { Product } from "@/src/db/schema";
import { PAYMENT } from "@/lib/constants";

type ShopContentProps = {
  initialProducts: Product[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
};

export function ShopContent({ initialProducts, currentPage, totalPages, totalCount, pageSize }: ShopContentProps) {
  const { user } = useUser();
  const isAdminMode = user?.publicMetadata?.role === 'admin';
  
  const { addToCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [items, setItems] = useState(initialProducts);
  const [mounted, setMounted] = useState(false);

  const [quantities, setQuantities] = useState<Record<number, number>>(
    () => initialProducts.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
  );

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editValues, setEditValues] = useState({
    name: "",
    image: "",
    description: "",
    price: "",
    isActive: true,
  });
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);

  // Set mounted flag after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync items with initialProducts when it changes (after router.refresh())
  useEffect(() => {
    setItems(initialProducts);
    setQuantities(initialProducts.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {}));
  }, [initialProducts]);

  // Use initialProducts directly (already filtered server-side)
  const displayedProducts = items;

  const openEditor = (product: Product) => {
    setIsCreatingNew(false);
    setEditingProductId(product.id);
    setEditValues({
      name: product.name,
      image: product.image,
      description: product.description || "",
      price: product.price.toString(),
      isActive: product.isActive ?? true,
    });
  };

  const openNewProductForm = () => {
    setIsCreatingNew(true);
    setEditingProductId(null);
    setEditValues({
      name: "",
      image: "",
      description: "",
      price: "",
      isActive: true,
    });
  };

  const closeEditor = () => {
    setEditingProductId(null);
    setIsCreatingNew(false);
    setIsCropping(false);
    setTempImageUrl("");
  };

  const handleStartCrop = () => {
    if (editValues.image) {
      setTempImageUrl(editValues.image);
      setIsCropping(true);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setEditValues({ ...editValues, image: croppedImageUrl });
    setIsCropping(false);
    setTempImageUrl("");
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setTempImageUrl("");
  };

  const saveProductChanges = async () => {
    if (!isAdminMode) {
      alert("Admin authentication required. Please sign in with an admin account.");
      return;
    }

    if (!editValues.name.trim()) {
      alert("Please enter a product name");
      return;
    }

    if (!editValues.image.trim()) {
      alert("Please enter an image URL");
      return;
    }

    const price = Number(editValues.price);
    if (Number.isNaN(price) || price < 0) {
      alert("Please enter a valid price");
      return;
    }

    startTransition(async () => {
      try {
        if (isCreatingNew) {
          // Create new product (Clerk auth handled server-side)
          await createProduct({
            name: editValues.name,
            image: editValues.image.trim(),
            description: editValues.description,
            price: price,
            isActive: editValues.isActive,
          });

          // Refresh to get updated data from server
          router.refresh();
        } else if (editingProductId) {
          // Update existing product (Clerk auth handled server-side)
          await updateProduct({
            productId: editingProductId,
            name: editValues.name,
            image: editValues.image.trim(),
            description: editValues.description,
            price: price,
            isActive: editValues.isActive,
          });

          // Refresh to get updated data from server
          router.refresh();
        }

        closeEditor();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save product";
        alert(errorMessage);
      }
    });
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete({ id: product.id, name: product.name });
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const confirmDeleteProduct = async () => {
    if (!isAdminMode || !productToDelete) {
      alert("Admin authentication required. Please sign in with an admin account.");
      return;
    }

    startTransition(async () => {
      try {
        // Delete product (Clerk auth handled server-side)
        await deleteProduct({
          productId: productToDelete.id,
        });

        // Calculate new total count and pages after deletion
        const newTotalCount = totalCount - 1;
        const newTotalPages = Math.ceil(newTotalCount / pageSize);
        
        // If current page is now out of bounds, redirect to last valid page
        if (currentPage > newTotalPages && newTotalPages > 0) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", newTotalPages.toString());
          router.push(`/shop?${params.toString()}`);
        } else {
          // Otherwise just refresh to get updated data
          router.refresh();
        }
        
        closeDeleteModal();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete product";
        alert(errorMessage);
      }
    });
  };

  return (
    <div className="px-4 pt-6 pb-4 xl:pb-6 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 min-h-screen">
      <div className="mx-auto h-full max-w-[1800px]">

        {/* PAGE TITLE BANNER */}
        <section className="mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] p-8 md:p-12 shadow-lg text-center">
            <h1 className="text-5xl font-bold text-[#0c4a6e] mb-4">Our Collection</h1>
            <p className="text-xl text-[#475569]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </p>
          </div>
        </section>

        {/* PAGE SIZE SELECTOR AND PAGE INFO */}
        <section className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <PageSizeSelector currentPageSize={pageSize} totalCount={totalCount} />
            <span className="text-sm text-[#64748b] font-medium">
              Showing {displayedProducts.length} of {totalCount} products
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#64748b] font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </section>

        {/* PRODUCT GRID */}
        <section>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* ADD NEW PRODUCT CARD - First item in admin mode - only after mount */}
            {mounted && isAdminMode ? (
              <article 
                key="add-product-card"
                className="flex h-full min-h-[400px] flex-col rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100/50 p-5 shadow-lg ring-2 ring-primary ring-dashed transition-all hover:ring-[#1891E0] hover:shadow-xl"
              >
                <button
                  onClick={openNewProductForm}
                  className="flex h-full flex-col items-center justify-center gap-4 text-foreground/70 hover:text-foreground transition-colors"
                >
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-md">
                    <Plus className="h-16 w-16" strokeWidth={2} />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Add New Product</h2>
                    <p className="text-sm text-muted-foreground">
                      Click to create a new product
                    </p>
                  </div>
                </button>
              </article>
            ) : null}
            
            {displayedProducts.map((product) => {
              const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
              
              return (
                <article
                  key={product.id}
                  className="product-card flex h-full flex-col rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-5 shadow-lg ring-1 ring-blue-200/40 transition-all hover:ring-blue-300/60"
                >
                  {/* PRODUCT IMAGE */}
                  <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>

                  {/* TEXT + PRICE */}
                  <div className="flex flex-col gap-2 flex-1">
                    <h2 className="text-xl font-semibold text-[#0c4a6e]">
                      {product.name}
                    </h2>

                    <p className="text-sm text-[#475569] flex-1">
                      {product.description}
                    </p>

                    <div className="mt-2">
                      <span className="text-2xl font-semibold text-[#0c4a6e]">
                      ${price.toLocaleString(PAYMENT.CURRENCY_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-sm text-primary"> / each</span>
                      </span>
                    </div>
                  </div>

                  {/* QUANTITY SELECTOR */}
                  <div className="mt-4 flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-2 border-primary !bg-primary text-lg font-semibold !text-white hover:!bg-secondary-foreground hover:!border-secondary-foreground transition-all"
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: Math.max(1, (prev[product.id] ?? 1) - 1),
                          }))
                        }
                      >
                        –
                      </Button>

                      <span className="w-12 text-center text-lg font-semibold text-[#0c4a6e]">
                        {quantities[product.id]}
                      </span>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-2 border-primary !bg-primary text-lg font-semibold !text-white hover:!bg-secondary-foreground hover:!border-secondary-foreground transition-all"
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: (prev[product.id] ?? 1) + 1,
                          }))
                        }
                      >
                        +
                      </Button>
                    </div>

                  {/* BUTTONS */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Button
                      size="lg"
                      className="rounded-full text-base bg-[#bfdbfe] text-[#0c4a6e] font-semibold hover:!bg-[#0c4a6e] hover:!text-white shadow-md transition-all w-32"
                      onClick={() =>
                        addToCart({
                          productId: product.id,
                          productName: product.name,
                          price: price,
                          quantity: quantities[product.id] ?? 1,
                          image: product.image,
                        })
                      }
                    >
                      Add to cart
                    </Button>

                    {isAdminMode && (
                      <>
                        <Button
                          size="lg"
                          className="rounded-full text-base bg-[#bfdbfe] text-[#0c4a6e] font-semibold hover:!bg-[#0c4a6e] hover:!text-white shadow-md transition-all w-32"
                          onClick={() => openEditor(product)}
                        >
                          Edit
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="lg"
                          className="rounded-full text-base shadow-md transition-all w-12 bg-red-100 hover:bg-red-700 border-2 border-red-300"
                          onClick={() => openDeleteModal(product)}
                          disabled={isPending}
                        >
                          🗑️
                        </Button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            baseUrl="/shop"
          />
        </section>

      </div>

      {/* EDIT/CREATE MODAL */}
      <Dialog
        open={editingProductId !== null || isCreatingNew}
        onOpenChange={(open) => (!open ? closeEditor() : null)}
      >
        <DialogContent className="max-w-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] border-2 border-primary">
          <DialogHeader>
            <DialogTitle className="text-[#0c4a6e] text-xl font-semibold">
              {isCropping ? "Crop Image" : isCreatingNew ? "Create New Product" : "Edit Product Details"}
            </DialogTitle>
          </DialogHeader>

          {isCropping ? (
            <ImageCropper
              imageSrc={tempImageUrl}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
            />
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label className="text-[#0c4a6e] font-semibold">Product Name</Label>
                  <Input
                    value={editValues.name}
                    onChange={(e) =>
                      setEditValues({ ...editValues, name: e.target.value })
                    }
                    className="border-primary focus:border-[#1891E0] focus:ring-primary bg-white"
                  />
                </div>

                <UniversalImageUploader
                  value={editValues.image}
                  onChange={(url) => setEditValues({ ...editValues, image: url })}
                  label="Product Image"
                />

                {/* Crop Button - shown if image exists */}
                {editValues.image && (
                  <Button
                    onClick={handleStartCrop}
                    variant="outline"
                    className="w-full border-primary text-primary hover:!bg-primary hover:!text-white"
                  >
                    🔍 Zoom & Crop Image
                  </Button>
                )}

                <div>
                  <Label className="text-[#0c4a6e] font-semibold">Description</Label>
                  <Textarea
                    rows={3}
                    value={editValues.description}
                    onChange={(e) =>
                      setEditValues({ ...editValues, description: e.target.value })
                    }
                    className="border-primary focus:border-[#1891E0] focus:ring-primary bg-white"
                  />
                </div>

                <div>
                  <Label className="text-[#0c4a6e] font-semibold">Price each</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editValues.price}
                    onChange={(e) =>
                      setEditValues({ ...editValues, price: e.target.value })
                    }
                    className="border-primary focus:border-[#1891E0] focus:ring-primary bg-white"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-primary">
                  <div className="space-y-0.5">
                    <Label className="text-[#0c4a6e] font-semibold">
                      {editValues.isActive ? "Product Active" : "Product Not Active"}
                    </Label>
                    <p className="text-sm text-[#5A6A3E]">
                      {editValues.isActive 
                        ? "Product is available for purchase" 
                        : "Product is hidden from customers (Coming Soon)"}
                    </p>
                  </div>
                  <Switch
                    checked={editValues.isActive}
                    onCheckedChange={(checked) =>
                      setEditValues({ ...editValues, isActive: checked })
                    }
                    className="h-6 w-11 data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-end">
                <Button variant="outline" onClick={closeEditor} className="border-2 hover:bg-secondary-foreground hover:text-white hover:border-secondary-foreground transition-all">
                  Cancel
                </Button>
                <Button 
                  onClick={saveProductChanges} 
                  disabled={isPending}
                  className="!bg-primary !text-white hover:!bg-secondary-foreground hover:!text-white shadow"
                >
                  {isPending ? (isCreatingNew ? "Creating..." : "Saving...") : (isCreatingNew ? "Create Product" : "Save Changes")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={deleteModalOpen} onOpenChange={(open) => (!open ? closeDeleteModal() : null)}>
        <DialogContent className="max-w-md border-2 border-destructive/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Delete Product
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <p className="text-foreground">
              Are you sure you want to delete this product?
            </p>
            {productToDelete && (
              <div className="bg-white p-3 rounded-lg border border-border">
                <p className="font-semibold text-foreground">
                  {productToDelete.name}
                </p>
              </div>
            )}
            <p className="text-sm text-foreground">
              This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={closeDeleteModal}
              disabled={isPending}
              className="border-2 hover:bg-secondary-foreground hover:text-white hover:border-secondary-foreground transition-all"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteProduct}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? "Deleting..." : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
