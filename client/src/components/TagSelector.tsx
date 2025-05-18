import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type Tag = {
  id: number;
  name: string;
};

interface TagSelectorProps {
  factCheckId?: number;
  selectedTagIds: number[];
  onTagsChange: (tagIds: number[]) => void;
  showAddNew?: boolean;
  readOnly?: boolean;
}

const TagSelector = ({
  factCheckId,
  selectedTagIds,
  onTagsChange,
  showAddNew = true,
  readOnly = false
}: TagSelectorProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all tags
  const { data: allTags = [], isLoading } = useQuery<Tag[]>({
    queryKey: ['/api/tags'],
    retry: false,
  });

  // Fetch tags for a specific fact check
  const { data: factCheckTags = [], isLoading: isLoadingFactCheckTags } = useQuery<Tag[]>({
    queryKey: ['/api/fact-checks', factCheckId, 'tags'],
    enabled: !!factCheckId,
    retry: false,
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/tags", {
        name: newTagName,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setNewTagName("");
      setIsDialogOpen(false);
      toast({
        title: "Tag created",
        description: "The tag has been created successfully"
      });
      
      // Add the new tag to selected tags
      onTagsChange([...selectedTagIds, data.id]);
    },
    onError: (error) => {
      toast({
        title: "Error creating tag",
        description: error instanceof Error ? error.message : "Failed to create tag",
        variant: "destructive"
      });
    }
  });

  // Add tag to fact check mutation
  const addTagToFactCheckMutation = useMutation({
    mutationFn: async ({ factCheckId, tagId }: { factCheckId: number, tagId: number }) => {
      const response = await apiRequest("POST", `/api/fact-checks/${factCheckId}/tags/${tagId}`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks', factCheckId, 'tags'] });
    },
    onError: (error) => {
      toast({
        title: "Error adding tag",
        description: error instanceof Error ? error.message : "Failed to add tag",
        variant: "destructive"
      });
    }
  });

  // Remove tag from fact check mutation
  const removeTagFromFactCheckMutation = useMutation({
    mutationFn: async ({ factCheckId, tagId }: { factCheckId: number, tagId: number }) => {
      const response = await apiRequest("DELETE", `/api/fact-checks/${factCheckId}/tags/${tagId}`, null);
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fact-checks', factCheckId, 'tags'] });
    },
    onError: (error) => {
      toast({
        title: "Error removing tag",
        description: error instanceof Error ? error.message : "Failed to remove tag",
        variant: "destructive"
      });
    }
  });

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the tag",
        variant: "destructive"
      });
      return;
    }
    
    createTagMutation.mutate();
  };

  const handleTagClick = (tagId: number) => {
    if (readOnly) return;
    
    if (selectedTagIds.includes(tagId)) {
      // Remove tag
      const newSelectedTags = selectedTagIds.filter(id => id !== tagId);
      onTagsChange(newSelectedTags);
      
      if (factCheckId) {
        removeTagFromFactCheckMutation.mutate({ factCheckId, tagId });
      }
    } else {
      // Add tag
      const newSelectedTags = [...selectedTagIds, tagId];
      onTagsChange(newSelectedTags);
      
      if (factCheckId) {
        addTagToFactCheckMutation.mutate({ factCheckId, tagId });
      }
    }
  };

  const filteredTags = allTags?.filter((tag: Tag) => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-grow relative">
          <Input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8"
            disabled={readOnly}
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery("")}
              disabled={readOnly}
            >
              <span className="material-icons text-sm">clear</span>
            </button>
          )}
        </div>
        
        {showAddNew && !readOnly && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <span className="material-icons text-sm mr-1">add</span>
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTag} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-name">Tag Name</Label>
                  <Input
                    id="tag-name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Enter tag name"
                    required
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
                    disabled={createTagMutation.isPending || !newTagName.trim()}
                  >
                    {createTagMutation.isPending ? "Creating..." : "Create Tag"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div>
        <ScrollArea className="h-40 border rounded-md p-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500">Loading tags...</p>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500">No tags found</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-1">
              {filteredTags.map((tag: Tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                  className={`cursor-${readOnly ? 'default' : 'pointer'}`}
                  onClick={() => !readOnly && handleTagClick(tag.id)}
                >
                  {tag.name}
                  {selectedTagIds.includes(tag.id) && !readOnly && (
                    <span className="ml-1 material-icons text-xs">close</span>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      
      {selectedTagIds.length > 0 && (
        <div className="text-sm text-gray-500">
          {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default TagSelector;