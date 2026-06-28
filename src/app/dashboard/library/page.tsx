"use client";
import React, { useEffect, useState } from "react";
import { useLibraryStore, Library } from "@/store/useLibraryStore";
import { Button } from "@/vendors/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/vendors/ui/card";
import { Input } from "@/vendors/ui/input";
import { Progress } from "@/vendors/ui/progress";
import {
  Folder,
  Plus,
  Search,
  Star,
  Trash2,
  Edit2,
  X,
  Loader2,
  BookOpen,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function LibraryPage() {
  const {
    libraries,
    loading,
    error,
    fetchLibraries,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    toggleFavorite
  } = useLibraryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchLibraries();
  }, [fetchLibraries]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const success = await createLibrary(newName.trim(), newDescription.trim());
    if (success) {
      setNewName("");
      setNewDescription("");
      setIsCreateOpen(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLibrary || !editName.trim()) return;
    const success = await updateLibrary(selectedLibrary.id, {
      name: editName.trim(),
      description: editDescription.trim(),
    });
    if (success) {
      setSelectedLibrary(null);
      setIsEditOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLibrary) return;
    const success = await deleteLibrary(selectedLibrary.id);
    if (success) {
      setSelectedLibrary(null);
      setIsDeleteOpen(false);
    }
  };

  // Filter & Sort libraries
  const filteredLibraries = libraries
    .filter((lib) => {
      const matchesSearch =
        lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFavorite = !showFavoritesOnly || lib.is_favorite;
      return matchesSearch && matchesFavorite;
    })
    .sort((a, b) => {
      // Pin favorites to top
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-8 animate-fade-in relative min-h-full">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Practice Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your documents and files into learning collections.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-5 font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Library
        </Button>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/40 backdrop-blur-xs border border-border/40 p-4 rounded-2xl">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search libraries..."
            className="pl-10 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="rounded-xl font-semibold text-xs transition-colors flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
            {showFavoritesOnly ? "Showing Favorites" : "Filter Favorites"}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && libraries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 font-mono text-sm text-muted-foreground animate-pulse">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          Synchronizing library database...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold flex items-center gap-3">
          <X className="h-5 w-5 shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {/* Grid: Libraries */}
      {!loading && filteredLibraries.length === 0 ? (
        <Card className="shadow-xs border-border/60 py-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground mb-4">
            <Folder className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold">No libraries found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
            {searchQuery || showFavoritesOnly
              ? "Try adjusting your filters or search keywords."
              : "Get started by creating your first folder collection to group typing materials."}
          </p>
          {!searchQuery && !showFavoritesOnly && (
            <Button onClick={() => setIsCreateOpen(true)} size="sm" className="rounded-xl cursor-pointer">
              Create Library
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLibraries.map((lib) => (
            <Card
              key={lib.id}
              className="group hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
            >
              {/* Star corner indicator */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(lib.id, !lib.is_favorite);
                }}
                className={`absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer z-10`}
              >
                <Star
                  className={`h-4.5 w-4.5 ${
                    lib.is_favorite
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground/60 hover:text-yellow-500"
                  }`}
                />
              </button>

              <CardHeader className="space-y-2 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <Folder className="h-5.5 w-5.5 fill-current" />
                  </div>
                  <div className="min-w-0 pr-8">
                    <CardTitle className="text-lg font-black truncate">{lib.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Created {new Date(lib.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {lib.description || "No description provided."}
                </p>

                <div className="space-y-4">
                  {/* Progress status */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                      <span>Documents: {lib.document_count || 0}</span>
                      <span>Progress: 0%</span>
                    </div>
                    <Progress value={0} className="h-1.5 rounded-full" />
                  </div>

                  {/* Actions footer */}
                  <div className="pt-2 border-t border-border/30 flex justify-between items-center gap-2">
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLibrary(lib);
                          setEditName(lib.name);
                          setEditDescription(lib.description);
                          setIsEditOpen(true);
                        }}
                        className="h-8 w-8 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Edit Library"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLibrary(lib);
                          setIsDeleteOpen(true);
                        }}
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete Library"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <Link href={`/dashboard/library/${lib.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        Open Chapters
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* --- CREATE MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md shadow-2xl border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Library
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateOpen(false)}
                className="h-8 w-8 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCreate}>
              <CardContent className="space-y-4 pb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Library Name
                  </label>
                  <Input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Biology Semester 1, Code Exercises"
                    className="rounded-xl border-border/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What documents belong in this library?"
                    className="w-full min-h-[100px] p-3 text-sm bg-background border border-border/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl font-bold cursor-pointer">
                    Create
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditOpen && selectedLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md shadow-2xl border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                Edit Library Details
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedLibrary(null);
                  setIsEditOpen(false);
                }}
                className="h-8 w-8 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleEdit}>
              <CardContent className="space-y-4 pb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Library Name
                  </label>
                  <Input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Biology Semester 1"
                    className="rounded-xl border-border/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="What documents belong in this library?"
                    className="w-full min-h-[100px] p-3 text-sm bg-background border border-border/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedLibrary(null);
                      setIsEditOpen(false);
                    }}
                    className="rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl font-bold cursor-pointer">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
      {isDeleteOpen && selectedLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-sm shadow-2xl border-destructive/20 bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                Delete Library
              </CardTitle>
              <CardDescription>
                This action is irreversible. All documents inside this library will be unlinked or deleted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <p className="text-sm font-semibold">
                Are you sure you want to delete <span className="underline">{selectedLibrary.name}</span>?
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedLibrary(null);
                    setIsDeleteOpen(false);
                  }}
                  className="rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="rounded-xl font-bold cursor-pointer bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
