import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Category = {
  id: number;
  name: string;
  description: string | null;
};

interface CategorySelectorProps {
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  showAddNew?: boolean;
}

const CategorySelector = ({ 
  selectedCategoryId, 
  onCategoryChange,
  showAddNew = true
}: CategorySelectorProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    retry: false,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/categories", {
        name: newCategoryName,
        description: newCategoryDescription || null
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setNewCategoryName("");
      setNewCategoryDescription("");
      setIsDialogOpen(false);
      toast({
        title: "Category created",
        description: "The category has been created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating category",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive"
      });
    }
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the category",
        variant: "destructive"
      });
      return;
    }
    
    createCategoryMutation.mutate();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-grow">
          <Select
            value={selectedCategoryId?.toString() || ""}
            onValueChange={(value) => onCategoryChange(value ? parseInt(value) : null)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {categories?.map((category: Category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {showAddNew && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <span className="material-icons text-sm mr-1">add</span>
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Name</Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Description (optional)</Label>
                  <Textarea
                    id="category-description"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Describe this category"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                  >
                    {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {selectedCategoryId && (
        <div className="text-sm text-gray-500">
          {categories?.find((c: Category) => c.id === selectedCategoryId)?.description}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;